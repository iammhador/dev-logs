# Serving Static Files in Express.js

## Overview

Serving static files is a fundamental requirement for web applications. Static files include CSS stylesheets, JavaScript files, images, fonts, and other assets that don't change based on user requests. Express.js provides built-in middleware to serve static files efficiently, along with advanced features for optimization and security.

## Key Concepts

### Static Files vs Dynamic Content

**Static Files**:
- CSS stylesheets
- JavaScript files
- Images (PNG, JPG, SVG, etc.)
- Fonts (TTF, WOFF, etc.)
- Documents (PDF, TXT, etc.)
- Audio/Video files

**Dynamic Content**:
- HTML generated from templates
- API responses
- User-specific data
- Real-time content

### Express Static Middleware

Express provides `express.static()` middleware that:
- Serves files from a specified directory
- Sets appropriate MIME types
- Handles caching headers
- Supports range requests
- Provides security features

### Virtual Paths

Virtual paths allow you to:
- Mount static files at different URL paths
- Organize files logically
- Hide actual directory structure
- Implement multiple static directories

## Example Code

### Basic Static File Serving

```javascript
// basic-static.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from 'public' directory
app.use(express.static('public'));

// Alternative: using absolute path
app.use(express.static(path.join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Static Files Demo</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <h1>Welcome to Static Files Demo</h1>
            <img src="/images/logo.png" alt="Logo">
            <script src="/js/app.js"></script>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### Virtual Path Mounting

```javascript
// virtual-paths.js
const express = require('express');
const path = require('path');
const app = express();

// Mount static files with virtual paths
app.use('/static', express.static('public'));
app.use('/assets', express.static('assets'));
app.use('/uploads', express.static('uploads'));

// Multiple directories for same virtual path
app.use('/shared', express.static('public'));
app.use('/shared', express.static('assets'));

// Serve files from different directories
app.use('/css', express.static(path.join(__dirname, 'styles')));
app.use('/js', express.static(path.join(__dirname, 'scripts')));
app.use('/images', express.static(path.join(__dirname, 'media', 'images')));

// API route
app.get('/api/info', (req, res) => {
    res.json({
        message: 'Static files are served at:',
        paths: {
            general: '/static/*',
            assets: '/assets/*',
            uploads: '/uploads/*',
            styles: '/css/*',
            scripts: '/js/*',
            images: '/images/*'
        }
    });
});

// Demo page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Virtual Paths Demo</title>
            <link rel="stylesheet" href="/css/main.css">
            <link rel="stylesheet" href="/static/css/theme.css">
        </head>
        <body>
            <h1>Virtual Paths Demo</h1>
            <div>
                <h2>Images from different paths:</h2>
                <img src="/images/sample1.jpg" alt="Sample 1" style="max-width: 200px;">
                <img src="/static/images/sample2.jpg" alt="Sample 2" style="max-width: 200px;">
                <img src="/assets/logo.png" alt="Logo" style="max-width: 100px;">
            </div>
            <script src="/js/main.js"></script>
            <script src="/static/js/utils.js"></script>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### Advanced Static File Configuration

```javascript
// advanced-static.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// Static middleware with options
app.use('/public', express.static('public', {
    // Set cache control headers
    maxAge: '1d', // Cache for 1 day
    
    // Set custom headers
    setHeaders: (res, path, stat) => {
        // Set security headers
        res.set('X-Content-Type-Options', 'nosniff');
        
        // Set different cache times for different file types
        if (path.endsWith('.css') || path.endsWith('.js')) {
            res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
        } else if (path.endsWith('.html')) {
            res.set('Cache-Control', 'public, max-age=3600'); // 1 hour
        }
        
        // Add custom header with file info
        res.set('X-File-Size', stat.size);
        res.set('X-Last-Modified', stat.mtime.toISOString());
    },
    
    // Custom index file
    index: ['index.html', 'index.htm', 'default.html'],
    
    // Disable directory listing
    dotfiles: 'ignore', // ignore, allow, deny
    
    // Enable/disable etag
    etag: true,
    
    // Enable/disable last-modified header
    lastModified: true,
    
    // Redirect to trailing slash
    redirect: true
}));

// Conditional static serving based on environment
if (process.env.NODE_ENV === 'development') {
    // In development, serve files without caching
    app.use('/dev-assets', express.static('dev-assets', {
        maxAge: 0,
        etag: false,
        lastModified: false
    }));
}

// Serve different files based on user agent
app.use('/adaptive', (req, res, next) => {
    const userAgent = req.get('User-Agent') || '';
    
    if (userAgent.includes('Mobile')) {
        express.static('mobile-assets')(req, res, next);
    } else {
        express.static('desktop-assets')(req, res, next);
    }
});

// Custom static file handler with authentication
app.use('/protected', (req, res, next) => {
    // Simple authentication check
    const token = req.get('Authorization');
    
    if (!token || token !== 'Bearer secret-token') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    next();
}, express.static('protected-files'));

// File download with custom names
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'downloads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    // Get file stats
    const stats = fs.statSync(filePath);
    
    // Set download headers
    res.set({
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stats.size
    });
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Handle stream errors
    fileStream.on('error', (err) => {
        console.error('File stream error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'File read error' });
        }
    });
});

// File information endpoint
app.get('/file-info/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', filename);
    
    fs.stat(filePath, (err, stats) => {
        if (err) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        res.json({
            filename,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            extension: path.extname(filename),
            mimeType: getMimeType(filename)
        });
    });
});

// Helper function to get MIME type
function getMimeType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

// Serve SPA (Single Page Application)
app.get('*', (req, res) => {
    // For SPA, serve index.html for all non-API routes
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

### File Upload and Static Serving

```javascript
// upload-static.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Create upload directories
const uploadDirs = ['uploads/images', 'uploads/documents', 'uploads/temp'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/temp';
        
        if (file.mimetype.startsWith('image/')) {
            uploadPath = 'uploads/images';
        } else if (file.mimetype === 'application/pdf' || 
                   file.mimetype.includes('document')) {
            uploadPath = 'uploads/documents';
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow specific file types
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/svg+xml',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

// Serve uploaded files with different access levels
app.use('/uploads/images', express.static('uploads/images', {
    maxAge: '7d',
    setHeaders: (res, path) => {
        res.set('X-Content-Type-Options', 'nosniff');
        if (path.endsWith('.svg')) {
            res.set('Content-Type', 'image/svg+xml');
        }
    }
}));

// Protected document serving
app.use('/uploads/documents', (req, res, next) => {
    // Simple authentication for documents
    const auth = req.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}, express.static('uploads/documents'));

// Temporary files with short cache
app.use('/uploads/temp', express.static('uploads/temp', {
    maxAge: '1h'
}));

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileInfo = {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        url: `/${req.file.path.replace(/\\/g, '/')}` // Convert Windows paths
    };
    
    res.json({
        success: true,
        message: 'File uploaded successfully',
        file: fileInfo
    });
});

// Multiple file upload
app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    
    const filesInfo = req.files.map(file => ({
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        url: `/${file.path.replace(/\\/g, '/')}`
    }));
    
    res.json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        files: filesInfo
    });
});

// File gallery endpoint
app.get('/api/gallery', (req, res) => {
    const imagesDir = path.join(__dirname, 'uploads/images');
    
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to read directory' });
        }
        
        const imageFiles = files
            .filter(file => /\.(jpg|jpeg|png|gif|svg)$/i.test(file))
            .map(file => {
                const filePath = path.join(imagesDir, file);
                const stats = fs.statSync(filePath);
                
                return {
                    filename: file,
                    url: `/uploads/images/${file}`,
                    size: stats.size,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => new Date(b.modified) - new Date(a.modified));
        
        res.json({
            success: true,
            images: imageFiles,
            count: imageFiles.length
        });
    });
});

// File deletion endpoint
app.delete('/api/files/:filename', (req, res) => {
    const filename = req.params.filename;
    
    // Search in all upload directories
    const searchDirs = ['uploads/images', 'uploads/documents', 'uploads/temp'];
    let fileFound = false;
    
    for (const dir of searchDirs) {
        const filePath = path.join(__dirname, dir, filename);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            fileFound = true;
            
            res.json({
                success: true,
                message: 'File deleted successfully',
                filename,
                directory: dir
            });
            break;
        }
    }
    
    if (!fileFound) {
        res.status(404).json({ error: 'File not found' });
    }
});

// Upload form page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>File Upload Demo</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .upload-form { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
                .file-list { margin: 20px 0; }
                .file-item { padding: 10px; border: 1px solid #eee; margin: 5px 0; }
                img { max-width: 200px; max-height: 200px; }
            </style>
        </head>
        <body>
            <h1>File Upload and Static Serving Demo</h1>
            
            <div class="upload-form">
                <h2>Single File Upload</h2>
                <form action="/upload" method="post" enctype="multipart/form-data">
                    <input type="file" name="file" required>
                    <button type="submit">Upload</button>
                </form>
            </div>
            
            <div class="upload-form">
                <h2>Multiple File Upload</h2>
                <form action="/upload-multiple" method="post" enctype="multipart/form-data">
                    <input type="file" name="files" multiple required>
                    <button type="submit">Upload Files</button>
                </form>
            </div>
            
            <div class="file-list">
                <h2>Actions</h2>
                <button onclick="loadGallery()">Load Image Gallery</button>
                <div id="gallery"></div>
            </div>
            
            <script>
                async function loadGallery() {
                    try {
                        const response = await fetch('/api/gallery');
                        const data = await response.json();
                        
                        const gallery = document.getElementById('gallery');
                        gallery.innerHTML = '<h3>Image Gallery</h3>';
                        
                        data.images.forEach(image => {
                            const div = document.createElement('div');
                            div.className = 'file-item';
                            div.innerHTML = `
                                <img src="${image.url}" alt="${image.filename}">
                                <p><strong>${image.filename}</strong></p>
                                <p>Size: ${(image.size / 1024).toFixed(2)} KB</p>
                                <p>Modified: ${new Date(image.modified).toLocaleString()}</p>
                                <button onclick="deleteFile('${image.filename}')">Delete</button>
                            `;
                            gallery.appendChild(div);
                        });
                    } catch (error) {
                        console.error('Error loading gallery:', error);
                    }
                }
                
                async function deleteFile(filename) {
                    if (confirm('Are you sure you want to delete this file?')) {
                        try {
                            const response = await fetch(`/api/files/${filename}`, {
                                method: 'DELETE'
                            });
                            
                            if (response.ok) {
                                alert('File deleted successfully');
                                loadGallery();
                            } else {
                                alert('Failed to delete file');
                            }
                        } catch (error) {
                            console.error('Error deleting file:', error);
                        }
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// Error handling for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    
    if (error.message === 'File type not allowed') {
        return res.status(400).json({ error: error.message });
    }
    
    next(error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
```

## Real-World Use Case

### Complete Static File Server with CDN-like Features

```javascript
// cdn-static-server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const compression = require('compression');
const app = express();

// Enable gzip compression
app.use(compression());

// Security headers middleware
app.use((req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    next();
});

// CORS for static assets
app.use('/assets', (req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    });
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Custom static middleware with versioning
const versionedStatic = (directory, options = {}) => {
    return (req, res, next) => {
        const filePath = path.join(directory, req.path);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return next();
        }
        
        const stats = fs.statSync(filePath);
        
        // Generate ETag based on file content
        const fileContent = fs.readFileSync(filePath);
        const etag = crypto.createHash('md5').update(fileContent).digest('hex');
        
        // Check if client has cached version
        const clientETag = req.get('If-None-Match');
        if (clientETag === etag) {
            return res.status(304).end();
        }
        
        // Set cache headers based on file type
        const ext = path.extname(filePath).toLowerCase();
        let maxAge = '1d'; // Default 1 day
        
        if (['.css', '.js'].includes(ext)) {
            maxAge = '1y'; // CSS/JS cached for 1 year
        } else if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
            maxAge = '30d'; // Images cached for 30 days
        } else if (['.html', '.htm'].includes(ext)) {
            maxAge = '1h'; // HTML cached for 1 hour
        }
        
        // Set response headers
        res.set({
            'Cache-Control': `public, max-age=${parseMaxAge(maxAge)}`,
            'ETag': etag,
            'Last-Modified': stats.mtime.toUTCString(),
            'Content-Length': stats.size
        });
        
        // Set content type
        const mimeType = getMimeType(ext);
        if (mimeType) {
            res.set('Content-Type', mimeType);
        }
        
        // Stream the file
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        
        stream.on('error', (err) => {
            console.error('File stream error:', err);
            if (!res.headersSent) {
                res.status(500).end();
            }
        });
    };
};

// Helper function to parse max-age
function parseMaxAge(maxAge) {
    const units = {
        's': 1,
        'm': 60,
        'h': 3600,
        'd': 86400,
        'w': 604800,
        'y': 31536000
    };
    
    const match = maxAge.match(/^(\d+)([smhdwy])$/);
    if (match) {
        return parseInt(match[1]) * units[match[2]];
    }
    return 86400; // Default 1 day
}

// Helper function for MIME types
function getMimeType(ext) {
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain; charset=utf-8',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
    };
    return mimeTypes[ext];
}

// Use versioned static middleware
app.use('/assets', versionedStatic(path.join(__dirname, 'assets')));
app.use('/static', versionedStatic(path.join(__dirname, 'public')));

// Image optimization endpoint
app.get('/images/:size/:filename', (req, res) => {
    const { size, filename } = req.params;
    const originalPath = path.join(__dirname, 'images', filename);
    
    // Validate size parameter
    const validSizes = ['small', 'medium', 'large', 'thumbnail'];
    if (!validSizes.includes(size)) {
        return res.status(400).json({ error: 'Invalid size parameter' });
    }
    
    // Check if original file exists
    if (!fs.existsSync(originalPath)) {
        return res.status(404).json({ error: 'Image not found' });
    }
    
    // For demo purposes, just serve the original
    // In production, you would resize the image here
    res.set({
        'Cache-Control': 'public, max-age=2592000', // 30 days
        'X-Image-Size': size
    });
    
    res.sendFile(originalPath);
});

// Asset manifest endpoint
app.get('/api/manifest', (req, res) => {
    const assetsDir = path.join(__dirname, 'assets');
    const manifest = {};
    
    function scanDirectory(dir, prefix = '') {
        const files = fs.readdirSync(dir);
        
        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.isDirectory()) {
                scanDirectory(filePath, `${prefix}${file}/`);
            } else {
                const relativePath = `${prefix}${file}`;
                const content = fs.readFileSync(filePath);
                const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
                
                manifest[relativePath] = {
                    path: `/assets/${relativePath}`,
                    hash,
                    size: stats.size,
                    modified: stats.mtime.toISOString()
                };
            }
        });
    }
    
    if (fs.existsSync(assetsDir)) {
        scanDirectory(assetsDir);
    }
    
    res.json({
        manifest,
        generated: new Date().toISOString(),
        count: Object.keys(manifest).length
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const directories = ['assets', 'public', 'images'];
    const status = {};
    
    directories.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        status[dir] = {
            exists: fs.existsSync(dirPath),
            readable: fs.existsSync(dirPath) ? fs.constants.R_OK : false
        };
    });
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        directories: status,
        uptime: process.uptime()
    });
});

// Create sample directories and files
const sampleDirs = ['assets/css', 'assets/js', 'assets/images', 'public', 'images'];
sampleDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Create sample files
const sampleFiles = {
    'assets/css/style.css': 'body { font-family: Arial, sans-serif; }',
    'assets/js/app.js': 'console.log("App loaded");',
    'public/index.html': '<!DOCTYPE html><html><head><title>Demo</title></head><body><h1>Hello World</h1></body></html>'
};

Object.entries(sampleFiles).forEach(([filePath, content]) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, content);
    }
});

// Default route
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>CDN-like Static Server</title>
            <link rel="stylesheet" href="/assets/css/style.css">
        </head>
        <body>
            <h1>CDN-like Static File Server</h1>
            <div>
                <h2>Available Endpoints:</h2>
                <ul>
                    <li><a href="/assets/css/style.css">/assets/css/style.css</a></li>
                    <li><a href="/assets/js/app.js">/assets/js/app.js</a></li>
                    <li><a href="/static/index.html">/static/index.html</a></li>
                    <li><a href="/api/manifest">/api/manifest</a></li>
                    <li><a href="/health">/health</a></li>
                </ul>
            </div>
            <script src="/assets/js/app.js"></script>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 CDN-like static server running on http://localhost:${PORT}`);
});
```

## Best Practices

### 1. Organize Static Files Properly
```
project/
├── public/
│   ├── css/
│   ├── js/
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── uploads/
│   ├── images/
│   └── documents/
└── assets/
    ├── vendor/
    └── build/
```

### 2. Set Appropriate Cache Headers
```javascript
const cacheSettings = {
    // Long cache for versioned assets
    versioned: 'public, max-age=31536000, immutable',
    
    // Medium cache for images
    images: 'public, max-age=2592000',
    
    // Short cache for HTML
    html: 'public, max-age=3600',
    
    // No cache for development
    development: 'no-cache, no-store, must-revalidate'
};
```

### 3. Implement Security Headers
```javascript
app.use('/static', (req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Content-Security-Policy': "default-src 'self'"
    });
    next();
});
```

### 4. Use Compression
```javascript
const compression = require('compression');
app.use(compression({
    filter: (req, res) => {
        // Don't compress responses if this request has a 'x-no-compression' header
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Use compression filter function
        return compression.filter(req, res);
    }
}));
```

### 5. Handle File Upload Security
```javascript
const upload = multer({
    storage: multer.diskStorage({
        destination: 'uploads/',
        filename: (req, file, cb) => {
            // Sanitize filename
            const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            cb(null, `${Date.now()}-${sanitized}`);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5
    },
    fileFilter: (req, file, cb) => {
        // Whitelist allowed file types
        const allowedTypes = /jpeg|jpg|png|gif|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});
```

## Summary

Serving static files in Express.js involves:

**Basic Static Serving**:
- Use `express.static()` middleware
- Organize files in logical directories
- Set virtual paths for clean URLs

**Advanced Features**:
- Custom cache headers for different file types
- Security headers and CORS configuration
- File upload handling with validation
- Content compression and optimization

**Performance Optimization**:
- Implement proper caching strategies
- Use ETags for cache validation
- Enable gzip compression
- Set appropriate max-age values

**Security Considerations**:
- Validate file types and sizes
- Sanitize file names
- Set security headers
- Implement access controls

**Production Features**:
- Asset versioning and manifests
- CDN-like caching behavior
- Health checks and monitoring
- Error handling and logging

Mastering static file serving is essential for building performant web applications. Next, we'll explore environment variables and configuration management with dotenv.