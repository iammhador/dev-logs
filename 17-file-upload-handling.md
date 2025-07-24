# File Upload and Handling in Express.js

## Overview

File upload handling is a critical feature in modern web applications, enabling users to share documents, images, videos, and other content. This chapter covers implementing secure file uploads using Multer, file validation, storage strategies (local and cloud), image processing, and advanced features like chunked uploads, progress tracking, and virus scanning. We'll also explore best practices for security, performance, and scalability.

## Key Concepts

### File Upload Methods

**Multipart Form Data**: Standard method for file uploads
- Content-Type: `multipart/form-data`
- Supports multiple files and form fields
- Binary data transmission

**Base64 Encoding**: Alternative for small files
- JSON-compatible format
- Larger payload size (33% overhead)
- Suitable for APIs and small images

**Chunked Upload**: For large files
- Split files into smaller chunks
- Resume interrupted uploads
- Better user experience for large files

### Storage Strategies

**Local Storage**: Files stored on server filesystem
- Simple implementation
- Direct file access
- Limited scalability

**Cloud Storage**: Files stored on cloud services
- AWS S3, Google Cloud Storage, Azure Blob
- Scalable and distributed
- CDN integration

**Database Storage**: Files stored as binary data
- Simple backup and replication
- Performance limitations
- Not recommended for large files

### Security Considerations

**File Type Validation**: Restrict allowed file types
**File Size Limits**: Prevent resource exhaustion
**Filename Sanitization**: Prevent path traversal attacks
**Virus Scanning**: Detect malicious files
**Access Control**: Secure file access

## Example Code

### Basic File Upload with Multer

```javascript
// middleware/upload.js - File Upload Middleware
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;

class UploadMiddleware {
    constructor() {
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB
        this.allowedMimeTypes = {
            images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            videos: ['video/mp4', 'video/mpeg', 'video/quicktime'],
            audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
        };
        
        this.initializeUploadDir();
    }
    
    // Initialize upload directory
    async initializeUploadDir() {
        try {
            await fs.access(this.uploadDir);
        } catch (error) {
            await fs.mkdir(this.uploadDir, { recursive: true });
            console.log(`Created upload directory: ${this.uploadDir}`);
        }
    }
    
    // Configure storage
    createStorage(destination = 'general') {
        return multer.diskStorage({
            destination: async (req, file, cb) => {
                try {
                    const uploadPath = path.join(this.uploadDir, destination);
                    await fs.mkdir(uploadPath, { recursive: true });
                    cb(null, uploadPath);
                } catch (error) {
                    cb(error);
                }
            },
            filename: (req, file, cb) => {
                // Generate unique filename
                const uniqueSuffix = crypto.randomBytes(16).toString('hex');
                const extension = path.extname(file.originalname);
                const filename = `${Date.now()}-${uniqueSuffix}${extension}`;
                cb(null, filename);
            }
        });
    }
    
    // File filter function
    createFileFilter(allowedTypes = 'all') {
        return (req, file, cb) => {
            try {
                // Check file type
                if (allowedTypes !== 'all') {
                    const allowedMimes = Array.isArray(allowedTypes) 
                        ? allowedTypes 
                        : this.allowedMimeTypes[allowedTypes] || [];
                    
                    if (!allowedMimes.includes(file.mimetype)) {
                        const error = new Error(`File type not allowed. Allowed types: ${allowedMimes.join(', ')}`);
                        error.code = 'INVALID_FILE_TYPE';
                        return cb(error, false);
                    }
                }
                
                // Validate filename
                if (!this.isValidFilename(file.originalname)) {
                    const error = new Error('Invalid filename');
                    error.code = 'INVALID_FILENAME';
                    return cb(error, false);
                }
                
                cb(null, true);
            } catch (error) {
                cb(error, false);
            }
        };
    }
    
    // Validate filename
    isValidFilename(filename) {
        // Check for dangerous characters
        const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
        if (dangerousChars.test(filename)) {
            return false;
        }
        
        // Check for reserved names (Windows)
        const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
        const nameWithoutExt = path.parse(filename).name;
        if (reservedNames.test(nameWithoutExt)) {
            return false;
        }
        
        // Check length
        if (filename.length > 255) {
            return false;
        }
        
        return true;
    }
    
    // Create upload middleware
    single(fieldName, options = {}) {
        const {
            destination = 'general',
            allowedTypes = 'all',
            maxSize = this.maxFileSize
        } = options;
        
        const upload = multer({
            storage: this.createStorage(destination),
            fileFilter: this.createFileFilter(allowedTypes),
            limits: {
                fileSize: maxSize,
                files: 1
            }
        });
        
        return upload.single(fieldName);
    }
    
    // Multiple files upload
    multiple(fieldName, options = {}) {
        const {
            destination = 'general',
            allowedTypes = 'all',
            maxSize = this.maxFileSize,
            maxCount = 5
        } = options;
        
        const upload = multer({
            storage: this.createStorage(destination),
            fileFilter: this.createFileFilter(allowedTypes),
            limits: {
                fileSize: maxSize,
                files: maxCount
            }
        });
        
        return upload.array(fieldName, maxCount);
    }
    
    // Multiple fields upload
    fields(fieldsConfig, options = {}) {
        const {
            destination = 'general',
            allowedTypes = 'all',
            maxSize = this.maxFileSize
        } = options;
        
        const upload = multer({
            storage: this.createStorage(destination),
            fileFilter: this.createFileFilter(allowedTypes),
            limits: {
                fileSize: maxSize
            }
        });
        
        return upload.fields(fieldsConfig);
    }
    
    // Memory storage for processing
    memory(options = {}) {
        const {
            allowedTypes = 'all',
            maxSize = this.maxFileSize
        } = options;
        
        const upload = multer({
            storage: multer.memoryStorage(),
            fileFilter: this.createFileFilter(allowedTypes),
            limits: {
                fileSize: maxSize
            }
        });
        
        return upload;
    }
    
    // Error handling middleware
    static handleUploadError() {
        return (error, req, res, next) => {
            if (error instanceof multer.MulterError) {
                let message = 'File upload error';
                let statusCode = 400;
                
                switch (error.code) {
                    case 'LIMIT_FILE_SIZE':
                        message = 'File too large';
                        statusCode = 413;
                        break;
                    case 'LIMIT_FILE_COUNT':
                        message = 'Too many files';
                        break;
                    case 'LIMIT_UNEXPECTED_FILE':
                        message = 'Unexpected file field';
                        break;
                    case 'LIMIT_PART_COUNT':
                        message = 'Too many parts';
                        break;
                    case 'LIMIT_FIELD_KEY':
                        message = 'Field name too long';
                        break;
                    case 'LIMIT_FIELD_VALUE':
                        message = 'Field value too long';
                        break;
                    case 'LIMIT_FIELD_COUNT':
                        message = 'Too many fields';
                        break;
                }
                
                return res.status(statusCode).json({
                    success: false,
                    error: 'Upload Error',
                    message,
                    code: error.code
                });
            }
            
            if (error.code === 'INVALID_FILE_TYPE' || error.code === 'INVALID_FILENAME') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message,
                    code: error.code
                });
            }
            
            next(error);
        };
    }
}

module.exports = new UploadMiddleware();
```

### File Service with Cloud Storage

```javascript
// services/FileService.js - Comprehensive File Management
const AWS = require('aws-sdk');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const File = require('../models/File');

class FileService {
    constructor() {
        // Configure AWS S3
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1'
        });
        
        this.bucket = process.env.AWS_S3_BUCKET;
        this.cloudFrontDomain = process.env.CLOUDFRONT_DOMAIN;
        this.uploadDir = process.env.UPLOAD_DIR || './uploads';
        
        // Image processing settings
        this.imageSettings = {
            thumbnail: { width: 150, height: 150, quality: 80 },
            small: { width: 300, height: 300, quality: 85 },
            medium: { width: 800, height: 600, quality: 90 },
            large: { width: 1920, height: 1080, quality: 95 }
        };
    }
    
    // Upload file to local storage
    async uploadLocal(fileData, options = {}) {
        try {
            const {
                userId,
                category = 'general',
                isPublic = false,
                generateThumbnail = false
            } = options;
            
            // Create file record
            const fileRecord = new File({
                originalName: fileData.originalname,
                filename: fileData.filename,
                mimetype: fileData.mimetype,
                size: fileData.size,
                path: fileData.path,
                userId,
                category,
                isPublic,
                storage: 'local',
                metadata: {
                    uploadedAt: new Date(),
                    ip: fileData.ip,
                    userAgent: fileData.userAgent
                }
            });
            
            // Generate file hash for integrity
            fileRecord.hash = await this.generateFileHash(fileData.path);
            
            // Process image if needed
            if (this.isImage(fileData.mimetype)) {
                fileRecord.imageInfo = await this.getImageInfo(fileData.path);
                
                if (generateThumbnail) {
                    fileRecord.thumbnailPath = await this.generateThumbnail(fileData.path);
                }
            }
            
            await fileRecord.save();
            
            return fileRecord;
        } catch (error) {
            throw new Error(`Local upload failed: ${error.message}`);
        }
    }
    
    // Upload file to S3
    async uploadToS3(fileData, options = {}) {
        try {
            const {
                userId,
                category = 'general',
                isPublic = false,
                generateThumbnail = false
            } = options;
            
            // Generate S3 key
            const s3Key = this.generateS3Key(fileData.originalname, category, userId);
            
            // Upload to S3
            const uploadParams = {
                Bucket: this.bucket,
                Key: s3Key,
                Body: fileData.buffer || await fs.readFile(fileData.path),
                ContentType: fileData.mimetype,
                Metadata: {
                    originalName: fileData.originalname,
                    userId: userId?.toString() || 'anonymous',
                    uploadedAt: new Date().toISOString()
                }
            };
            
            if (isPublic) {
                uploadParams.ACL = 'public-read';
            }
            
            const result = await this.s3.upload(uploadParams).promise();
            
            // Create file record
            const fileRecord = new File({
                originalName: fileData.originalname,
                filename: path.basename(s3Key),
                mimetype: fileData.mimetype,
                size: fileData.size,
                path: result.Location,
                s3Key,
                userId,
                category,
                isPublic,
                storage: 's3',
                url: this.getPublicUrl(s3Key),
                metadata: {
                    uploadedAt: new Date(),
                    etag: result.ETag,
                    ip: fileData.ip,
                    userAgent: fileData.userAgent
                }
            });
            
            // Generate file hash
            if (fileData.buffer) {
                fileRecord.hash = crypto.createHash('sha256').update(fileData.buffer).digest('hex');
            } else {
                fileRecord.hash = await this.generateFileHash(fileData.path);
            }
            
            // Process image if needed
            if (this.isImage(fileData.mimetype)) {
                const imageBuffer = fileData.buffer || await fs.readFile(fileData.path);
                fileRecord.imageInfo = await this.getImageInfoFromBuffer(imageBuffer);
                
                if (generateThumbnail) {
                    const thumbnailKey = await this.generateThumbnailS3(imageBuffer, s3Key);
                    fileRecord.thumbnailUrl = this.getPublicUrl(thumbnailKey);
                }
            }
            
            await fileRecord.save();
            
            // Clean up local file if it exists
            if (fileData.path && !fileData.buffer) {
                try {
                    await fs.unlink(fileData.path);
                } catch (error) {
                    console.warn('Failed to clean up local file:', error.message);
                }
            }
            
            return fileRecord;
        } catch (error) {
            throw new Error(`S3 upload failed: ${error.message}`);
        }
    }
    
    // Generate S3 key
    generateS3Key(originalName, category, userId) {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const extension = path.extname(originalName);
        const sanitizedName = path.parse(originalName).name.replace(/[^a-zA-Z0-9-_]/g, '_');
        
        return `${category}/${userId || 'anonymous'}/${timestamp}-${randomString}-${sanitizedName}${extension}`;
    }
    
    // Get public URL
    getPublicUrl(s3Key) {
        if (this.cloudFrontDomain) {
            return `https://${this.cloudFrontDomain}/${s3Key}`;
        }
        return `https://${this.bucket}.s3.amazonaws.com/${s3Key}`;
    }
    
    // Generate file hash
    async generateFileHash(filePath) {
        try {
            const fileBuffer = await fs.readFile(filePath);
            return crypto.createHash('sha256').update(fileBuffer).digest('hex');
        } catch (error) {
            throw new Error(`Hash generation failed: ${error.message}`);
        }
    }
    
    // Check if file is image
    isImage(mimetype) {
        return mimetype.startsWith('image/');
    }
    
    // Get image information
    async getImageInfo(imagePath) {
        try {
            const metadata = await sharp(imagePath).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                channels: metadata.channels,
                hasAlpha: metadata.hasAlpha,
                orientation: metadata.orientation
            };
        } catch (error) {
            throw new Error(`Image info extraction failed: ${error.message}`);
        }
    }
    
    // Get image information from buffer
    async getImageInfoFromBuffer(buffer) {
        try {
            const metadata = await sharp(buffer).metadata();
            return {
                width: metadata.width,
                height: metadata.height,
                format: metadata.format,
                channels: metadata.channels,
                hasAlpha: metadata.hasAlpha,
                orientation: metadata.orientation
            };
        } catch (error) {
            throw new Error(`Image info extraction failed: ${error.message}`);
        }
    }
    
    // Generate thumbnail (local)
    async generateThumbnail(imagePath) {
        try {
            const thumbnailDir = path.join(this.uploadDir, 'thumbnails');
            await fs.mkdir(thumbnailDir, { recursive: true });
            
            const filename = path.basename(imagePath, path.extname(imagePath));
            const thumbnailPath = path.join(thumbnailDir, `${filename}_thumb.jpg`);
            
            await sharp(imagePath)
                .resize(this.imageSettings.thumbnail.width, this.imageSettings.thumbnail.height, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: this.imageSettings.thumbnail.quality })
                .toFile(thumbnailPath);
            
            return thumbnailPath;
        } catch (error) {
            throw new Error(`Thumbnail generation failed: ${error.message}`);
        }
    }
    
    // Generate thumbnail for S3
    async generateThumbnailS3(imageBuffer, originalKey) {
        try {
            const thumbnailBuffer = await sharp(imageBuffer)
                .resize(this.imageSettings.thumbnail.width, this.imageSettings.thumbnail.height, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality: this.imageSettings.thumbnail.quality })
                .toBuffer();
            
            const thumbnailKey = originalKey.replace(/\.[^.]+$/, '_thumb.jpg');
            
            await this.s3.upload({
                Bucket: this.bucket,
                Key: thumbnailKey,
                Body: thumbnailBuffer,
                ContentType: 'image/jpeg',
                ACL: 'public-read'
            }).promise();
            
            return thumbnailKey;
        } catch (error) {
            throw new Error(`S3 thumbnail generation failed: ${error.message}`);
        }
    }
    
    // Resize image
    async resizeImage(fileId, size = 'medium') {
        try {
            const file = await File.findById(fileId);
            if (!file || !this.isImage(file.mimetype)) {
                throw new Error('File not found or not an image');
            }
            
            const settings = this.imageSettings[size];
            if (!settings) {
                throw new Error('Invalid size option');
            }
            
            let imageBuffer;
            if (file.storage === 's3') {
                const s3Object = await this.s3.getObject({
                    Bucket: this.bucket,
                    Key: file.s3Key
                }).promise();
                imageBuffer = s3Object.Body;
            } else {
                imageBuffer = await fs.readFile(file.path);
            }
            
            const resizedBuffer = await sharp(imageBuffer)
                .resize(settings.width, settings.height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: settings.quality })
                .toBuffer();
            
            return resizedBuffer;
        } catch (error) {
            throw new Error(`Image resize failed: ${error.message}`);
        }
    }
    
    // Get file by ID
    async getFile(fileId, userId = null) {
        try {
            const query = { _id: fileId };
            
            // Add user filter if not admin
            if (userId) {
                query.$or = [
                    { userId },
                    { isPublic: true }
                ];
            }
            
            const file = await File.findOne(query);
            if (!file) {
                throw new Error('File not found or access denied');
            }
            
            return file;
        } catch (error) {
            throw new Error(`File retrieval failed: ${error.message}`);
        }
    }
    
    // Get file stream
    async getFileStream(fileId, userId = null) {
        try {
            const file = await this.getFile(fileId, userId);
            
            if (file.storage === 's3') {
                return this.s3.getObject({
                    Bucket: this.bucket,
                    Key: file.s3Key
                }).createReadStream();
            } else {
                const fs = require('fs');
                return fs.createReadStream(file.path);
            }
        } catch (error) {
            throw new Error(`File stream failed: ${error.message}`);
        }
    }
    
    // Delete file
    async deleteFile(fileId, userId = null) {
        try {
            const file = await File.findOne({
                _id: fileId,
                ...(userId && { userId })
            });
            
            if (!file) {
                throw new Error('File not found or access denied');
            }
            
            // Delete from storage
            if (file.storage === 's3') {
                await this.s3.deleteObject({
                    Bucket: this.bucket,
                    Key: file.s3Key
                }).promise();
                
                // Delete thumbnail if exists
                if (file.thumbnailUrl) {
                    const thumbnailKey = file.s3Key.replace(/\.[^.]+$/, '_thumb.jpg');
                    await this.s3.deleteObject({
                        Bucket: this.bucket,
                        Key: thumbnailKey
                    }).promise();
                }
            } else {
                await fs.unlink(file.path);
                
                // Delete thumbnail if exists
                if (file.thumbnailPath) {
                    try {
                        await fs.unlink(file.thumbnailPath);
                    } catch (error) {
                        console.warn('Failed to delete thumbnail:', error.message);
                    }
                }
            }
            
            // Delete from database
            await File.findByIdAndDelete(fileId);
            
            return { message: 'File deleted successfully' };
        } catch (error) {
            throw new Error(`File deletion failed: ${error.message}`);
        }
    }
    
    // List user files
    async listFiles(userId, options = {}) {
        try {
            const {
                category,
                mimetype,
                page = 1,
                limit = 20,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = options;
            
            const query = { userId };
            
            if (category) {
                query.category = category;
            }
            
            if (mimetype) {
                query.mimetype = new RegExp(mimetype, 'i');
            }
            
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
            const skip = (page - 1) * limit;
            
            const [files, total] = await Promise.all([
                File.find(query)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                File.countDocuments(query)
            ]);
            
            return {
                files,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`File listing failed: ${error.message}`);
        }
    }
    
    // Get file statistics
    async getFileStats(userId) {
        try {
            const stats = await File.aggregate([
                { $match: { userId: userId } },
                {
                    $group: {
                        _id: null,
                        totalFiles: { $sum: 1 },
                        totalSize: { $sum: '$size' },
                        categories: { $addToSet: '$category' },
                        mimetypes: { $addToSet: '$mimetype' }
                    }
                }
            ]);
            
            const categoryStats = await File.aggregate([
                { $match: { userId: userId } },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        size: { $sum: '$size' }
                    }
                }
            ]);
            
            return {
                total: stats[0] || { totalFiles: 0, totalSize: 0, categories: [], mimetypes: [] },
                byCategory: categoryStats
            };
        } catch (error) {
            throw new Error(`File stats failed: ${error.message}`);
        }
    }
    
    // Clean up orphaned files
    async cleanupOrphanedFiles() {
        try {
            const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
            
            const orphanedFiles = await File.find({
                userId: null,
                createdAt: { $lt: cutoffDate }
            });
            
            let deletedCount = 0;
            
            for (const file of orphanedFiles) {
                try {
                    await this.deleteFile(file._id);
                    deletedCount++;
                } catch (error) {
                    console.error(`Failed to delete orphaned file ${file._id}:`, error.message);
                }
            }
            
            console.log(`Cleaned up ${deletedCount} orphaned files`);
            return deletedCount;
        } catch (error) {
            console.error('Cleanup failed:', error);
            throw error;
        }
    }
}

module.exports = new FileService();
```

### File Model

```javascript
// models/File.js - File Schema
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true,
        maxlength: 255
    },
    filename: {
        type: String,
        required: true,
        index: true
    },
    mimetype: {
        type: String,
        required: true,
        index: true
    },
    size: {
        type: Number,
        required: true,
        min: 0
    },
    path: {
        type: String,
        required: true
    },
    url: {
        type: String // Public URL for cloud storage
    },
    s3Key: {
        type: String, // S3 object key
        index: true
    },
    hash: {
        type: String, // File hash for integrity
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    category: {
        type: String,
        default: 'general',
        enum: ['general', 'avatar', 'document', 'image', 'video', 'audio'],
        index: true
    },
    isPublic: {
        type: Boolean,
        default: false,
        index: true
    },
    storage: {
        type: String,
        enum: ['local', 's3', 'gcs', 'azure'],
        default: 'local',
        index: true
    },
    thumbnailPath: {
        type: String // Local thumbnail path
    },
    thumbnailUrl: {
        type: String // Cloud thumbnail URL
    },
    imageInfo: {
        width: Number,
        height: Number,
        format: String,
        channels: Number,
        hasAlpha: Boolean,
        orientation: Number
    },
    metadata: {
        uploadedAt: Date,
        ip: String,
        userAgent: String,
        etag: String, // S3 ETag
        tags: [String],
        description: String
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    lastDownloaded: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

// Compound indexes
fileSchema.index({ userId: 1, category: 1 });
fileSchema.index({ userId: 1, createdAt: -1 });
fileSchema.index({ mimetype: 1, isPublic: 1 });
fileSchema.index({ storage: 1, isActive: 1 });

// Virtual for file extension
fileSchema.virtual('extension').get(function() {
    return this.originalName.split('.').pop().toLowerCase();
});

// Virtual for human-readable size
fileSchema.virtual('humanSize').get(function() {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (this.size === 0) return '0 Bytes';
    const i = Math.floor(Math.log(this.size) / Math.log(1024));
    return Math.round(this.size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Instance method to increment download count
fileSchema.methods.incrementDownload = function() {
    this.downloadCount += 1;
    this.lastDownloaded = new Date();
    return this.save({ validateBeforeSave: false });
};

// Instance method to get public JSON
fileSchema.methods.toPublicJSON = function() {
    return {
        id: this._id,
        originalName: this.originalName,
        filename: this.filename,
        mimetype: this.mimetype,
        size: this.size,
        humanSize: this.humanSize,
        extension: this.extension,
        url: this.url,
        thumbnailUrl: this.thumbnailUrl,
        category: this.category,
        isPublic: this.isPublic,
        imageInfo: this.imageInfo,
        downloadCount: this.downloadCount,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// Static method to find by hash (duplicate detection)
fileSchema.statics.findByHash = function(hash) {
    return this.findOne({ hash, isActive: true });
};

// Static method to get storage statistics
fileSchema.statics.getStorageStats = function() {
    return this.aggregate([
        { $match: { isActive: true } },
        {
            $group: {
                _id: '$storage',
                count: { $sum: 1 },
                totalSize: { $sum: '$size' }
            }
        }
    ]);
};

module.exports = mongoose.model('File', fileSchema);
```

### Chunked Upload Implementation

```javascript
// services/ChunkedUploadService.js - Large File Upload with Chunks
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const ChunkedUpload = require('../models/ChunkedUpload');
const FileService = require('./FileService');

class ChunkedUploadService {
    constructor() {
        this.tempDir = process.env.TEMP_UPLOAD_DIR || './temp-uploads';
        this.chunkSize = parseInt(process.env.CHUNK_SIZE) || 1024 * 1024; // 1MB
        this.maxFileSize = parseInt(process.env.MAX_CHUNKED_FILE_SIZE) || 100 * 1024 * 1024; // 100MB
        this.chunkExpiry = 24 * 60 * 60 * 1000; // 24 hours
        
        this.initializeTempDir();
    }
    
    // Initialize temp directory
    async initializeTempDir() {
        try {
            await fs.access(this.tempDir);
        } catch (error) {
            await fs.mkdir(this.tempDir, { recursive: true });
            console.log(`Created temp upload directory: ${this.tempDir}`);
        }
    }
    
    // Initialize chunked upload
    async initializeUpload(uploadData) {
        try {
            const {
                filename,
                fileSize,
                mimetype,
                userId,
                category = 'general'
            } = uploadData;
            
            // Validate file size
            if (fileSize > this.maxFileSize) {
                throw new Error(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
            }
            
            // Calculate total chunks
            const totalChunks = Math.ceil(fileSize / this.chunkSize);
            
            // Generate upload ID
            const uploadId = crypto.randomBytes(16).toString('hex');
            
            // Create upload record
            const chunkedUpload = new ChunkedUpload({
                uploadId,
                filename,
                fileSize,
                mimetype,
                userId,
                category,
                totalChunks,
                chunkSize: this.chunkSize,
                uploadedChunks: [],
                status: 'initialized',
                expiresAt: new Date(Date.now() + this.chunkExpiry)
            });
            
            await chunkedUpload.save();
            
            return {
                uploadId,
                chunkSize: this.chunkSize,
                totalChunks,
                expiresAt: chunkedUpload.expiresAt
            };
        } catch (error) {
            throw new Error(`Upload initialization failed: ${error.message}`);
        }
    }
    
    // Upload chunk
    async uploadChunk(uploadId, chunkNumber, chunkData) {
        try {
            // Find upload record
            const upload = await ChunkedUpload.findOne({
                uploadId,
                status: { $in: ['initialized', 'uploading'] },
                expiresAt: { $gt: new Date() }
            });
            
            if (!upload) {
                throw new Error('Upload not found or expired');
            }
            
            // Validate chunk number
            if (chunkNumber < 0 || chunkNumber >= upload.totalChunks) {
                throw new Error('Invalid chunk number');
            }
            
            // Check if chunk already uploaded
            if (upload.uploadedChunks.includes(chunkNumber)) {
                return {
                    message: 'Chunk already uploaded',
                    uploadedChunks: upload.uploadedChunks.length,
                    totalChunks: upload.totalChunks
                };
            }
            
            // Create chunk directory
            const chunkDir = path.join(this.tempDir, uploadId);
            await fs.mkdir(chunkDir, { recursive: true });
            
            // Save chunk to file
            const chunkPath = path.join(chunkDir, `chunk_${chunkNumber}`);
            await fs.writeFile(chunkPath, chunkData);
            
            // Update upload record
            upload.uploadedChunks.push(chunkNumber);
            upload.status = 'uploading';
            upload.lastChunkAt = new Date();
            
            await upload.save();
            
            // Check if all chunks uploaded
            const isComplete = upload.uploadedChunks.length === upload.totalChunks;
            
            if (isComplete) {
                return await this.completeUpload(uploadId);
            }
            
            return {
                message: 'Chunk uploaded successfully',
                uploadedChunks: upload.uploadedChunks.length,
                totalChunks: upload.totalChunks,
                progress: Math.round((upload.uploadedChunks.length / upload.totalChunks) * 100)
            };
        } catch (error) {
            throw new Error(`Chunk upload failed: ${error.message}`);
        }
    }
    
    // Complete upload by assembling chunks
    async completeUpload(uploadId) {
        try {
            const upload = await ChunkedUpload.findOne({ uploadId });
            if (!upload) {
                throw new Error('Upload not found');
            }
            
            // Verify all chunks are uploaded
            if (upload.uploadedChunks.length !== upload.totalChunks) {
                throw new Error('Not all chunks uploaded');
            }
            
            const chunkDir = path.join(this.tempDir, uploadId);
            const finalFilePath = path.join(this.tempDir, `${uploadId}_complete`);
            
            // Assemble chunks in order
            const writeStream = require('fs').createWriteStream(finalFilePath);
            
            for (let i = 0; i < upload.totalChunks; i++) {
                const chunkPath = path.join(chunkDir, `chunk_${i}`);
                const chunkData = await fs.readFile(chunkPath);
                writeStream.write(chunkData);
            }
            
            writeStream.end();
            
            // Wait for write to complete
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });
            
            // Verify file size
            const stats = await fs.stat(finalFilePath);
            if (stats.size !== upload.fileSize) {
                throw new Error('File size mismatch after assembly');
            }
            
            // Upload to final storage
            const fileData = {
                originalname: upload.filename,
                mimetype: upload.mimetype,
                size: upload.fileSize,
                path: finalFilePath
            };
            
            const fileRecord = await FileService.uploadToS3(fileData, {
                userId: upload.userId,
                category: upload.category,
                generateThumbnail: FileService.isImage(upload.mimetype)
            });
            
            // Update upload status
            upload.status = 'completed';
            upload.fileId = fileRecord._id;
            upload.completedAt = new Date();
            await upload.save();
            
            // Clean up temporary files
            await this.cleanupUpload(uploadId);
            
            return {
                message: 'Upload completed successfully',
                file: fileRecord.toPublicJSON()
            };
        } catch (error) {
            // Mark upload as failed
            await ChunkedUpload.updateOne(
                { uploadId },
                { status: 'failed', error: error.message }
            );
            
            throw new Error(`Upload completion failed: ${error.message}`);
        }
    }
    
    // Get upload status
    async getUploadStatus(uploadId) {
        try {
            const upload = await ChunkedUpload.findOne({ uploadId });
            if (!upload) {
                throw new Error('Upload not found');
            }
            
            return {
                uploadId: upload.uploadId,
                filename: upload.filename,
                fileSize: upload.fileSize,
                status: upload.status,
                uploadedChunks: upload.uploadedChunks.length,
                totalChunks: upload.totalChunks,
                progress: Math.round((upload.uploadedChunks.length / upload.totalChunks) * 100),
                expiresAt: upload.expiresAt,
                error: upload.error
            };
        } catch (error) {
            throw new Error(`Status check failed: ${error.message}`);
        }
    }
    
    // Cancel upload
    async cancelUpload(uploadId) {
        try {
            const upload = await ChunkedUpload.findOne({ uploadId });
            if (!upload) {
                throw new Error('Upload not found');
            }
            
            // Update status
            upload.status = 'cancelled';
            await upload.save();
            
            // Clean up files
            await this.cleanupUpload(uploadId);
            
            return { message: 'Upload cancelled successfully' };
        } catch (error) {
            throw new Error(`Upload cancellation failed: ${error.message}`);
        }
    }
    
    // Clean up upload files
    async cleanupUpload(uploadId) {
        try {
            const chunkDir = path.join(this.tempDir, uploadId);
            const finalFile = path.join(this.tempDir, `${uploadId}_complete`);
            
            // Remove chunk directory
            try {
                await fs.rmdir(chunkDir, { recursive: true });
            } catch (error) {
                console.warn(`Failed to remove chunk directory: ${error.message}`);
            }
            
            // Remove final file
            try {
                await fs.unlink(finalFile);
            } catch (error) {
                console.warn(`Failed to remove final file: ${error.message}`);
            }
        } catch (error) {
            console.error(`Cleanup failed for upload ${uploadId}:`, error.message);
        }
    }
    
    // Clean up expired uploads
    async cleanupExpiredUploads() {
        try {
            const expiredUploads = await ChunkedUpload.find({
                $or: [
                    { expiresAt: { $lt: new Date() } },
                    { status: 'failed', createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
                ]
            });
            
            let cleanedCount = 0;
            
            for (const upload of expiredUploads) {
                await this.cleanupUpload(upload.uploadId);
                await ChunkedUpload.findByIdAndDelete(upload._id);
                cleanedCount++;
            }
            
            console.log(`Cleaned up ${cleanedCount} expired uploads`);
            return cleanedCount;
        } catch (error) {
            console.error('Expired upload cleanup failed:', error);
            throw error;
        }
    }
}

module.exports = new ChunkedUploadService();
```

### File Upload Routes

```javascript
// routes/files.js - File Upload Routes
const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const AuthMiddleware = require('../middleware/auth');
const UploadMiddleware = require('../middleware/upload');
const FileService = require('../services/FileService');
const ChunkedUploadService = require('../services/ChunkedUploadService');
const ValidationMiddleware = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(AuthMiddleware.authenticate());

// Single file upload
router.post('/upload',
    UploadMiddleware.single('file', {
        destination: 'general',
        allowedTypes: 'all',
        maxSize: 10 * 1024 * 1024 // 10MB
    }),
    UploadMiddleware.handleUploadError(),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'No file uploaded'
                });
            }
            
            // Add request metadata
            req.file.ip = req.ip;
            req.file.userAgent = req.get('User-Agent');
            
            // Upload to cloud storage
            const fileRecord = await FileService.uploadToS3(req.file, {
                userId: req.user._id,
                category: req.body.category || 'general',
                isPublic: req.body.isPublic === 'true',
                generateThumbnail: req.body.generateThumbnail === 'true'
            });
            
            res.status(201).json({
                success: true,
                data: {
                    file: fileRecord.toPublicJSON()
                },
                message: 'File uploaded successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Multiple files upload
router.post('/upload-multiple',
    UploadMiddleware.multiple('files', {
        destination: 'general',
        allowedTypes: 'images',
        maxSize: 5 * 1024 * 1024, // 5MB per file
        maxCount: 10
    }),
    UploadMiddleware.handleUploadError(),
    async (req, res, next) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'No files uploaded'
                });
            }
            
            const uploadPromises = req.files.map(async (file) => {
                file.ip = req.ip;
                file.userAgent = req.get('User-Agent');
                
                return FileService.uploadToS3(file, {
                    userId: req.user._id,
                    category: req.body.category || 'general',
                    isPublic: req.body.isPublic === 'true',
                    generateThumbnail: true
                });
            });
            
            const fileRecords = await Promise.all(uploadPromises);
            
            res.status(201).json({
                success: true,
                data: {
                    files: fileRecords.map(file => file.toPublicJSON())
                },
                message: `${fileRecords.length} files uploaded successfully`
            });
        } catch (error) {
            next(error);
        }
    }
);

// Avatar upload
router.post('/upload-avatar',
    UploadMiddleware.single('avatar', {
        destination: 'avatars',
        allowedTypes: 'images',
        maxSize: 2 * 1024 * 1024 // 2MB
    }),
    UploadMiddleware.handleUploadError(),
    async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'No avatar file uploaded'
                });
            }
            
            req.file.ip = req.ip;
            req.file.userAgent = req.get('User-Agent');
            
            // Delete old avatar if exists
            const oldAvatar = await FileService.listFiles(req.user._id, {
                category: 'avatar',
                limit: 1
            });
            
            if (oldAvatar.files.length > 0) {
                await FileService.deleteFile(oldAvatar.files[0]._id, req.user._id);
            }
            
            // Upload new avatar
            const fileRecord = await FileService.uploadToS3(req.file, {
                userId: req.user._id,
                category: 'avatar',
                isPublic: true,
                generateThumbnail: true
            });
            
            res.json({
                success: true,
                data: {
                    avatar: fileRecord.toPublicJSON()
                },
                message: 'Avatar uploaded successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Initialize chunked upload
router.post('/chunked-upload/init',
    [
        body('filename').notEmpty().withMessage('Filename is required'),
        body('fileSize').isInt({ min: 1 }).withMessage('Valid file size is required'),
        body('mimetype').notEmpty().withMessage('MIME type is required')
    ],
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { filename, fileSize, mimetype, category } = req.body;
            
            const result = await ChunkedUploadService.initializeUpload({
                filename,
                fileSize: parseInt(fileSize),
                mimetype,
                userId: req.user._id,
                category
            });
            
            res.json({
                success: true,
                data: result,
                message: 'Chunked upload initialized'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Upload chunk
router.post('/chunked-upload/:uploadId/chunk/:chunkNumber',
    [
        param('uploadId').isHexadecimal().withMessage('Invalid upload ID'),
        param('chunkNumber').isInt({ min: 0 }).withMessage('Invalid chunk number')
    ],
    ValidationMiddleware.handleValidationErrors,
    UploadMiddleware.memory().single('chunk'),
    UploadMiddleware.handleUploadError(),
    async (req, res, next) => {
        try {
            const { uploadId, chunkNumber } = req.params;
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'No chunk data uploaded'
                });
            }
            
            const result = await ChunkedUploadService.uploadChunk(
                uploadId,
                parseInt(chunkNumber),
                req.file.buffer
            );
            
            res.json({
                success: true,
                data: result,
                message: 'Chunk uploaded successfully'
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get chunked upload status
router.get('/chunked-upload/:uploadId/status',
    param('uploadId').isHexadecimal().withMessage('Invalid upload ID'),
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { uploadId } = req.params;
            
            const status = await ChunkedUploadService.getUploadStatus(uploadId);
            
            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            next(error);
        }
    }
);

// Cancel chunked upload
router.delete('/chunked-upload/:uploadId',
    param('uploadId').isHexadecimal().withMessage('Invalid upload ID'),
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { uploadId } = req.params;
            
            const result = await ChunkedUploadService.cancelUpload(uploadId);
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get file by ID
router.get('/:fileId',
    param('fileId').isMongoId().withMessage('Invalid file ID'),
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { fileId } = req.params;
            
            const file = await FileService.getFile(fileId, req.user._id);
            
            res.json({
                success: true,
                data: {
                    file: file.toPublicJSON()
                }
            });
        } catch (error) {
            next(error);
        }
    }
);

// Download file
router.get('/:fileId/download',
    param('fileId').isMongoId().withMessage('Invalid file ID'),
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { fileId } = req.params;
            
            const file = await FileService.getFile(fileId, req.user._id);
            const fileStream = await FileService.getFileStream(fileId, req.user._id);
            
            // Increment download count
            await file.incrementDownload();
            
            // Set headers
            res.setHeader('Content-Type', file.mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
            res.setHeader('Content-Length', file.size);
            
            // Stream file
            fileStream.pipe(res);
        } catch (error) {
            next(error);
        }
    }
);

// Resize image
router.get('/:fileId/resize/:size',
    [
        param('fileId').isMongoId().withMessage('Invalid file ID'),
        param('size').isIn(['thumbnail', 'small', 'medium', 'large']).withMessage('Invalid size')
    ],
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { fileId, size } = req.params;
            
            const imageBuffer = await FileService.resizeImage(fileId, size);
            
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
            res.send(imageBuffer);
        } catch (error) {
            next(error);
        }
    }
);

// List user files
router.get('/',
    [
        query('category').optional().isIn(['general', 'avatar', 'document', 'image', 'video', 'audio']),
        query('mimetype').optional().isString(),
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
        query('sortBy').optional().isIn(['createdAt', 'size', 'originalName', 'downloadCount']),
        query('sortOrder').optional().isIn(['asc', 'desc'])
    ],
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const result = await FileService.listFiles(req.user._id, req.query);
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get file statistics
router.get('/stats/summary', async (req, res, next) => {
    try {
        const stats = await FileService.getFileStats(req.user._id);
        
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
});

// Delete file
router.delete('/:fileId',
    param('fileId').isMongoId().withMessage('Invalid file ID'),
    ValidationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            const { fileId } = req.params;
            
            const result = await FileService.deleteFile(fileId, req.user._id);
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;
```

## Real-World Use Case

### Complete File Management System

```javascript
// app.js - Complete Application with File Upload
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Import routes and middleware
const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const userRoutes = require('./routes/users');
const DatabaseMiddleware = require('./middleware/database');
const ErrorMiddleware = require('./middleware/error');
const AuthMiddleware = require('./middleware/auth');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        error: 'Too Many Requests',
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 uploads per hour
    message: {
        success: false,
        error: 'Upload Limit Exceeded',
        message: 'Too many file uploads, please try again later.'
    }
});

app.use('/api/', generalLimiter);
app.use('/api/files/', uploadLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Clean user input from malicious HTML
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Database connection
app.use(DatabaseMiddleware.connect());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);

// Serve static files (uploaded files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use(ErrorMiddleware.globalErrorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
```

### Chunked Upload Model

```javascript
// models/ChunkedUpload.js - Chunked Upload Schema
const mongoose = require('mongoose');

const chunkedUploadSchema = new mongoose.Schema({
    uploadId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    filename: {
        type: String,
        required: true,
        maxlength: 255
    },
    fileSize: {
        type: Number,
        required: true,
        min: 1
    },
    mimetype: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    category: {
        type: String,
        default: 'general',
        enum: ['general', 'avatar', 'document', 'image', 'video', 'audio']
    },
    totalChunks: {
        type: Number,
        required: true,
        min: 1
    },
    chunkSize: {
        type: Number,
        required: true,
        min: 1
    },
    uploadedChunks: [{
        type: Number,
        min: 0
    }],
    status: {
        type: String,
        enum: ['initialized', 'uploading', 'completed', 'failed', 'cancelled'],
        default: 'initialized',
        index: true
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    error: {
        type: String
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // MongoDB TTL index
    },
    lastChunkAt: {
        type: Date
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound indexes
chunkedUploadSchema.index({ userId: 1, status: 1 });
chunkedUploadSchema.index({ uploadId: 1, status: 1 });

// Virtual for upload progress
chunkedUploadSchema.virtual('progress').get(function() {
    if (this.totalChunks === 0) return 0;
    return Math.round((this.uploadedChunks.length / this.totalChunks) * 100);
});

// Instance method to add uploaded chunk
chunkedUploadSchema.methods.addChunk = function(chunkNumber) {
    if (!this.uploadedChunks.includes(chunkNumber)) {
        this.uploadedChunks.push(chunkNumber);
        this.uploadedChunks.sort((a, b) => a - b);
        this.lastChunkAt = new Date();
        
        if (this.uploadedChunks.length === this.totalChunks) {
            this.status = 'completed';
            this.completedAt = new Date();
        } else {
            this.status = 'uploading';
        }
    }
    return this.save();
};

// Static method to cleanup expired uploads
chunkedUploadSchema.statics.cleanupExpired = function() {
    return this.deleteMany({
        $or: [
            { expiresAt: { $lt: new Date() } },
            { 
                status: { $in: ['failed', 'cancelled'] },
                createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }
        ]
    });
};

module.exports = mongoose.model('ChunkedUpload', chunkedUploadSchema);
```

## Best Practices

### 1. Security

```javascript
// File type validation
const allowedMimeTypes = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf', 'text/plain'],
    videos: ['video/mp4', 'video/mpeg']
};

// Filename sanitization
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .substring(0, 255);
}

// File size limits
const fileSizeLimits = {
    avatar: 2 * 1024 * 1024, // 2MB
    document: 10 * 1024 * 1024, // 10MB
    video: 100 * 1024 * 1024 // 100MB
};
```

### 2. Performance Optimization

```javascript
// Stream processing for large files
const streamProcessor = (inputStream, outputStream) => {
    return new Promise((resolve, reject) => {
        inputStream
            .pipe(outputStream)
            .on('finish', resolve)
            .on('error', reject);
    });
};

// Image optimization
const optimizeImage = async (inputBuffer) => {
    return sharp(inputBuffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
};
```

### 3. Error Handling

```javascript
// Comprehensive error handling
class FileUploadError extends Error {
    constructor(message, code, statusCode = 400) {
        super(message);
        this.name = 'FileUploadError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

// Usage
if (file.size > maxSize) {
    throw new FileUploadError(
        'File size exceeds limit',
        'FILE_TOO_LARGE',
        413
    );
}
```

### 4. Monitoring and Logging

```javascript
// Upload metrics
const uploadMetrics = {
    totalUploads: 0,
    totalSize: 0,
    averageUploadTime: 0,
    errorRate: 0
};

// Log upload events
const logUpload = (event, data) => {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        event,
        userId: data.userId,
        filename: data.filename,
        size: data.size,
        duration: data.duration
    }));
};
```

### 5. Cleanup and Maintenance

```javascript
// Scheduled cleanup job
const cron = require('node-cron');

// Run cleanup every day at 2 AM
cron.schedule('0 2 * * *', async () => {
    try {
        console.log('Starting file cleanup...');
        
        // Clean up orphaned files
        const orphanedCount = await FileService.cleanupOrphanedFiles();
        
        // Clean up expired chunked uploads
        const expiredCount = await ChunkedUploadService.cleanupExpiredUploads();
        
        // Clean up expired tokens
        const tokenCount = await AuthService.cleanupExpiredTokens();
        
        console.log(`Cleanup completed: ${orphanedCount} files, ${expiredCount} uploads, ${tokenCount} tokens`);
    } catch (error) {
        console.error('Cleanup failed:', error);
    }
});
```

## Summary

File upload and handling is a critical feature that requires careful consideration of security, performance, and user experience:

**Core Features**:
- **Multer Integration**: Flexible file upload middleware with storage options
- **Cloud Storage**: Scalable S3 integration with CDN support
- **Image Processing**: Automatic resizing, thumbnail generation, and optimization
- **Chunked Upload**: Support for large files with resume capability
- **File Management**: Complete CRUD operations with metadata tracking

**Security Measures**:
- File type validation and MIME type checking
- Filename sanitization and path traversal prevention
- File size limits and rate limiting
- Virus scanning integration (recommended)
- Access control and permission management

**Performance Optimization**:
- Stream processing for large files
- Image optimization and compression
- CDN integration for fast delivery
- Caching strategies for frequently accessed files
- Background processing for intensive operations

**Advanced Features**:
- Progress tracking for uploads
- Duplicate file detection using hashes
- Automatic cleanup of orphaned files
- File analytics and usage statistics
- Multi-format support with conversion

**Best Practices**:
- Implement comprehensive validation
- Use appropriate storage strategies
- Monitor upload metrics and performance
- Regular cleanup and maintenance
- Proper error handling and user feedback

Proper file upload implementation ensures secure, efficient, and user-friendly file management capabilities. Next, we'll explore testing strategies for Express.js applications, including unit tests, integration tests, and API testing frameworks.