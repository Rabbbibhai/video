import { NextResponse } from 'next/server';

// Mock data for now
const mockVideos = [
  {
    fileId: 'vid_1698765432101_abc123xyz',
    fileName: 'Amazing Mountain View',
    downloadUrl: 'https://example.com/sample1.mp4',
    views: 150,
    uploadDate: '2023-10-01'
  },
  {
    fileId: 'vid_1698765432102_def456uvw',
    fileName: 'City Time Lapse', 
    downloadUrl: 'https://example.com/sample2.mp4',
    views: 89,
    uploadDate: '2023-10-02'
  }
];

export async function GET() {
  try {
    // Return mock videos for now
    return NextResponse.json(mockVideos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}