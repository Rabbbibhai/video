// lib/backblaze.js - Backblaze B2 Cloud Storage Integration
import axios from 'axios';

class BackblazeClient {
  constructor() {
    this.accountId = process.env.B2_APPLICATION_KEY_ID;
    this.applicationKey = process.env.B2_APPLICATION_KEY;
    this.bucketName = process.env.B2_BUCKET_NAME || 'webvid';
    this.authToken = null;
    this.apiUrl = null;
    this.downloadUrl = null;
    this.bucketId = null;
  }

  // Authorize with Backblaze B2
  async authorize() {
    try {
      console.log('Authorizing with Backblaze B2...');
      
      const response = await axios.get('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        auth: {
          username: this.accountId,
          password: this.applicationKey
        },
        timeout: 10000
      });

      this.authToken = response.data.authorizationToken;
      this.apiUrl = response.data.apiUrl;
      this.downloadUrl = response.data.downloadUrl;
      
      console.log('Backblaze B2 authorization successful');
      return response.data;
    } catch (error) {
      console.error('Backblaze B2 authorization failed:', error.response?.data || error.message);
      throw new Error(`B2 Authorization failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get bucket ID
  async getBucketId() {
    if (this.bucketId) return this.bucketId;

    await this.authorize();
    
    try {
      const response = await axios.post(
        `${this.apiUrl}/b2api/v2/b2_list_buckets`,
        { accountId: this.accountId },
        { headers: { Authorization: this.authToken } }
      );

      const bucket = response.data.buckets.find(b => b.bucketName === this.bucketName);
      if (!bucket) {
        throw new Error(`Bucket "${this.bucketName}" not found`);
      }

      this.bucketId = bucket.bucketId;
      return this.bucketId;
    } catch (error) {
      console.error('Error getting bucket ID:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get upload URL
  async getUploadUrl() {
    await this.authorize();
    const bucketId = await this.getBucketId();
    
    try {
      const response = await axios.post(
        `${this.apiUrl}/b2api/v2/b2_get_upload_url`,
        { bucketId },
        { headers: { Authorization: this.authToken } }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting upload URL:', error.response?.data || error.message);
      throw error;
    }
  }

  // Upload file to Backblaze B2
  async uploadFile(file, fileName) {
    try {
      console.log(`Uploading file: ${fileName} (${file.size} bytes)`);
      
      const uploadData = await this.getUploadUrl();
      
      // Convert file to buffer for upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const response = await axios.post(uploadData.uploadUrl, buffer, {
        headers: {
          'Authorization': uploadData.authorizationToken,
          'X-Bz-File-Name': encodeURIComponent(fileName),
          'Content-Type': file.type || 'b2/x-auto',
          'X-Bz-Content-Sha1': 'do_not_verify',
          'Content-Length': file.size
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 300000 // 5 minutes for large files
      });

      console.log('File uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('File upload failed:', error.response?.data || error.message);
      throw new Error(`Upload failed: ${error.response?.data?.message || error.message}`);
    }
  }

  // List all files in bucket
  async listFiles() {
    try {
      await this.authorize();
      const bucketId = await this.getBucketId();
      
      const response = await axios.post(
        `${this.apiUrl}/b2api/v2/b2_list_file_names`,
        { 
          bucketId,
          maxFileCount: 1000 
        },
        { headers: { Authorization: this.authToken } }
      );

      return response.data.files;
    } catch (error) {
      console.error('Error listing files:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get download URL for a file
  getDownloadUrl(fileName) {
    return `https://f005.backblazeb2.com/file/${this.bucketName}/${encodeURIComponent(fileName)}`;
  }

  // Delete a file
  async deleteFile(fileName, fileId) {
    try {
      await this.authorize();
      
      const response = await axios.post(
        `${this.apiUrl}/b2api/v2/b2_delete_file_version`,
        {
          fileName: encodeURIComponent(fileName),
          fileId: fileId
        },
        { headers: { Authorization: this.authToken } }
      );

      console.log('File deleted successfully:', fileName);
      return response.data;
    } catch (error) {
      console.error('Error deleting file:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Create and export a single instance
const backblazeClient = new BackblazeClient();
export default backblazeClient;
