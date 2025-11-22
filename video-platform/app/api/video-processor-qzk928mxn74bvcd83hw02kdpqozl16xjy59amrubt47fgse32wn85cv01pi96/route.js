import { NextResponse } from 'next/server';

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

    console.log('Upload received:', {
      fileName: videoFile.name,
      fileSize: videoFile.size,
      title: title,
      description: description
    });

    // Simulate upload process
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully!',
      fileId: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: videoFile.name,
      fileSize: videoFile.size,
      title: title
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}

// Also handle GET requests if needed
export async function GET() {
  return NextResponse.json({
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
}
