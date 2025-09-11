import { google, drive_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { createAdminClient } from '@/lib/supabase/admin';
import { decrypt, encrypt, isEncrypted } from '@/lib/utils/encryption';

export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
}

export interface WeddingFolders {
  rootFolderId: string;
  photosFolderId: string;
  brideFolderId: string;
  groomFolderId: string;
  togetherFolderId: string;
}

export class GoogleDriveService {
  private drive: drive_v3.Drive;
  private oauth2Client: OAuth2Client;
  private weddingId: string;

  constructor(accessToken: string, refreshToken: string, weddingId: string) {
    this.weddingId = weddingId;
    
    // Initialize OAuth2 client
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/auth/google/callback`
    );

    // Set credentials
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    // Initialize Drive API
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Create Google Drive service from wedding slug
   */
  static async fromWeddingSlug(weddingSlug: string): Promise<GoogleDriveService | null> {
    const supabase = createAdminClient();
    
    // Get wedding ID from slug
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('slug', weddingSlug)
      .single();

    if (!wedding) {
      console.error('Wedding not found for slug:', weddingSlug);
      return null;
    }

    // Get Google Drive credentials
    const { data: driveConfig } = await supabase
      .from('wedding_google_drive')
      .select('*')
      .eq('wedding_id', wedding.id)
      .eq('is_active', true)
      .single();

    if (!driveConfig) {
      console.error('Google Drive not connected for wedding:', weddingSlug);
      return null;
    }

    // Decrypt tokens if encrypted
    let accessToken = driveConfig.access_token;
    let refreshToken = driveConfig.refresh_token;
    
    if (isEncrypted(accessToken)) {
      try {
        accessToken = decrypt(accessToken);
      } catch (error) {
        console.error('Failed to decrypt access token:', error);
        return null;
      }
    }
    
    if (isEncrypted(refreshToken)) {
      try {
        refreshToken = decrypt(refreshToken);
      } catch (error) {
        console.error('Failed to decrypt refresh token:', error);
        return null;
      }
    }

    // Check if token needs refresh (with 5 minute buffer)
    const tokenExpiresAt = new Date(driveConfig.token_expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    if (tokenExpiresAt <= fiveMinutesFromNow) {
      // Token expired or expiring soon, needs refresh
      const refreshedService = await GoogleDriveService.refreshAccessToken(
        refreshToken,
        wedding.id
      );
      
      if (refreshedService) {
        return refreshedService;
      }
      
      console.error('Failed to refresh token for wedding:', weddingSlug);
      return null;
    }

    return new GoogleDriveService(
      accessToken,
      refreshToken,
      wedding.id
    );
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    refreshToken: string,
    weddingId: string
  ): Promise<GoogleDriveService | null> {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID!,
        process.env.GOOGLE_CLIENT_SECRET!,
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/auth/google/callback`
      );

      oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      // Get new access token
      let credentials;
      try {
        const response = await oauth2Client.refreshAccessToken();
        credentials = response.credentials;
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError);
        
        // Check if refresh token is invalid
        if (refreshError.message?.includes('invalid_grant') || 
            refreshError.code === 400) {
          // Mark the connection as inactive
          const supabase = createAdminClient();
          await supabase
            .from('wedding_google_drive')
            .update({ is_active: false })
            .eq('wedding_id', weddingId);
          
          console.error('Refresh token is invalid, marked connection as inactive');
        }
        
        return null;
      }
      
      if (!credentials.access_token) {
        console.error('No access token received from refresh');
        return null;
      }

      // Encrypt and update database with new token
      const supabase = createAdminClient();
      const tokenExpiresAt = credentials.expiry_date
        ? new Date(credentials.expiry_date)
        : new Date(Date.now() + 3600 * 1000); // Default 1 hour

      const encryptedAccessToken = encrypt(credentials.access_token);
      
      const { error: updateError } = await supabase
        .from('wedding_google_drive')
        .update({
          access_token: encryptedAccessToken,
          token_expires_at: tokenExpiresAt.toISOString(),
        })
        .eq('wedding_id', weddingId);

      if (updateError) {
        console.error('Failed to update token in database:', updateError);
        return null;
      }

      console.log('Token refreshed successfully for wedding:', weddingId);
      
      return new GoogleDriveService(
        credentials.access_token,
        refreshToken,
        weddingId
      );
    } catch (error) {
      console.error('Unexpected error refreshing access token:', error);
      return null;
    }
  }

  /**
   * Create folder structure for wedding
   */
  async createWeddingFolders(weddingSlug: string): Promise<WeddingFolders | null> {
    try {
      // Create root folder
      const rootFolderName = `Memory Album - ${weddingSlug}`;
      const rootFolder = await this.createFolder(rootFolderName);
      
      if (!rootFolder) {
        throw new Error('Failed to create root folder');
      }

      // Create subfolders
      const [photosFolder, brideFolder, groomFolder, togetherFolder] = await Promise.all([
        this.createFolder('All Photos', rootFolder.id),
        this.createFolder('Bride Memories', rootFolder.id),
        this.createFolder('Groom Memories', rootFolder.id),
        this.createFolder('Together Memories', rootFolder.id),
      ]);

      if (!photosFolder || !brideFolder || !groomFolder || !togetherFolder) {
        throw new Error('Failed to create subfolders');
      }

      const folders: WeddingFolders = {
        rootFolderId: rootFolder.id,
        photosFolderId: photosFolder.id,
        brideFolderId: brideFolder.id,
        groomFolderId: groomFolder.id,
        togetherFolderId: togetherFolder.id,
      };

      // Store folder IDs in database
      const supabase = createAdminClient();
      await supabase
        .from('wedding_google_drive')
        .update({
          root_folder_id: folders.rootFolderId,
          photos_folder_id: folders.photosFolderId,
          bride_folder_id: folders.brideFolderId,
          groom_folder_id: folders.groomFolderId,
          together_folder_id: folders.togetherFolderId,
        })
        .eq('wedding_id', this.weddingId);

      return folders;
    } catch (error) {
      console.error('Error creating wedding folders:', error);
      return null;
    }
  }

  /**
   * Create a folder in Google Drive
   */
  async createFolder(name: string, parentId?: string): Promise<DriveFolder | null> {
    try {
      // Check if folder already exists
      const existingFolder = await this.findFolder(name, parentId);
      if (existingFolder) {
        return existingFolder;
      }

      // Create new folder
      const fileMetadata: drive_v3.Schema$File = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentId && { parents: [parentId] }),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name',
      });

      if (response.data.id) {
        return {
          id: response.data.id,
          name: response.data.name || name,
        };
      }

      return null;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }

  /**
   * Find a folder by name
   */
  async findFolder(name: string, parentId?: string): Promise<DriveFolder | null> {
    try {
      let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name)',
        spaces: 'drive',
      });

      if (response.data.files && response.data.files.length > 0) {
        const file = response.data.files[0];
        if (file.id) {
          return {
            id: file.id,
            name: file.name || name,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding folder:', error);
      return null;
    }
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folderId: string
  ): Promise<DriveUploadResult> {
    try {
      const fileMetadata: drive_v3.Schema$File = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType,
        body: fileBuffer,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      });

      if (response.data.id) {
        return {
          success: true,
          fileId: response.data.id,
        };
      }

      return {
        success: false,
        error: 'No file ID returned',
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload photo from URL
   */
  async uploadPhotoFromUrl(
    photoUrl: string,
    fileName: string,
    folderId: string
  ): Promise<DriveUploadResult> {
    try {
      // Fetch the photo
      const response = await fetch(photoUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch photo: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = response.headers.get('content-type') || 'image/jpeg';

      return await this.uploadFile(buffer, fileName, mimeType, folderId);
    } catch (error) {
      console.error('Error uploading photo from URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get upload folder ID based on memory type
   */
  async getUploadFolderId(memoryType: 'bride' | 'groom' | 'both'): Promise<string | null> {
    const supabase = createAdminClient();
    
    const { data: driveConfig } = await supabase
      .from('wedding_google_drive')
      .select('photos_folder_id, bride_folder_id, groom_folder_id, together_folder_id')
      .eq('wedding_id', this.weddingId)
      .single();

    if (!driveConfig) {
      console.error('Drive config not found for wedding');
      return null;
    }

    switch (memoryType) {
      case 'bride':
        return driveConfig.bride_folder_id;
      case 'groom':
        return driveConfig.groom_folder_id;
      case 'both':
        return driveConfig.together_folder_id;
      default:
        return driveConfig.photos_folder_id;
    }
  }

  /**
   * Check if Drive is connected and folders are created
   */
  async isConfigured(): Promise<boolean> {
    const supabase = createAdminClient();
    
    const { data: driveConfig } = await supabase
      .from('wedding_google_drive')
      .select('root_folder_id, photos_folder_id, bride_folder_id, groom_folder_id, together_folder_id')
      .eq('wedding_id', this.weddingId)
      .single();

    if (!driveConfig) {
      return false;
    }

    // Check if all folder IDs are present
    return !!(
      driveConfig.root_folder_id &&
      driveConfig.photos_folder_id &&
      driveConfig.bride_folder_id &&
      driveConfig.groom_folder_id &&
      driveConfig.together_folder_id
    );
  }
}

export default GoogleDriveService;