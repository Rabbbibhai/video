'use client';
import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Video } from 'lucide-react';

export default function SecretUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState({
    title: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if file is a video
      if (!file.type.startsWith('video/')) {
        setUploadStatus({
          type: 'error',
          message: 'Please select a video file (MP4, MOV, AVI, etc.)'
        });
        return;
      }
      
      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        setUploadStatus({
          type: 'error',
          message: 'File size must be less than 100MB'
        });
        return;
      }
      
      setSelectedFile(file);
      setUploadStatus(null);
      
      // Auto-fill title from filename
      if (!videoInfo.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setVideoInfo(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      fileInputRef.current.files = files;
      handleFileSelect({ target: { files } });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoInfo.title.trim()) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file and enter a title'
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('title', videoInfo.title);
      formData.append('description', videoInfo.description);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setUploadStatus({
            type: 'success',
            message: 'Video uploaded successfully!'
          });
          setSelectedFile(null);
          setVideoInfo({ title: '', description: '' });
          setProgress(0);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          setUploadStatus({
            type: 'error',
            message: `Upload failed: ${xhr.responseText || 'Unknown error'}`
          });
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setUploadStatus({
          type: 'error',
          message: 'Upload failed. Please check your connection.'
        });
        setUploading(false);
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `Upload error: ${error.message}`
      });
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Secret Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Video className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secret Upload Portal</h1>
          <p className="text-gray-600">Upload videos to your private collection</p>
        </div>

        {/* Upload Card */}
        <div className="card p-8">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              selectedFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*"
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(); }}
                  className="inline-flex items-center text-sm text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="font-semibold text-gray-900">Select video file</p>
                  <p className="text-sm text-gray-600">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    MP4, MOV, AVI, WEBM • Max 100MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Video Info Form */}
          <div className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Title *
              </label>
              <input
                type="text"
                value={videoInfo.title}
                onChange={(e) => setVideoInfo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={videoInfo.description}
                onChange={(e) => setVideoInfo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your video..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
                disabled={uploading}
              />
            </div>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className={`w-full mt-8 py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              uploading || !selectedFile
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 transform hover:scale-105'
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Uploading...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Video
              </div>
            )}
          </button>

          {/* Status Message */}
          {uploadStatus && (
            <div className={`mt-6 p-4 rounded-lg border ${
              uploadStatus.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {uploadStatus.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                {uploadStatus.message}
              </div>
            </div>
          )}
        </div>

        {/* Secret Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🔒 This page is hidden from public navigation
          </p>
        </div>
      </div>
    </div>
  );
}