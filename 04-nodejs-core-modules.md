# Node.js Core Modules: Built-in Functionality

## Overview

Node.js comes with a rich set of built-in modules that provide essential functionality without requiring external dependencies. These core modules handle file system operations, HTTP requests, path manipulation, operating system interactions, and much more. Understanding these modules is crucial for effective Node.js development.

## Key Concepts

### What are Core Modules?

Core modules are built into Node.js and can be imported using `require()` without installation. They provide:
- File system operations
- HTTP/HTTPS functionality
- Path and URL utilities
- Operating system information
- Cryptographic functions
- Stream processing
- And much more

### CommonJS vs ES Modules

```javascript
// CommonJS (traditional)
const fs = require('fs');

// ES Modules (modern)
import fs from 'fs';
import { readFile } from 'fs';
```

### Synchronous vs Asynchronous APIs

Most core modules provide both sync and async versions:
- Async: Non-blocking, callback-based or Promise-based
- Sync: Blocking, returns result directly

## Example Code

### File System (fs) Module

```javascript
// fs-examples.js
const fs = require('fs');
const path = require('path');

// Reading files
// Asynchronous (preferred)
fs.readFile('data.txt', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err.message);
        return;
    }
    console.log('File content:', data);
});

// Promise-based (modern approach)
const fsPromises = require('fs').promises;

async function readFileAsync() {
    try {
        const data = await fsPromises.readFile('data.txt', 'utf8');
        console.log('File content (async/await):', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Synchronous (use sparingly)
try {
    const data = fs.readFileSync('data.txt', 'utf8');
    console.log('File content (sync):', data);
} catch (error) {
    console.error('Error:', error.message);
}

// Writing files
const content = 'Hello, Node.js!\nThis is a test file.';

// Asynchronous write
fs.writeFile('output.txt', content, 'utf8', (err) => {
    if (err) {
        console.error('Error writing file:', err);
        return;
    }
    console.log('File written successfully!');
});

// Promise-based write
async function writeFileAsync() {
    try {
        await fsPromises.writeFile('output-async.txt', content, 'utf8');
        console.log('File written successfully (async/await)!');
    } catch (error) {
        console.error('Error writing file:', error.message);
    }
}

// Appending to files
fs.appendFile('log.txt', `\n${new Date().toISOString()} - Log entry`, (err) => {
    if (err) {
        console.error('Error appending to file:', err);
        return;
    }
    console.log('Log entry added!');
});

// Working with directories
fs.readdir('.', (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }
    console.log('Files in current directory:', files);
});

// Creating directories
fs.mkdir('new-folder', { recursive: true }, (err) => {
    if (err) {
        console.error('Error creating directory:', err);
        return;
    }
    console.log('Directory created!');
});

// File stats
fs.stat('package.json', (err, stats) => {
    if (err) {
        console.error('Error getting file stats:', err);
        return;
    }
    
    console.log('File stats:');
    console.log('  Size:', stats.size, 'bytes');
    console.log('  Is file:', stats.isFile());
    console.log('  Is directory:', stats.isDirectory());
    console.log('  Created:', stats.birthtime);
    console.log('  Modified:', stats.mtime);
});

// Check if file exists
fs.access('somefile.txt', fs.constants.F_OK, (err) => {
    if (err) {
        console.log('File does not exist');
    } else {
        console.log('File exists');
    }
});
```

### Path Module

```javascript
// path-examples.js
const path = require('path');

// Path manipulation
const filePath = '/users/john/documents/file.txt';

console.log('Full path:', filePath);
console.log('Directory:', path.dirname(filePath));     // /users/john/documents
console.log('Filename:', path.basename(filePath));     // file.txt
console.log('Extension:', path.extname(filePath));     // .txt
console.log('Name without ext:', path.basename(filePath, '.txt')); // file

// Parsing paths
const parsed = path.parse(filePath);
console.log('Parsed path:', parsed);
// {
//   root: '/',
//   dir: '/users/john/documents',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// Building paths
const newPath = path.format({
    dir: '/users/jane/projects',
    name: 'app',
    ext: '.js'
});
console.log('Formatted path:', newPath); // /users/jane/projects/app.js

// Joining paths (cross-platform)
const joinedPath = path.join('/users', 'john', 'documents', 'file.txt');
console.log('Joined path:', joinedPath);

// Resolving absolute paths
const absolutePath = path.resolve('documents', 'file.txt');
console.log('Absolute path:', absolutePath);

// Relative paths
const relativePath = path.relative('/users/john', '/users/john/documents/file.txt');
console.log('Relative path:', relativePath); // documents/file.txt

// Cross-platform path separators
console.log('Path separator:', path.sep);        // \ on Windows, / on Unix
console.log('Path delimiter:', path.delimiter);  // ; on Windows, : on Unix

// Normalize paths
const messyPath = '/users/john/../jane/./documents//file.txt';
console.log('Normalized:', path.normalize(messyPath)); // /users/jane/documents/file.txt
```

### HTTP Module

```javascript
// http-examples.js
const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Basic HTTP server
const server = http.createServer((req, res) => {
    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle different routes
    if (pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <h1>Welcome to Node.js HTTP Server</h1>
            <p>Current time: ${new Date().toISOString()}</p>
            <ul>
                <li><a href="/api/users">Users API</a></li>
                <li><a href="/api/health">Health Check</a></li>
                <li><a href="/api/info?name=John&age=30">Info with Query</a></li>
            </ul>
        `);
    } else if (pathname === '/api/users') {
        const users = [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
        ];
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users, null, 2));
    } else if (pathname === '/api/health') {
        const healthData = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage()
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(healthData, null, 2));
    } else if (pathname === '/api/info') {
        const info = {
            message: 'Hello from Node.js!',
            query: query,
            method: req.method,
            headers: req.headers,
            url: req.url
        };
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(info, null, 2));
    } else if (req.method === 'POST' && pathname === '/api/data') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const response = {
                    message: 'Data received successfully',
                    receivedData: data,
                    timestamp: new Date().toISOString()
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(response, null, 2));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// HTTP client example
function makeHttpRequest() {
    const options = {
        hostname: 'jsonplaceholder.typicode.com',
        port: 443,
        path: '/posts/1',
        method: 'GET',
        headers: {
            'User-Agent': 'Node.js HTTP Client'
        }
    };
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log('Response:', JSON.parse(data));
        });
    });
    
    req.on('error', (error) => {
        console.error('Request error:', error);
    });
    
    req.end();
}

// Uncomment to test HTTP client
// makeHttpRequest();
```

### OS Module

```javascript
// os-examples.js
const os = require('os');

// System information
console.log('Operating System Information:');
console.log('Platform:', os.platform());        // win32, darwin, linux
console.log('Architecture:', os.arch());        // x64, arm64, etc.
console.log('CPU Model:', os.cpus()[0].model);
console.log('CPU Cores:', os.cpus().length);
console.log('Total Memory:', (os.totalmem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('Free Memory:', (os.freemem() / 1024 / 1024 / 1024).toFixed(2), 'GB');
console.log('Uptime:', (os.uptime() / 3600).toFixed(2), 'hours');
console.log('Hostname:', os.hostname());
console.log('Home Directory:', os.homedir());
console.log('Temp Directory:', os.tmpdir());
console.log('Username:', os.userInfo().username);

// Network interfaces
console.log('\nNetwork Interfaces:');
const networkInterfaces = os.networkInterfaces();
Object.keys(networkInterfaces).forEach(interfaceName => {
    const interfaces = networkInterfaces[interfaceName];
    interfaces.forEach(interface => {
        if (interface.family === 'IPv4' && !interface.internal) {
            console.log(`${interfaceName}: ${interface.address}`);
        }
    });
});

// Load average (Unix-like systems)
if (os.platform() !== 'win32') {
    console.log('\nLoad Average:', os.loadavg());
}

// EOL (End of Line) character
console.log('\nEOL character code:', os.EOL.charCodeAt(0));
```

### URL Module

```javascript
// url-examples.js
const url = require('url');
const { URL, URLSearchParams } = require('url');

// Legacy URL parsing
const urlString = 'https://example.com:8080/path/to/resource?name=john&age=30#section1';
const parsedUrl = url.parse(urlString, true);

console.log('Legacy URL parsing:');
console.log('Protocol:', parsedUrl.protocol);    // https:
console.log('Host:', parsedUrl.host);            // example.com:8080
console.log('Hostname:', parsedUrl.hostname);    // example.com
console.log('Port:', parsedUrl.port);            // 8080
console.log('Pathname:', parsedUrl.pathname);    // /path/to/resource
console.log('Query:', parsedUrl.query);          // { name: 'john', age: '30' }
console.log('Hash:', parsedUrl.hash);            // #section1

// Modern URL API
const modernUrl = new URL(urlString);

console.log('\nModern URL API:');
console.log('Origin:', modernUrl.origin);        // https://example.com:8080
console.log('Protocol:', modernUrl.protocol);    // https:
console.log('Host:', modernUrl.host);            // example.com:8080
console.log('Hostname:', modernUrl.hostname);    // example.com
console.log('Port:', modernUrl.port);            // 8080
console.log('Pathname:', modernUrl.pathname);    // /path/to/resource
console.log('Search:', modernUrl.search);        // ?name=john&age=30
console.log('Hash:', modernUrl.hash);            // #section1

// Working with search parameters
const params = new URLSearchParams(modernUrl.search);
console.log('\nSearch Parameters:');
console.log('Name:', params.get('name'));        // john
console.log('Age:', params.get('age'));          // 30

// Adding/modifying parameters
params.set('city', 'New York');
params.append('hobby', 'reading');
params.append('hobby', 'coding');

console.log('Modified search:', params.toString());

// Building URLs
const baseUrl = 'https://api.example.com';
const endpoint = '/users';
const queryParams = new URLSearchParams({
    page: '1',
    limit: '10',
    sort: 'name'
});

const apiUrl = new URL(endpoint, baseUrl);
apiUrl.search = queryParams.toString();

console.log('\nBuilt API URL:', apiUrl.toString());
```

## Real-World Use Case

### File-based Logger with Core Modules

```javascript
// logger.js
const fs = require('fs');
const path = require('path');
const os = require('os');

class FileLogger {
    constructor(logDir = 'logs') {
        this.logDir = logDir;
        this.ensureLogDirectory();
    }
    
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }
    
    getLogFileName() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `app-${date}.log`);
    }
    
    formatLogEntry(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const hostname = os.hostname();
        const pid = process.pid;
        
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            message,
            hostname,
            pid,
            ...meta
        };
        
        return JSON.stringify(logEntry) + os.EOL;
    }
    
    async writeLog(level, message, meta = {}) {
        const logEntry = this.formatLogEntry(level, message, meta);
        const logFile = this.getLogFileName();
        
        try {
            await fs.promises.appendFile(logFile, logEntry, 'utf8');
        } catch (error) {
            console.error('Failed to write log:', error.message);
        }
    }
    
    info(message, meta = {}) {
        return this.writeLog('info', message, meta);
    }
    
    error(message, meta = {}) {
        return this.writeLog('error', message, meta);
    }
    
    warn(message, meta = {}) {
        return this.writeLog('warn', message, meta);
    }
    
    debug(message, meta = {}) {
        return this.writeLog('debug', message, meta);
    }
    
    async getLogs(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const logFile = path.join(this.logDir, `app-${targetDate}.log`);
        
        try {
            const content = await fs.promises.readFile(logFile, 'utf8');
            return content.split(os.EOL)
                .filter(line => line.trim())
                .map(line => JSON.parse(line));
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }
    
    async getLogStats() {
        try {
            const files = await fs.promises.readdir(this.logDir);
            const logFiles = files.filter(file => file.endsWith('.log'));
            
            const stats = await Promise.all(
                logFiles.map(async file => {
                    const filePath = path.join(this.logDir, file);
                    const stat = await fs.promises.stat(filePath);
                    return {
                        file,
                        size: stat.size,
                        created: stat.birthtime,
                        modified: stat.mtime
                    };
                })
            );
            
            return stats;
        } catch (error) {
            console.error('Failed to get log stats:', error.message);
            return [];
        }
    }
}

// Usage example
async function demonstrateLogger() {
    const logger = new FileLogger();
    
    // Log some entries
    await logger.info('Application started', { version: '1.0.0' });
    await logger.warn('This is a warning', { component: 'auth' });
    await logger.error('An error occurred', { error: 'Database connection failed' });
    
    // Get today's logs
    const logs = await logger.getLogs();
    console.log('Today\'s logs:', logs);
    
    // Get log file statistics
    const stats = await logger.getLogStats();
    console.log('Log file stats:', stats);
}

// Export for use in other modules
module.exports = FileLogger;

// Run demonstration if this file is executed directly
if (require.main === module) {
    demonstrateLogger().catch(console.error);
}
```

## Best Practices

### 1. Always Use Asynchronous APIs
```javascript
// ❌ Bad - blocks the event loop
const data = fs.readFileSync('large-file.txt');

// ✅ Good - non-blocking
fs.readFile('large-file.txt', (err, data) => {
    // Handle result
});

// ✅ Even better - modern async/await
const data = await fs.promises.readFile('large-file.txt');
```

### 2. Handle Errors Properly
```javascript
// ❌ Bad - unhandled errors
fs.readFile('file.txt', (err, data) => {
    console.log(data.toString());
});

// ✅ Good - proper error handling
fs.readFile('file.txt', (err, data) => {
    if (err) {
        if (err.code === 'ENOENT') {
            console.log('File not found');
        } else {
            console.error('Error reading file:', err.message);
        }
        return;
    }
    console.log(data.toString());
});
```

### 3. Use Path Module for Cross-Platform Compatibility
```javascript
// ❌ Bad - platform-specific
const filePath = 'logs/app.log';

// ✅ Good - cross-platform
const filePath = path.join('logs', 'app.log');
```

### 4. Validate Input and Handle Edge Cases
```javascript
function safeReadFile(filename) {
    if (!filename || typeof filename !== 'string') {
        throw new Error('Filename must be a non-empty string');
    }
    
    const normalizedPath = path.normalize(filename);
    
    // Prevent directory traversal attacks
    if (normalizedPath.includes('..')) {
        throw new Error('Invalid file path');
    }
    
    return fs.promises.readFile(normalizedPath, 'utf8');
}
```

### 5. Use Streams for Large Files
```javascript
// For large files, use streams instead of reading everything into memory
const fs = require('fs');
const readline = require('readline');

async function processLargeFile(filename) {
    const fileStream = fs.createReadStream(filename);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    
    for await (const line of rl) {
        // Process each line without loading entire file into memory
        console.log(line);
    }
}
```

## Summary

Node.js core modules provide essential functionality for:

- **File System (fs)**: Reading, writing, and manipulating files and directories
- **Path**: Cross-platform path manipulation and resolution
- **HTTP**: Creating servers and making HTTP requests
- **OS**: Accessing operating system information and utilities
- **URL**: Parsing and manipulating URLs

Key principles:
- Always prefer asynchronous APIs to avoid blocking the event loop
- Handle errors appropriately with proper error checking
- Use path module for cross-platform file path handling
- Validate inputs and handle edge cases
- Consider using streams for large data processing

These core modules form the foundation for building robust Node.js applications. Next, we'll explore how to create HTTP servers and build our first web applications.