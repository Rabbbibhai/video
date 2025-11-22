'use client';
import { useState, useEffect } from 'react';
import { Play, Download, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function WatchPage() {
  const params = useParams();
  const videoId = params.id;
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const fetchVideo = async () => {
    try {
      // For now, using mock data
      const mockVideo = {
        fileId: videoId,
        fileName: 'Sample Video',
        downloadUrl: 'https://example.com/sample.mp4',
        views: 150,
        uploadDate: '2023-10-01'
      };
      
      setVideo(mockVideo);
    } catch (err) {
      setError('Video not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h1>
          <Link href="/" className="btn-primary inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link 
              href="/" 
              className="inline-flex items-center text-white hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Videos
            </Link>
            <div className="flex items-center text-gray-300">
              <Eye className="h-4 w-4 mr-1" />
              {video.views} views
            </div>
          </div>
        </div>
      </header>

      {/* Video Player */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
          <video 
            controls 
            className="w-full aspect-video"
            poster="/video-poster.jpg"
          >
            <source src={video.downloadUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Info */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {video.fileName}
              </h1>
              <p className="text-gray-400">
                Uploaded on {new Date(video.uploadDate).toLocaleDateString()}
              </p>
            </div>
            <a
              href={video.downloadUrl}
              download
              className="btn-primary bg-red-600 hover:bg-red-700 inline-flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </div>
          
          {/* Video Stats */}
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {video.views} views
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
