'use client';
import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Video, FileVideo } from 'lucide-react';

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
          message: 'Please select a video file (MP4, MOV, AVI, MKV, WEBM)'
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
      
      // Auto-fill title from filename (without extension)
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
      formData.append('title', videoInfo.title.trim());
      formData.append('description', videoInfo.description.trim());

      // Use the super long secret API route
      const apiUrl = '/api/video-processor-qzk928mxn74bvcd83hw02kdpqozl16xjy59amrubt47fgse32wn85cv01pi96';

      const xhr = new XMLHttpRequest();
      
      // Progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setProgress(percentComplete);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            setUploadStatus({
              type: 'success',
              message: response.message || 'Video uploaded successfully to Backblaze B2! 🎉'
            });
            // Reset form
            setSelectedFile(null);
            setVideoInfo({ title: '', description: '' });
            setProgress(0);
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          } else {
            setUploadStatus({
              type: 'error',
              message: response.error || 'Upload failed'
            });
          }
        } else {
          let errorMessage = 'Upload failed';
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorResponse.details || errorMessage;
          } catch (e) {
            errorMessage = `Server error: ${xhr.status}`;
          }
          setUploadStatus({
            type: 'error',
            message: errorMessage
          });
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setUploadStatus({
          type: 'error',
          message: 'Network error: Failed to connect to server. Check your connection.'
        });
        setUploading(false);
      });

      xhr.addEventListener('timeout', () => {
        setUploadStatus({
          type: 'error',
          message: 'Upload timeout: Please try again with a smaller file or better connection.'
        });
        setUploading(false);
      });

      xhr.open('POST', apiUrl);
      xhr.timeout = 300000; // 5 minutes timeout for large files
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

  const formatFileSize = (bytes) => {
    if (bytes >= 1073741824) {
      return (bytes / 1073741824).toFixed(2) + ' GB';
    } else if (bytes >= 1048576) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return bytes + ' bytes';
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
          <p className="text-gray-600">Upload videos directly to Backblaze B2 cloud storage</p>
        </div>

        {/* Upload Card */}
        <div className="card p-8">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              selectedFile 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/*"
              className="hidden"
              disabled={uploading}
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
                {!uploading && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    className="inline-flex items-center text-sm text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove file
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="font-semibold text-gray-900">
                    {uploading ? 'Upload in progress...' : 'Select video file'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {uploading ? 'Please wait...' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    MP4, MOV, AVI, MKV, WEBM • Max 100MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading to Backblaze B2...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Uploading to secure cloud storage...
              </p>
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
                placeholder="Enter a descriptive title for your video..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors disabled:bg-gray-100"
                disabled={uploading}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {videoInfo.title.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={videoInfo.description}
                onChange={(e) => setVideoInfo(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your video... (optional)"
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none disabled:bg-gray-100"
                disabled={uploading}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {videoInfo.description.length}/500 characters
              </p>
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
                Uploading... {Math.round(progress)}%
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <FileVideo className="h-5 w-5 mr-2" />
                Upload to Backblaze B2
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
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                )}
                <span>{uploadStatus.message}</span>
              </div>
            </div>
          )}
        </div>

        {/* Storage Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🔒 Videos are securely stored on Backblaze B2 Cloud Storage</p>
          <p>🌐 10GB free storage • Global CDN • Instant streaming</p>
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
