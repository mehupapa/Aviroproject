const App = require('../models/appModel');

// @desc    Create a new app
// @route   POST /api/apps
// @access  Public
const createApp = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'App name is required'
            });
        }

        // Check if app name already exists
        const existingApp = await App.findOne({ name: name.trim() });
        if (existingApp) {
            return res.status(400).json({
                status: 'error',
                message: 'App name already exists'
            });
        }

        const app = await App.create({
            name: name.trim()
        });

        res.status(201).json({
            status: 'success',
            message: 'App created successfully',
            data: app
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create app'
        });
    }
};

// @desc    Get all apps
// @route   GET /api/apps
// @access  Public
const getAllApps = async (req, res) => {
    try {
        const { search } = req.query;

        const query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const apps = await App.find(query)
            .sort({ createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            status: 'success',
            count: apps.length,
            data: apps
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch apps'
        });
    }
};

// @desc    Get single app by ID
// @route   GET /api/apps/:id
// @access  Public
const getAppById = async (req, res) => {
    try {
        const app = await App.findById(req.params.id).select('-__v');

        if (!app) {
            return res.status(404).json({
                status: 'error',
                message: 'App not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: app
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid app ID'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch app'
        });
    }
};

// @desc    Update app
// @route   PUT /api/apps/:id
// @access  Public
const updateApp = async (req, res) => {
    try {
        const { name } = req.body;

        const app = await App.findById(req.params.id);

        if (!app) {
            return res.status(404).json({
                status: 'error',
                message: 'App not found'
            });
        }

        // Check if new name already exists (if name is being changed)
        if (name && name.trim() !== app.name) {
            const existingApp = await App.findOne({ name: name.trim() });
            if (existingApp) {
                return res.status(400).json({
                    status: 'error',
                    message: 'App name already exists'
                });
            }
        }

        // Update fields
        if (name) app.name = name.trim();

        await app.save();

        res.status(200).json({
            status: 'success',
            message: 'App updated successfully',
            data: app
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid app ID'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update app'
        });
    }
};

// @desc    Delete app
// @route   DELETE /api/apps/:id
// @access  Public
const deleteApp = async (req, res) => {
    try {
        const app = await App.findById(req.params.id);

        if (!app) {
            return res.status(404).json({
                status: 'error',
                message: 'App not found'
            });
        }

        await App.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status: 'success',
            message: 'App deleted successfully'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid app ID'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to delete app'
        });
    }
};

module.exports = {
    createApp,
    getAllApps,
    getAppById,
    updateApp,
    deleteApp
};

