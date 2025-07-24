# Database Integration: MongoDB and Mongoose

## Overview

MongoDB is a popular NoSQL document database that stores data in flexible, JSON-like documents. Mongoose is an Object Document Mapping (ODM) library for MongoDB and Node.js that provides a schema-based solution to model application data. This chapter covers integrating MongoDB with Express.js applications using Mongoose, including schema design, CRUD operations, data validation, and advanced querying.

## Key Concepts

### MongoDB Fundamentals

**Document Database**: MongoDB stores data in BSON (Binary JSON) documents within collections.

**Collections**: Groups of documents, similar to tables in relational databases.

**Documents**: Individual records stored as key-value pairs, similar to rows in relational databases.

**Schema-less**: Documents in a collection don't need to have the same structure.

### Mongoose Benefits

**Schema Definition**: Define structure and validation rules for documents.

**Type Casting**: Automatic type conversion and validation.

**Middleware**: Pre and post hooks for document operations.

**Query Building**: Chainable query API with powerful features.

**Population**: Reference other documents and populate them automatically.

**Validation**: Built-in and custom validation rules.

## Example Code

### Database Connection Setup

```javascript
// config/database.js - Database Configuration
const mongoose = require('mongoose');

class DatabaseConnection {
    constructor() {
        this.connection = null;
        this.isConnected = false;
    }
    
    async connect(options = {}) {
        try {
            const mongoUri = options.uri || process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';
            
            const connectionOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: options.maxPoolSize || 10,
                serverSelectionTimeoutMS: options.serverSelectionTimeoutMS || 5000,
                socketTimeoutMS: options.socketTimeoutMS || 45000,
                bufferCommands: false,
                bufferMaxEntries: 0,
                ...options.mongooseOptions
            };
            
            this.connection = await mongoose.connect(mongoUri, connectionOptions);
            this.isConnected = true;
            
            console.log(`✅ MongoDB connected: ${this.connection.connection.host}:${this.connection.connection.port}`);
            console.log(`📊 Database: ${this.connection.connection.name}`);
            
            // Connection event listeners
            mongoose.connection.on('error', this.handleError.bind(this));
            mongoose.connection.on('disconnected', this.handleDisconnected.bind(this));
            mongoose.connection.on('reconnected', this.handleReconnected.bind(this));
            
            return this.connection;
        } catch (error) {
            console.error('❌ MongoDB connection error:', error.message);
            throw error;
        }
    }
    
    async disconnect() {
        try {
            if (this.isConnected) {
                await mongoose.disconnect();
                this.isConnected = false;
                console.log('📴 MongoDB disconnected');
            }
        } catch (error) {
            console.error('❌ MongoDB disconnection error:', error.message);
            throw error;
        }
    }
    
    handleError(error) {
        console.error('❌ MongoDB error:', error.message);
        this.isConnected = false;
    }
    
    handleDisconnected() {
        console.warn('⚠️ MongoDB disconnected');
        this.isConnected = false;
    }
    
    handleReconnected() {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
    }
    
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }
    
    // Health check
    async healthCheck() {
        try {
            const adminDb = mongoose.connection.db.admin();
            const result = await adminDb.ping();
            return {
                status: 'healthy',
                ping: result,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = new DatabaseConnection();
```

### Schema Definitions

```javascript
// models/User.js - User Schema
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include password in queries by default
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
        type: String,
        validate: {
            validator: function(v) {
                return !v || validator.isURL(v);
            },
            message: 'Avatar must be a valid URL'
        }
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin', 'moderator'],
            message: 'Role must be either user, admin, or moderator'
        },
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
        },
        notifications: {
            email: { type: Boolean, default: true },
            push: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        },
        timezone: {
            type: String,
            default: 'UTC'
        }
    },
    metadata: {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        tags: [{
            type: String,
            trim: true
        }],
        notes: String
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'metadata.tags': 1 });

// Virtual properties
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('initials').get(function() {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
});

userSchema.virtual('tasksCount', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'assignedTo',
    count: true
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware for username uniqueness
userSchema.pre('save', async function(next) {
    if (!this.isModified('username')) return next();
    
    try {
        const existingUser = await this.constructor.findOne({ 
            username: this.username,
            _id: { $ne: this._id }
        });
        
        if (existingUser) {
            const error = new Error('Username already exists');
            error.name = 'ValidationError';
            return next(error);
        }
        
        next();
    } catch (error) {
        next(error);
    }
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    return await this.save({ validateBeforeSave: false });
};

userSchema.methods.toPublicJSON = function() {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.__v;
    return userObject;
};

// Static methods
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
    return this.find({ isActive: true });
};

userSchema.statics.getUserStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: {
                    $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
                },
                adminUsers: {
                    $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] }
                },
                averageTasksPerUser: { $avg: '$tasksCount' }
            }
        }
    ]);
    
    return stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        adminUsers: 0,
        averageTasksPerUser: 0
    };
};

module.exports = mongoose.model('User', userSchema);
```

```javascript
// models/Task.js - Task Schema
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'in-progress', 'completed', 'cancelled'],
            message: 'Status must be pending, in-progress, completed, or cancelled'
        },
        default: 'pending'
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high', 'urgent'],
            message: 'Priority must be low, medium, high, or urgent'
        },
        default: 'medium'
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        maxlength: [50, 'Category cannot exceed 50 characters']
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Task must be assigned to a user']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator is required']
    },
    dueDate: {
        type: Date,
        validate: {
            validator: function(v) {
                return !v || v > new Date();
            },
            message: 'Due date must be in the future'
        }
    },
    completedAt: {
        type: Date
    },
    estimatedHours: {
        type: Number,
        min: [0, 'Estimated hours cannot be negative'],
        max: [1000, 'Estimated hours cannot exceed 1000']
    },
    actualHours: {
        type: Number,
        min: [0, 'Actual hours cannot be negative'],
        max: [1000, 'Actual hours cannot exceed 1000']
    },
    attachments: [{
        filename: {
            type: String,
            required: true
        },
        originalName: {
            type: String,
            required: true
        },
        mimetype: {
            type: String,
            required: true
        },
        size: {
            type: Number,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            maxlength: [1000, 'Comment cannot exceed 1000 characters']
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        editedAt: Date,
        isEdited: {
            type: Boolean,
            default: false
        }
    }],
    subtasks: [{
        title: {
            type: String,
            required: [true, 'Subtask title is required'],
            trim: true,
            maxlength: [200, 'Subtask title cannot exceed 200 characters']
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: Date,
        order: {
            type: Number,
            default: 0
        }
    }],
    isArchived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' }); // Text search

// Virtual properties
taskSchema.virtual('isOverdue').get(function() {
    return this.dueDate && this.dueDate < new Date() && this.status !== 'completed';
});

taskSchema.virtual('daysUntilDue').get(function() {
    if (!this.dueDate) return null;
    const diffTime = this.dueDate - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

taskSchema.virtual('completionPercentage').get(function() {
    if (this.subtasks.length === 0) {
        return this.status === 'completed' ? 100 : 0;
    }
    
    const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

taskSchema.virtual('timeSpent').get(function() {
    return this.actualHours || 0;
});

// Pre-save middleware
taskSchema.pre('save', function(next) {
    // Set completedAt when status changes to completed
    if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    }
    
    // Clear completedAt when status changes from completed
    if (this.isModified('status') && this.status !== 'completed' && this.completedAt) {
        this.completedAt = undefined;
    }
    
    next();
});

// Pre-save middleware for subtasks
taskSchema.pre('save', function(next) {
    if (this.isModified('subtasks')) {
        this.subtasks.forEach((subtask, index) => {
            if (subtask.completed && !subtask.completedAt) {
                subtask.completedAt = new Date();
            } else if (!subtask.completed && subtask.completedAt) {
                subtask.completedAt = undefined;
            }
            
            // Set order if not provided
            if (subtask.order === undefined) {
                subtask.order = index;
            }
        });
    }
    
    next();
});

// Instance methods
taskSchema.methods.addComment = function(authorId, content) {
    this.comments.push({
        author: authorId,
        content: content
    });
    return this.save();
};

taskSchema.methods.addSubtask = function(title) {
    this.subtasks.push({
        title: title,
        order: this.subtasks.length
    });
    return this.save();
};

taskSchema.methods.toggleSubtask = function(subtaskId) {
    const subtask = this.subtasks.id(subtaskId);
    if (subtask) {
        subtask.completed = !subtask.completed;
        subtask.completedAt = subtask.completed ? new Date() : undefined;
        return this.save();
    }
    throw new Error('Subtask not found');
};

taskSchema.methods.archive = function() {
    this.isArchived = true;
    return this.save();
};

taskSchema.methods.unarchive = function() {
    this.isArchived = false;
    return this.save();
};

// Static methods
taskSchema.statics.findByUser = function(userId) {
    return this.find({ assignedTo: userId, isArchived: false });
};

taskSchema.statics.findOverdue = function() {
    return this.find({
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' },
        isArchived: false
    });
};

taskSchema.statics.getTaskStats = async function(userId = null) {
    const matchStage = userId ? { assignedTo: mongoose.Types.ObjectId(userId) } : {};
    
    const stats = await this.aggregate([
        { $match: { ...matchStage, isArchived: false } },
        {
            $group: {
                _id: null,
                totalTasks: { $sum: 1 },
                pendingTasks: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                },
                inProgressTasks: {
                    $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
                },
                completedTasks: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                overdueTasks: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $lt: ['$dueDate', new Date()] },
                                    { $ne: ['$status', 'completed'] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                averageCompletionTime: {
                    $avg: {
                        $cond: [
                            { $eq: ['$status', 'completed'] },
                            { $subtract: ['$completedAt', '$createdAt'] },
                            null
                        ]
                    }
                }
            }
        }
    ]);
    
    return stats[0] || {
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
        averageCompletionTime: 0
    };
};

module.exports = mongoose.model('Task', taskSchema);
```

### Service Layer with Advanced Queries

```javascript
// services/TaskService.js - Task Business Logic
const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

class TaskService {
    // Create a new task
    async createTask(taskData, createdBy) {
        try {
            // Validate assignee exists
            const assignee = await User.findById(taskData.assignedTo);
            if (!assignee) {
                throw new Error('Assigned user not found');
            }
            
            const task = new Task({
                ...taskData,
                createdBy
            });
            
            await task.save();
            
            // Populate references
            await task.populate([
                { path: 'assignedTo', select: 'username email firstName lastName' },
                { path: 'createdBy', select: 'username email firstName lastName' }
            ]);
            
            return task;
        } catch (error) {
            throw new Error(`Failed to create task: ${error.message}`);
        }
    }
    
    // Get tasks with advanced filtering and pagination
    async getTasks(options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                status,
                priority,
                category,
                assignedTo,
                createdBy,
                tags,
                search,
                dueDateFrom,
                dueDateTo,
                isOverdue,
                includeArchived = false
            } = options;
            
            // Build query
            const query = {};
            
            if (!includeArchived) {
                query.isArchived = false;
            }
            
            if (status) {
                if (Array.isArray(status)) {
                    query.status = { $in: status };
                } else {
                    query.status = status;
                }
            }
            
            if (priority) {
                if (Array.isArray(priority)) {
                    query.priority = { $in: priority };
                } else {
                    query.priority = priority;
                }
            }
            
            if (category) {
                query.category = new RegExp(category, 'i');
            }
            
            if (assignedTo) {
                query.assignedTo = assignedTo;
            }
            
            if (createdBy) {
                query.createdBy = createdBy;
            }
            
            if (tags && tags.length > 0) {
                query.tags = { $in: tags };
            }
            
            if (search) {
                query.$text = { $search: search };
            }
            
            // Date range filtering
            if (dueDateFrom || dueDateTo) {
                query.dueDate = {};
                if (dueDateFrom) {
                    query.dueDate.$gte = new Date(dueDateFrom);
                }
                if (dueDateTo) {
                    query.dueDate.$lte = new Date(dueDateTo);
                }
            }
            
            // Overdue filtering
            if (isOverdue === true) {
                query.dueDate = { $lt: new Date() };
                query.status = { $ne: 'completed' };
            }
            
            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
            
            // Calculate pagination
            const skip = (page - 1) * limit;
            
            // Execute query with population
            const [tasks, totalCount] = await Promise.all([
                Task.find(query)
                    .populate('assignedTo', 'username email firstName lastName avatar')
                    .populate('createdBy', 'username email firstName lastName')
                    .populate('comments.author', 'username firstName lastName avatar')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Task.countDocuments(query)
            ]);
            
            // Calculate pagination info
            const totalPages = Math.ceil(totalCount / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;
            
            return {
                tasks,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalCount,
                    hasNextPage,
                    hasPrevPage,
                    limit: parseInt(limit)
                },
                filters: {
                    status,
                    priority,
                    category,
                    assignedTo,
                    createdBy,
                    tags,
                    search,
                    dueDateFrom,
                    dueDateTo,
                    isOverdue
                }
            };
        } catch (error) {
            throw new Error(`Failed to get tasks: ${error.message}`);
        }
    }
    
    // Get task by ID with full population
    async getTaskById(taskId, userId = null) {
        try {
            if (!mongoose.Types.ObjectId.isValid(taskId)) {
                throw new Error('Invalid task ID');
            }
            
            const query = { _id: taskId };
            
            // If userId provided, ensure user has access to the task
            if (userId) {
                query.$or = [
                    { assignedTo: userId },
                    { createdBy: userId }
                ];
            }
            
            const task = await Task.findOne(query)
                .populate('assignedTo', 'username email firstName lastName avatar role')
                .populate('createdBy', 'username email firstName lastName avatar')
                .populate('comments.author', 'username firstName lastName avatar')
                .lean();
            
            if (!task) {
                throw new Error('Task not found or access denied');
            }
            
            return task;
        } catch (error) {
            throw new Error(`Failed to get task: ${error.message}`);
        }
    }
    
    // Update task
    async updateTask(taskId, updateData, userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(taskId)) {
                throw new Error('Invalid task ID');
            }
            
            // Find task and check permissions
            const task = await Task.findOne({
                _id: taskId,
                $or: [
                    { assignedTo: userId },
                    { createdBy: userId }
                ]
            });
            
            if (!task) {
                throw new Error('Task not found or access denied');
            }
            
            // Validate assignee if being updated
            if (updateData.assignedTo && updateData.assignedTo !== task.assignedTo.toString()) {
                const assignee = await User.findById(updateData.assignedTo);
                if (!assignee) {
                    throw new Error('Assigned user not found');
                }
            }
            
            // Update task
            Object.assign(task, updateData);
            await task.save();
            
            // Populate and return updated task
            await task.populate([
                { path: 'assignedTo', select: 'username email firstName lastName avatar' },
                { path: 'createdBy', select: 'username email firstName lastName' },
                { path: 'comments.author', select: 'username firstName lastName avatar' }
            ]);
            
            return task;
        } catch (error) {
            throw new Error(`Failed to update task: ${error.message}`);
        }
    }
    
    // Delete task
    async deleteTask(taskId, userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(taskId)) {
                throw new Error('Invalid task ID');
            }
            
            const task = await Task.findOneAndDelete({
                _id: taskId,
                $or: [
                    { assignedTo: userId },
                    { createdBy: userId }
                ]
            });
            
            if (!task) {
                throw new Error('Task not found or access denied');
            }
            
            return { message: 'Task deleted successfully' };
        } catch (error) {
            throw new Error(`Failed to delete task: ${error.message}`);
        }
    }
    
    // Bulk operations
    async bulkUpdateTasks(taskIds, updateData, userId) {
        try {
            const validIds = taskIds.filter(id => mongoose.Types.ObjectId.isValid(id));
            
            if (validIds.length === 0) {
                throw new Error('No valid task IDs provided');
            }
            
            const result = await Task.updateMany(
                {
                    _id: { $in: validIds },
                    $or: [
                        { assignedTo: userId },
                        { createdBy: userId }
                    ]
                },
                updateData
            );
            
            return {
                matchedCount: result.matchedCount,
                modifiedCount: result.modifiedCount,
                message: `Updated ${result.modifiedCount} tasks`
            };
        } catch (error) {
            throw new Error(`Failed to bulk update tasks: ${error.message}`);
        }
    }
    
    // Get task analytics
    async getTaskAnalytics(userId = null, dateRange = null) {
        try {
            const matchStage = {};
            
            if (userId) {
                matchStage.$or = [
                    { assignedTo: mongoose.Types.ObjectId(userId) },
                    { createdBy: mongoose.Types.ObjectId(userId) }
                ];
            }
            
            if (dateRange) {
                matchStage.createdAt = {
                    $gte: new Date(dateRange.from),
                    $lte: new Date(dateRange.to)
                };
            }
            
            const analytics = await Task.aggregate([
                { $match: { ...matchStage, isArchived: false } },
                {
                    $facet: {
                        statusDistribution: [
                            {
                                $group: {
                                    _id: '$status',
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        priorityDistribution: [
                            {
                                $group: {
                                    _id: '$priority',
                                    count: { $sum: 1 }
                                }
                            }
                        ],
                        categoryDistribution: [
                            {
                                $group: {
                                    _id: '$category',
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { count: -1 } },
                            { $limit: 10 }
                        ],
                        completionTrend: [
                            {
                                $match: { status: 'completed' }
                            },
                            {
                                $group: {
                                    _id: {
                                        year: { $year: '$completedAt' },
                                        month: { $month: '$completedAt' },
                                        day: { $dayOfMonth: '$completedAt' }
                                    },
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
                        ],
                        averageCompletionTime: [
                            {
                                $match: { status: 'completed', completedAt: { $exists: true } }
                            },
                            {
                                $group: {
                                    _id: null,
                                    avgTime: {
                                        $avg: {
                                            $subtract: ['$completedAt', '$createdAt']
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            ]);
            
            return analytics[0];
        } catch (error) {
            throw new Error(`Failed to get task analytics: ${error.message}`);
        }
    }
}

module.exports = new TaskService();
```

### Database Middleware and Hooks

```javascript
// middleware/database.js - Database Middleware
const mongoose = require('mongoose');
const database = require('../config/database');

class DatabaseMiddleware {
    // Connection middleware
    static async ensureConnection(req, res, next) {
        try {
            if (!database.isConnected) {
                await database.connect();
            }
            next();
        } catch (error) {
            res.status(503).json({
                success: false,
                error: 'Service Unavailable',
                message: 'Database connection failed'
            });
        }
    }
    
    // Transaction middleware
    static withTransaction() {
        return async (req, res, next) => {
            const session = await mongoose.startSession();
            
            try {
                await session.withTransaction(async () => {
                    req.dbSession = session;
                    await new Promise((resolve, reject) => {
                        const originalEnd = res.end;
                        res.end = (...args) => {
                            if (res.statusCode >= 400) {
                                reject(new Error('Transaction failed due to error response'));
                            } else {
                                resolve();
                            }
                            originalEnd.apply(res, args);
                        };
                        
                        next();
                    });
                });
            } catch (error) {
                console.error('Transaction failed:', error);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'Internal Server Error',
                        message: 'Transaction failed'
                    });
                }
            } finally {
                await session.endSession();
            }
        };
    }
    
    // Database health check middleware
    static healthCheck() {
        return async (req, res, next) => {
            try {
                const health = await database.healthCheck();
                req.dbHealth = health;
                next();
            } catch (error) {
                req.dbHealth = {
                    status: 'unhealthy',
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
                next();
            }
        };
    }
    
    // Query performance monitoring
    static queryMonitor() {
        return (req, res, next) => {
            const originalQuery = mongoose.Query.prototype.exec;
            const queries = [];
            
            mongoose.Query.prototype.exec = function() {
                const startTime = Date.now();
                const query = this.getQuery();
                const collection = this.mongooseCollection.name;
                
                return originalQuery.call(this).then(result => {
                    const duration = Date.now() - startTime;
                    queries.push({
                        collection,
                        query,
                        duration,
                        timestamp: new Date().toISOString()
                    });
                    
                    return result;
                });
            };
            
            // Restore original exec after request
            const originalEnd = res.end;
            res.end = (...args) => {
                mongoose.Query.prototype.exec = originalQuery;
                
                // Add query info to response headers (for debugging)
                if (process.env.NODE_ENV === 'development') {
                    res.setHeader('X-DB-Queries', queries.length.toString());
                    res.setHeader('X-DB-Query-Time', 
                        queries.reduce((sum, q) => sum + q.duration, 0).toString() + 'ms'
                    );
                }
                
                req.dbQueries = queries;
                originalEnd.apply(res, args);
            };
            
            next();
        };
    }
}

module.exports = DatabaseMiddleware;
```

## Real-World Use Case

### Complete Task Management API with MongoDB

```javascript
// app.js - Complete Application with MongoDB Integration
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Database
const database = require('./config/database');
const DatabaseMiddleware = require('./middleware/database');

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database middleware
app.use(DatabaseMiddleware.ensureConnection);
app.use(DatabaseMiddleware.queryMonitor());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health check with database status
app.get('/health', DatabaseMiddleware.healthCheck(), (req, res) => {
    const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        database: req.dbHealth,
        queries: req.dbQueries?.length || 0
    };
    
    const status = req.dbHealth?.status === 'healthy' ? 200 : 503;
    
    res.status(status).json({
        success: status === 200,
        data: healthData
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management API with MongoDB',
        version: '1.0.0',
        database: database.getConnectionStatus(),
        endpoints: {
            auth: '/api/v1/auth',
            tasks: '/api/v1/tasks',
            users: '/api/v1/users',
            analytics: '/api/v1/analytics',
            health: '/health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Application Error:', err);
    
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        
        return res.status(422).json({
            success: false,
            error: 'Validation Error',
            details: errors
        });
    }
    
    // Mongoose cast error
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: `Invalid ${err.path}: ${err.value}`
        });
    }
    
    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({
            success: false,
            error: 'Conflict',
            message: `${field} already exists`
        });
    }
    
    // Default error
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong' 
            : err.message
    });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    
    try {
        await database.disconnect();
        server.close(() => {
            console.log('Process terminated');
        });
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// Start server
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Connect to database
        await database.connect({
            uri: process.env.MONGODB_URI,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000
        });
        
        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API: http://localhost:${PORT}/api/v1`);
            console.log(`🏥 Health: http://localhost:${PORT}/health`);
            console.log(`🗄️ Database: ${database.getConnectionStatus().name}`);
        });
        
        return server;
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    startServer();
}

module.exports = app;
```

## Best Practices

### 1. Schema Design

```javascript
// Use appropriate data types and validation
const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Add indexes for frequently queried fields
    }
});
```

### 2. Use Indexes Effectively

```javascript
// Compound indexes for complex queries
schema.index({ userId: 1, status: 1, createdAt: -1 });

// Text indexes for search
schema.index({ title: 'text', description: 'text' });

// Sparse indexes for optional fields
schema.index({ email: 1 }, { sparse: true });
```

### 3. Handle Errors Properly

```javascript
// Use try-catch with async/await
try {
    const user = await User.findById(id);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
} catch (error) {
    throw new Error(`Database operation failed: ${error.message}`);
}
```

### 4. Use Transactions for Related Operations

```javascript
// Use transactions for operations that must succeed together
const session = await mongoose.startSession();
try {
    await session.withTransaction(async () => {
        await User.create([userData], { session });
        await Task.create([taskData], { session });
    });
} finally {
    await session.endSession();
}
```

### 5. Optimize Queries

```javascript
// Use lean() for read-only operations
const users = await User.find().lean();

// Use select() to limit fields
const users = await User.find().select('name email');

// Use populate() efficiently
const tasks = await Task.find()
    .populate('assignedTo', 'name email')
    .populate('comments.author', 'name');
```

## Summary

MongoDB with Mongoose provides a powerful foundation for Node.js applications:

**Key Features**:
- **Schema Definition**: Structure and validation for documents
- **Type Casting**: Automatic data type conversion
- **Middleware**: Pre and post hooks for document operations
- **Query Building**: Chainable, powerful query API
- **Population**: Reference and populate related documents
- **Validation**: Built-in and custom validation rules

**Advanced Capabilities**:
- **Aggregation**: Complex data processing and analytics
- **Indexing**: Performance optimization for queries
- **Transactions**: ACID compliance for related operations
- **Change Streams**: Real-time data change notifications
- **GridFS**: Large file storage and retrieval

**Best Practices**:
- Design schemas with proper validation and indexes
- Use transactions for related operations
- Optimize queries with lean(), select(), and populate()
- Handle errors appropriately
- Monitor query performance
- Use connection pooling and proper configuration

**Benefits**:
- **Flexibility**: Schema-less design with optional structure
- **Scalability**: Horizontal scaling capabilities
- **Performance**: Optimized for read-heavy workloads
- **Developer Experience**: Intuitive API and powerful features
- **Rich Ecosystem**: Extensive tooling and community support

MongoDB and Mongoose integration enables building robust, scalable applications with complex data requirements. Next, we'll explore authentication and authorization patterns, building upon the database foundation to create secure user management systems.