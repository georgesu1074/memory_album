import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveService } from '@/lib/google/drive-service';

interface Params {
  slug: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { slug } = await context.params;

  try {
    // Create Drive service from wedding slug
    const driveService = await GoogleDriveService.fromWeddingSlug(slug);
    
    if (!driveService) {
      return NextResponse.json(
        { error: 'Google Drive not connected or wedding not found' },
        { status: 400 }
      );
    }

    // Check if already configured
    const isConfigured = await driveService.isConfigured();
    
    if (isConfigured) {
      return NextResponse.json({
        success: true,
        message: 'Folders already created',
        alreadyConfigured: true,
      });
    }

    // Create folder structure
    const folders = await driveService.createWeddingFolders(slug);
    
    if (!folders) {
      return NextResponse.json(
        { error: 'Failed to create folder structure' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Folder structure created successfully',
      folders,
    });
  } catch (error) {
    console.error('Error setting up Drive folders:', error);
    return NextResponse.json(
      { error: 'Failed to setup Drive folders' },
      { status: 500 }
    );
  }
}