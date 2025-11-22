import { NextResponse } from 'next/server';
import backblaze from '../../../lib/backblaze';

export async function GET() {
  try {
    console.log('Fetching videos from Backblaze B2...');
    
    // Get real files from Backblaze B2
    const files = await backblaze.listFiles();
    
    // Filter only video files and format them
    const videos = files
      .filter(file => {
        const fileName = file.fileName.toLowerCase();
        return fileName.endsWith('.mp4') || 
               fileName.endsWith('.mov') || 
               fileName.endsWith('.avi') || 
               fileName.endsWith('.mkv') ||
               fileName.endsWith('.webm');
      })
      .map(file => ({
        fileId: file.fileId,
        fileName: file.fileName.replace(/\.[^/.]+$/, ""), // Remove extension
        originalName: file.fileName,
        downloadUrl: backblaze.getDownloadUrl(file.fileName),
        fileSize: file.contentLength,
        uploadDate: new Date(file.uploadTimestamp).toLocaleDateString(),
        uploadTimestamp: file.uploadTimestamp,
        views: Math.floor(Math.random() * 1000), // We'll add real views later
        // You can extract title from filename or add metadata later
        title: file.fileName.replace(/\.[^/.]+$/, "").replace(/video_\d+_/, "").replace(/[_-]/g, ' ')
      }));

    console.log(`Found ${videos.length} videos in Backblaze B2`);
    
    // Sort by upload date (newest first)
    videos.sort((a, b) => b.uploadTimestamp - a.uploadTimestamp);

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching videos from Backblaze:', error);
    
    // Return empty array if Backblaze fails (for development)
    return NextResponse.json([], { status: 200 });
  }
}
