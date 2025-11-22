'use client';
import { useState, useEffect } from 'react';
import { Play, Upload, Eye, Download } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Play className="h-8 w-8 text-red-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">WebVid</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-red-600 font-medium">
                Home
              </Link>
              <Link href="/upload" className="text-gray-700 hover:text-red-600 font-medium">
                Upload
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-5xl font-bold mb-6">Share Your Videos with the World</h2>
          <p className="text-xl mb-8 opacity-90">
            Free video hosting with instant streaming and downloads
          </p>
          <Link href="/upload" className="btn-primary bg-white text-red-600 hover:bg-gray-100 inline-flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Upload Video
          </Link>
        </div>
      </section>

      {/* Video Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-gray-900 mb-8">Latest Videos</h3>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-video bg-gray-300 rounded-t-xl"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div key={video.fileId} className="card group">
                <div className="aspect-video bg-gray-200 rounded-t-xl overflow-hidden relative">
                  <video 
                    className="w-full h-full object-cover"
                    poster={`https://f005.backblazeb2.com/file/webvid/${video.fileName}.jpg`}
                  >
                    <source src={video.downloadUrl} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-bold text-lg mb-2 line-clamp-2">{video.fileName}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {video.views || 0}
                    </div>
                    <div className="flex items-center space-x-4">
                      <Link 
                        href={`/watch/${video.fileId}`}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Watch
                      </Link>
                      <a 
                        href={video.downloadUrl}
                        download
                        className="text-gray-600 hover:text-gray-800 flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-600 mb-2">No videos yet</h4>
            <p className="text-gray-500 mb-6">Be the first to upload a video!</p>
            <Link href="/upload" className="btn-primary">
              Upload First Video
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
