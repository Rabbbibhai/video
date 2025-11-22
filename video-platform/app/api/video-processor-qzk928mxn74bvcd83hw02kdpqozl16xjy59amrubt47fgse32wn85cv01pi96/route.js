import { NextResponse } from 'next/server';
import backblaze from '../../../../lib/backblaze';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video');
    const title = formData.get('title');
    const description = formData.get('description');

    if (!videoFile || !title) {
      return NextResponse.json(
        { error: 'Video file and title are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Please upload a video file (MP4, MOV, AVI, etc.)' },
        { status: 400 }
      );
    }

    // Validate file size (100MB limit)
    if (videoFile.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 100MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = videoFile.name.split('.').pop();
    const uniqueFileName = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

    console.log('Starting Backblaze upload:', uniqueFileName);

    // Upload to Backblaze B2
    const uploadResult = await backblaze.uploadFile(videoFile, uniqueFileName);

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully to Backblaze B2! 🎉',
      fileId: uploadResult.fileId,
      fileName: uniqueFileName,
      downloadUrl: backblaze.getDownloadUrl(uniqueFileName),
      fileSize: uploadResult.contentLength,
      title: title,
      description: description,
      uploadTimestamp: uploadResult.uploadTimestamp
    });

  } catch (error) {
    console.error('Backblaze upload error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed: ' + error.message,
        details: 'Check if Backblaze credentials are set in environment variables'
      },
      { status: 500 }
    );
  }
}

// Test endpoint
export async function GET() {
  return NextResponse.json({
    status: 'API is working!',
    timestamp: new Date().toISOString(),
    message: 'Backblaze B2 upload endpoint is ready'
  });
}
