# CRUD Operations with Express.js

## Overview

CRUD (Create, Read, Update, Delete) operations are the fundamental building blocks of any data-driven application. In Express.js, implementing CRUD operations involves creating endpoints that handle HTTP requests to manipulate data resources. This chapter covers how to build comprehensive CRUD APIs with proper validation, error handling, and real-world patterns.

## Key Concepts

### CRUD Operations Mapping

**CRUD to HTTP Methods**:
- **Create**: POST requests to create new resources
- **Read**: GET requests to retrieve existing resources
- **Update**: PUT (full update) or PATCH (partial update) requests
- **Delete**: DELETE requests to remove resources

### Data Persistence Patterns

**In-Memory Storage**: Simple arrays/objects for development and testing
**File-Based Storage**: JSON files for lightweight persistence
**Database Integration**: SQL/NoSQL databases for production applications

### Validation and Error Handling

**Input Validation**: Ensuring data integrity before processing
**Business Logic Validation**: Enforcing domain-specific rules
**Error Responses**: Consistent error formatting and appropriate status codes

### Advanced CRUD Features

**Filtering**: Query parameters to filter results
**Sorting**: Order results by specific fields
**Pagination**: Handle large datasets efficiently
**Search**: Text-based search across multiple fields
**Bulk Operations**: Handle multiple records in single requests

## Example Code

### Basic CRUD Implementation

```javascript
// models/Task.js - Task Model
class Task {
    constructor(data) {
        this.id = data.id;
        this.title = data.title;
        this.description = data.description || '';
        this.status = data.status || 'pending'; // pending, in-progress, completed
        this.priority = data.priority || 'medium'; // low, medium, high, urgent
        this.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        this.assignedTo = data.assignedTo || null;
        this.tags = data.tags || [];
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.completedAt = data.completedAt || null;
    }
    
    validate() {
        const errors = [];
        
        if (!this.title || this.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters long');
        }
        
        if (this.title && this.title.length > 100) {
            errors.push('Title cannot exceed 100 characters');
        }
        
        if (this.description && this.description.length > 500) {
            errors.push('Description cannot exceed 500 characters');
        }
        
        const validStatuses = ['pending', 'in-progress', 'completed'];
        if (!validStatuses.includes(this.status)) {
            errors.push('Status must be one of: pending, in-progress, completed');
        }
        
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(this.priority)) {
            errors.push('Priority must be one of: low, medium, high, urgent');
        }
        
        if (this.dueDate && this.dueDate < new Date()) {
            errors.push('Due date cannot be in the past');
        }
        
        return errors;
    }
    
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            status: this.status,
            priority: this.priority,
            dueDate: this.dueDate,
            assignedTo: this.assignedTo,
            tags: this.tags,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            completedAt: this.completedAt,
            isOverdue: this.dueDate && this.dueDate < new Date() && this.status !== 'completed'
        };
    }
    
    markCompleted() {
        this.status = 'completed';
        this.completedAt = new Date();
        this.updatedAt = new Date();
    }
    
    updateStatus(newStatus) {
        const oldStatus = this.status;
        this.status = newStatus;
        this.updatedAt = new Date();
        
        if (newStatus === 'completed' && oldStatus !== 'completed') {
            this.completedAt = new Date();
        } else if (newStatus !== 'completed') {
            this.completedAt = null;
        }
    }
}

module.exports = Task;
```

```javascript
// services/TaskService.js - Business Logic Layer
const Task = require('../models/Task');
const fs = require('fs').promises;
const path = require('path');

class TaskService {
    constructor() {
        this.tasks = [];
        this.nextId = 1;
        this.dataFile = path.join(__dirname, '../data/tasks.json');
        this.loadTasks();
    }
    
    // Load tasks from file
    async loadTasks() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            const tasksData = JSON.parse(data);
            this.tasks = tasksData.tasks.map(taskData => new Task(taskData));
            this.nextId = tasksData.nextId || 1;
        } catch (error) {
            // File doesn't exist or is invalid, start with empty array
            this.tasks = [];
            this.nextId = 1;
            await this.saveTasks();
        }
    }
    
    // Save tasks to file
    async saveTasks() {
        try {
            const dataDir = path.dirname(this.dataFile);
            await fs.mkdir(dataDir, { recursive: true });
            
            const data = {
                tasks: this.tasks.map(task => task.toJSON()),
                nextId: this.nextId,
                lastUpdated: new Date().toISOString()
            };
            
            await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving tasks:', error);
            throw new Error('Failed to save tasks');
        }
    }
    
    // CREATE - Add new task
    async createTask(taskData) {
        const task = new Task({
            ...taskData,
            id: this.nextId++
        });
        
        const validationErrors = task.validate();
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
        
        this.tasks.push(task);
        await this.saveTasks();
        
        return task.toJSON();
    }
    
    // READ - Get all tasks with filtering, sorting, and pagination
    async getAllTasks(options = {}) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            status,
            priority,
            assignedTo,
            search,
            tags,
            overdue,
            dueDateFrom,
            dueDateTo
        } = options;
        
        let filteredTasks = [...this.tasks];
        
        // Apply filters
        if (status) {
            filteredTasks = filteredTasks.filter(task => task.status === status);
        }
        
        if (priority) {
            filteredTasks = filteredTasks.filter(task => task.priority === priority);
        }
        
        if (assignedTo) {
            filteredTasks = filteredTasks.filter(task => task.assignedTo === assignedTo);
        }
        
        if (search) {
            const searchLower = search.toLowerCase();
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(searchLower) ||
                task.description.toLowerCase().includes(searchLower) ||
                (task.assignedTo && task.assignedTo.toLowerCase().includes(searchLower))
            );
        }
        
        if (tags) {
            const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
            filteredTasks = filteredTasks.filter(task => 
                tagList.some(tag => task.tags.map(t => t.toLowerCase()).includes(tag))
            );
        }
        
        if (overdue === 'true') {
            const now = new Date();
            filteredTasks = filteredTasks.filter(task => 
                task.dueDate && task.dueDate < now && task.status !== 'completed'
            );
        }
        
        if (dueDateFrom) {
            const fromDate = new Date(dueDateFrom);
            filteredTasks = filteredTasks.filter(task => 
                task.dueDate && task.dueDate >= fromDate
            );
        }
        
        if (dueDateTo) {
            const toDate = new Date(dueDateTo);
            filteredTasks = filteredTasks.filter(task => 
                task.dueDate && task.dueDate <= toDate
            );
        }
        
        // Apply sorting
        filteredTasks.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            // Handle date fields
            if (['createdAt', 'updatedAt', 'dueDate', 'completedAt'].includes(sortBy)) {
                aVal = aVal ? new Date(aVal) : new Date(0);
                bVal = bVal ? new Date(bVal) : new Date(0);
            }
            
            // Handle priority sorting
            if (sortBy === 'priority') {
                const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
                aVal = priorityOrder[aVal] || 0;
                bVal = priorityOrder[bVal] || 0;
            }
            
            if (sortOrder === 'desc') {
                return bVal > aVal ? 1 : -1;
            } else {
                return aVal > bVal ? 1 : -1;
            }
        });
        
        // Apply pagination
        const total = filteredTasks.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedTasks = filteredTasks.slice(offset, offset + limit);
        
        // Calculate statistics
        const stats = {
            total: this.tasks.length,
            filtered: total,
            byStatus: {
                pending: this.tasks.filter(t => t.status === 'pending').length,
                'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
                completed: this.tasks.filter(t => t.status === 'completed').length
            },
            overdue: this.tasks.filter(t => 
                t.dueDate && t.dueDate < new Date() && t.status !== 'completed'
            ).length
        };
        
        return {
            tasks: paginatedTasks.map(task => task.toJSON()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            stats
        };
    }
    
    // READ - Get task by ID
    async getTaskById(id) {
        const task = this.tasks.find(t => t.id === parseInt(id));
        return task ? task.toJSON() : null;
    }
    
    // UPDATE - Update entire task
    async updateTask(id, updateData) {
        const taskIndex = this.tasks.findIndex(t => t.id === parseInt(id));
        
        if (taskIndex === -1) {
            return null;
        }
        
        const updatedTask = new Task({
            ...this.tasks[taskIndex],
            ...updateData,
            id: parseInt(id),
            updatedAt: new Date()
        });
        
        const validationErrors = updatedTask.validate();
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
        
        this.tasks[taskIndex] = updatedTask;
        await this.saveTasks();
        
        return updatedTask.toJSON();
    }
    
    // UPDATE - Partial update
    async patchTask(id, patchData) {
        const taskIndex = this.tasks.findIndex(t => t.id === parseInt(id));
        
        if (taskIndex === -1) {
            return null;
        }
        
        // Handle status change logic
        if (patchData.status && patchData.status !== this.tasks[taskIndex].status) {
            this.tasks[taskIndex].updateStatus(patchData.status);
        }
        
        // Apply other updates
        Object.keys(patchData).forEach(key => {
            if (key !== 'id' && key !== 'createdAt' && patchData[key] !== undefined) {
                this.tasks[taskIndex][key] = patchData[key];
            }
        });
        
        this.tasks[taskIndex].updatedAt = new Date();
        
        const validationErrors = this.tasks[taskIndex].validate();
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }
        
        await this.saveTasks();
        
        return this.tasks[taskIndex].toJSON();
    }
    
    // DELETE - Remove task
    async deleteTask(id) {
        const taskIndex = this.tasks.findIndex(t => t.id === parseInt(id));
        
        if (taskIndex === -1) {
            return null;
        }
        
        const deletedTask = this.tasks.splice(taskIndex, 1)[0];
        await this.saveTasks();
        
        return deletedTask.toJSON();
    }
    
    // BULK OPERATIONS
    async bulkUpdateTasks(ids, updateData) {
        const updatedTasks = [];
        const errors = [];
        
        for (const id of ids) {
            try {
                const updated = await this.patchTask(id, updateData);
                if (updated) {
                    updatedTasks.push(updated);
                } else {
                    errors.push(`Task with ID ${id} not found`);
                }
            } catch (error) {
                errors.push(`Task ${id}: ${error.message}`);
            }
        }
        
        return { updatedTasks, errors };
    }
    
    async bulkDeleteTasks(ids) {
        const deletedTasks = [];
        const errors = [];
        
        // Sort IDs in descending order to avoid index shifting issues
        const sortedIds = ids.sort((a, b) => b - a);
        
        for (const id of sortedIds) {
            const deleted = await this.deleteTask(id);
            if (deleted) {
                deletedTasks.push(deleted);
            } else {
                errors.push(`Task with ID ${id} not found`);
            }
        }
        
        return { deletedTasks: deletedTasks.reverse(), errors };
    }
    
    // ANALYTICS
    async getTaskAnalytics() {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        return {
            total: this.tasks.length,
            byStatus: {
                pending: this.tasks.filter(t => t.status === 'pending').length,
                'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
                completed: this.tasks.filter(t => t.status === 'completed').length
            },
            byPriority: {
                low: this.tasks.filter(t => t.priority === 'low').length,
                medium: this.tasks.filter(t => t.priority === 'medium').length,
                high: this.tasks.filter(t => t.priority === 'high').length,
                urgent: this.tasks.filter(t => t.priority === 'urgent').length
            },
            overdue: this.tasks.filter(t => 
                t.dueDate && t.dueDate < now && t.status !== 'completed'
            ).length,
            completedThisWeek: this.tasks.filter(t => 
                t.completedAt && t.completedAt >= oneWeekAgo
            ).length,
            completedThisMonth: this.tasks.filter(t => 
                t.completedAt && t.completedAt >= oneMonthAgo
            ).length,
            averageCompletionTime: this.calculateAverageCompletionTime(),
            topAssignees: this.getTopAssignees()
        };
    }
    
    calculateAverageCompletionTime() {
        const completedTasks = this.tasks.filter(t => t.completedAt);
        if (completedTasks.length === 0) return 0;
        
        const totalTime = completedTasks.reduce((sum, task) => {
            const completionTime = task.completedAt - task.createdAt;
            return sum + completionTime;
        }, 0);
        
        return Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24)); // days
    }
    
    getTopAssignees() {
        const assigneeCounts = {};
        this.tasks.forEach(task => {
            if (task.assignedTo) {
                assigneeCounts[task.assignedTo] = (assigneeCounts[task.assignedTo] || 0) + 1;
            }
        });
        
        return Object.entries(assigneeCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }
}

module.exports = TaskService;
```

### CRUD Controllers

```javascript
// controllers/TaskController.js - Request/Response Handling
const TaskService = require('../services/TaskService');

class TaskController {
    constructor() {
        this.taskService = new TaskService();
    }
    
    // CREATE - POST /api/tasks
    async createTask(req, res) {
        try {
            const task = await this.taskService.createTask(req.body);
            
            res.status(201).json({
                success: true,
                data: task,
                message: 'Task created successfully'
            });
        } catch (error) {
            if (error.message.includes('Validation failed')) {
                return res.status(422).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // READ - GET /api/tasks
    async getAllTasks(req, res) {
        try {
            const options = {
                page: req.query.page,
                limit: req.query.limit,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
                status: req.query.status,
                priority: req.query.priority,
                assignedTo: req.query.assignedTo,
                search: req.query.search,
                tags: req.query.tags,
                overdue: req.query.overdue,
                dueDateFrom: req.query.dueDateFrom,
                dueDateTo: req.query.dueDateTo
            };
            
            const result = await this.taskService.getAllTasks(options);
            
            res.json({
                success: true,
                data: result.tasks,
                pagination: result.pagination,
                stats: result.stats,
                message: 'Tasks retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // READ - GET /api/tasks/:id
    async getTaskById(req, res) {
        try {
            const task = await this.taskService.getTaskById(req.params.id);
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: `Task with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: task,
                message: 'Task retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // UPDATE - PUT /api/tasks/:id
    async updateTask(req, res) {
        try {
            const task = await this.taskService.updateTask(req.params.id, req.body);
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: `Task with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: task,
                message: 'Task updated successfully'
            });
        } catch (error) {
            if (error.message.includes('Validation failed')) {
                return res.status(422).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // UPDATE - PATCH /api/tasks/:id
    async patchTask(req, res) {
        try {
            const task = await this.taskService.patchTask(req.params.id, req.body);
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: `Task with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: task,
                message: 'Task updated successfully'
            });
        } catch (error) {
            if (error.message.includes('Validation failed')) {
                return res.status(422).json({
                    success: false,
                    error: 'Validation Error',
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // DELETE - DELETE /api/tasks/:id
    async deleteTask(req, res) {
        try {
            const task = await this.taskService.deleteTask(req.params.id);
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: `Task with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: task,
                message: 'Task deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // BULK OPERATIONS
    
    // PATCH /api/tasks/bulk
    async bulkUpdateTasks(req, res) {
        try {
            const { ids, updateData } = req.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Array of task IDs is required'
                });
            }
            
            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Update data is required'
                });
            }
            
            const result = await this.taskService.bulkUpdateTasks(ids, updateData);
            
            res.json({
                success: true,
                data: {
                    updated: result.updatedTasks,
                    errors: result.errors
                },
                message: `${result.updatedTasks.length} tasks updated successfully`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // DELETE /api/tasks/bulk
    async bulkDeleteTasks(req, res) {
        try {
            const { ids } = req.body;
            
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Bad Request',
                    message: 'Array of task IDs is required'
                });
            }
            
            const result = await this.taskService.bulkDeleteTasks(ids);
            
            res.json({
                success: true,
                data: {
                    deleted: result.deletedTasks,
                    errors: result.errors
                },
                message: `${result.deletedTasks.length} tasks deleted successfully`
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // ANALYTICS - GET /api/tasks/analytics
    async getTaskAnalytics(req, res) {
        try {
            const analytics = await this.taskService.getTaskAnalytics();
            
            res.json({
                success: true,
                data: analytics,
                message: 'Task analytics retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // CUSTOM ACTIONS
    
    // PATCH /api/tasks/:id/complete
    async completeTask(req, res) {
        try {
            const task = await this.taskService.patchTask(req.params.id, { status: 'completed' });
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Not Found',
                    message: `Task with ID ${req.params.id} does not exist`
                });
            }
            
            res.json({
                success: true,
                data: task,
                message: 'Task marked as completed'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
    
    // GET /api/tasks/overdue
    async getOverdueTasks(req, res) {
        try {
            const options = {
                ...req.query,
                overdue: 'true'
            };
            
            const result = await this.taskService.getAllTasks(options);
            
            res.json({
                success: true,
                data: result.tasks,
                pagination: result.pagination,
                count: result.tasks.length,
                message: 'Overdue tasks retrieved successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
                message: error.message
            });
        }
    }
}

module.exports = TaskController;
```

### CRUD Routes with Validation

```javascript
// routes/tasks.js - Task Routes with Validation
const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const TaskController = require('../controllers/TaskController');
const router = express.Router();

const taskController = new TaskController();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            error: 'Validation Error',
            message: 'Invalid input data',
            details: errors.array()
        });
    }
    next();
};

// Validation rules
const createTaskValidation = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Status must be one of: pending, in-progress, completed'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be one of: low, medium, high, urgent'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid ISO 8601 date'),
    body('assignedTo')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Assigned to must be between 1 and 50 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Each tag must be between 1 and 20 characters')
];

const updateTaskValidation = [
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    ...createTaskValidation
];

const patchTaskValidation = [
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Status must be one of: pending, in-progress, completed'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be one of: low, medium, high, urgent'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid ISO 8601 date'),
    body('assignedTo')
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Assigned to must be between 1 and 50 characters'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 20 })
        .withMessage('Each tag must be between 1 and 20 characters')
];

const queryValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'status', 'priority', 'dueDate']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
    query('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status filter'),
    query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority filter'),
    query('overdue').optional().isBoolean().withMessage('Overdue must be true or false'),
    query('dueDateFrom').optional().isISO8601().withMessage('Due date from must be a valid ISO 8601 date'),
    query('dueDateTo').optional().isISO8601().withMessage('Due date to must be a valid ISO 8601 date')
];

const bulkValidation = [
    body('ids')
        .isArray({ min: 1 })
        .withMessage('IDs array is required and must not be empty'),
    body('ids.*')
        .isInt({ min: 1 })
        .withMessage('Each ID must be a positive integer')
];

// Request logging middleware
router.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// CRUD Routes

// CREATE - POST /api/tasks
router.post('/', 
    createTaskValidation, 
    handleValidationErrors, 
    taskController.createTask.bind(taskController)
);

// READ - GET /api/tasks
router.get('/', 
    queryValidation, 
    handleValidationErrors, 
    taskController.getAllTasks.bind(taskController)
);

// READ - GET /api/tasks/analytics (before /:id to avoid conflicts)
router.get('/analytics', 
    taskController.getTaskAnalytics.bind(taskController)
);

// READ - GET /api/tasks/overdue
router.get('/overdue', 
    queryValidation, 
    handleValidationErrors, 
    taskController.getOverdueTasks.bind(taskController)
);

// READ - GET /api/tasks/:id
router.get('/:id', 
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    handleValidationErrors, 
    taskController.getTaskById.bind(taskController)
);

// UPDATE - PUT /api/tasks/:id
router.put('/:id', 
    updateTaskValidation, 
    handleValidationErrors, 
    taskController.updateTask.bind(taskController)
);

// UPDATE - PATCH /api/tasks/:id
router.patch('/:id', 
    patchTaskValidation, 
    handleValidationErrors, 
    taskController.patchTask.bind(taskController)
);

// DELETE - DELETE /api/tasks/:id
router.delete('/:id', 
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    handleValidationErrors, 
    taskController.deleteTask.bind(taskController)
);

// BULK OPERATIONS

// PATCH /api/tasks/bulk
router.patch('/bulk', 
    bulkValidation,
    body('updateData').isObject().withMessage('Update data object is required'),
    handleValidationErrors, 
    taskController.bulkUpdateTasks.bind(taskController)
);

// DELETE /api/tasks/bulk
router.delete('/bulk', 
    bulkValidation,
    handleValidationErrors, 
    taskController.bulkDeleteTasks.bind(taskController)
);

// CUSTOM ACTIONS

// PATCH /api/tasks/:id/complete
router.patch('/:id/complete', 
    param('id').isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    handleValidationErrors, 
    taskController.completeTask.bind(taskController)
);

// Error handling middleware for this router
router.use((error, req, res, next) => {
    console.error('Task router error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while processing the task request'
    });
});

module.exports = router;
```

## Real-World Use Case

### Complete Task Management API

```javascript
// app.js - Complete CRUD Application
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const app = express();

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', limiter);

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API versioning
const v1Router = express.Router();

// Import routes
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');

// Mount routes
v1Router.use('/tasks', taskRoutes);
v1Router.use('/users', userRoutes);
v1Router.use('/projects', projectRoutes);

// API info endpoint
v1Router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management API v1',
        version: '1.0.0',
        endpoints: {
            tasks: '/api/v1/tasks',
            users: '/api/v1/users',
            projects: '/api/v1/projects'
        },
        features: {
            crud: 'Full CRUD operations',
            filtering: 'Advanced filtering and search',
            pagination: 'Cursor and offset pagination',
            sorting: 'Multi-field sorting',
            bulk: 'Bulk operations support',
            analytics: 'Built-in analytics',
            validation: 'Comprehensive input validation'
        },
        documentation: '/api/v1/docs',
        timestamp: new Date().toISOString()
    });
});

// Health check with detailed status
v1Router.get('/health', async (req, res) => {
    try {
        // Check database connectivity (if using database)
        // const dbStatus = await checkDatabaseConnection();
        
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024)
            },
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            // database: dbStatus
        };
        
        res.json({
            success: true,
            data: health
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            error: 'Service Unavailable',
            message: 'Health check failed',
            details: error.message
        });
    }
});

// Mount API version
app.use('/api/v1', v1Router);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Task Management API Server',
        version: '1.0.0',
        api: {
            v1: '/api/v1',
            documentation: '/api/v1/docs',
            health: '/api/v1/health'
        },
        status: 'running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        availableEndpoints: {
            api: '/api/v1',
            tasks: '/api/v1/tasks',
            users: '/api/v1/users',
            projects: '/api/v1/projects',
            health: '/api/v1/health'
        }
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // Handle specific error types
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: 'Bad Request',
            message: 'Invalid JSON in request body'
        });
    }
    
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            error: 'Payload Too Large',
            message: 'Request body exceeds size limit'
        });
    }
    
    if (err.code === 'ENOENT') {
        return res.status(500).json({
            success: false,
            error: 'Internal Server Error',
            message: 'File system error occurred'
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        error: err.status === 500 ? 'Internal Server Error' : err.name || 'Error',
        message: process.env.NODE_ENV === 'production' 
            ? 'An error occurred while processing your request'
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Task Management API Server running on port ${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/api/v1/health`);
    console.log(`📋 Tasks API: http://localhost:${PORT}/api/v1/tasks`);
});

module.exports = app;
```

## Best Practices

### 1. Implement Proper Validation

```javascript
// Use express-validator for comprehensive validation
const { body, query, param } = require('express-validator');

// Input sanitization
body('title').trim().escape(),
body('email').normalizeEmail(),

// Custom validation
body('dueDate').custom((value) => {
    if (new Date(value) < new Date()) {
        throw new Error('Due date cannot be in the past');
    }
    return true;
})
```

### 2. Use Consistent Error Handling

```javascript
// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Centralized error handling
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}
```

### 3. Implement Pagination and Filtering

```javascript
// Cursor-based pagination for large datasets
const paginateResults = (data, cursor, limit) => {
    const startIndex = cursor ? data.findIndex(item => item.id === cursor) + 1 : 0;
    const endIndex = startIndex + limit;
    const results = data.slice(startIndex, endIndex);
    
    return {
        data: results,
        hasNext: endIndex < data.length,
        nextCursor: results.length > 0 ? results[results.length - 1].id : null
    };
};
```

### 4. Add Request/Response Logging

```javascript
// Custom logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
};
```

### 5. Implement Data Persistence

```javascript
// File-based persistence with atomic writes
const fs = require('fs').promises;
const path = require('path');

class FileStorage {
    async saveData(filename, data) {
        const tempFile = `${filename}.tmp`;
        await fs.writeFile(tempFile, JSON.stringify(data, null, 2));
        await fs.rename(tempFile, filename);
    }
    
    async loadData(filename) {
        try {
            const data = await fs.readFile(filename, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return null; // File doesn't exist
            }
            throw error;
        }
    }
}
```

## Summary

CRUD operations form the foundation of data-driven applications in Express.js:

**Core CRUD Operations**:
- **Create**: POST requests with validation and error handling
- **Read**: GET requests with filtering, sorting, and pagination
- **Update**: PUT (full) and PATCH (partial) with validation
- **Delete**: DELETE requests with proper cleanup

**Advanced Features**:
- **Bulk operations**: Handle multiple records efficiently
- **Search and filtering**: Query parameters for data retrieval
- **Analytics**: Built-in reporting and statistics
- **Validation**: Comprehensive input validation and sanitization
- **Error handling**: Consistent error responses and logging

**Best Practices**:
- Use proper HTTP methods and status codes
- Implement comprehensive validation
- Add pagination for large datasets
- Use consistent response formats
- Handle errors gracefully
- Add request/response logging
- Implement data persistence strategies

**Benefits**:
- **Scalable**: Handle growing data requirements
- **Maintainable**: Clear separation of concerns
- **Robust**: Comprehensive error handling and validation
- **Flexible**: Support for various query patterns
- **Performance**: Efficient data operations and caching

Mastering CRUD operations is essential for building robust web applications. Next, we'll explore middleware in Express.js, which provides powerful ways to process requests and responses throughout the application lifecycle.