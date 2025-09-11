import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveService } from '@/lib/google/drive-service';
import { google } from 'googleapis';

interface Params {
  slug: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { slug } = await context.params;

  try {
    // Try to create Drive service
    const driveService = await GoogleDriveService.fromWeddingSlug(slug);
    
    if (!driveService) {
      return NextResponse.json({
        valid: false,
        error: 'Google Drive not connected or tokens invalid',
      });
    }

    // Test token by making a simple API call
    try {
      // Try to list files (limited to 1 to minimize API usage)
      const drive = google.drive({ version: 'v3' });
      const response = await drive.files.list({
        pageSize: 1,
        fields: 'files(id)',
        auth: driveService['oauth2Client'], // Access private property for validation
      });

      // If we got here, token is valid
      return NextResponse.json({
        valid: true,
        message: 'Token is valid and Drive API is accessible',
      });
    } catch (apiError: any) {
      // Check specific error types
      if (apiError.code === 401) {
        return NextResponse.json({
          valid: false,
          error: 'Token is expired or invalid',
          needsRefresh: true,
        });
      }
      
      if (apiError.code === 403) {
        return NextResponse.json({
          valid: false,
          error: 'Insufficient permissions',
          details: apiError.message,
        });
      }

      throw apiError; // Re-throw for general error handling
    }
  } catch (error) {
    console.error('Error validating Drive token:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Failed to validate token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to trigger token refresh
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { slug } = await context.params;

  try {
    // Force token refresh
    const driveService = await GoogleDriveService.fromWeddingSlug(slug);
    
    if (!driveService) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 400 }
      );
    }

    // The service automatically refreshes if needed
    // Test if the refresh worked
    try {
      const drive = google.drive({ version: 'v3' });
      await drive.files.list({
        pageSize: 1,
        fields: 'files(id)',
        auth: driveService['oauth2Client'],
      });

      return NextResponse.json({
        success: true,
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Token refresh failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}