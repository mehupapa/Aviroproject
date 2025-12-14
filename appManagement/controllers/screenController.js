const Screen = require('../models/screenModel');
const App = require('../models/appModel');

// @desc    Create a new screen for an app
// @route   POST /api/screens
// @access  Public
const createScreen = async (req, res) => {
    try {
        const { appId, name, description, theme, components, order } = req.body;

        if (!appId) {
            return res.status(400).json({
                status: 'error',
                message: 'App ID is required'
            });
        }

        if (!name) {
            return res.status(400).json({
                status: 'error',
                message: 'Screen name is required'
            });
        }

        // Verify app exists
        const app = await App.findById(appId);
        if (!app) {
            return res.status(404).json({
                status: 'error',
                message: 'App not found'
            });
        }

        // Check if screen name already exists for this app
        const existingScreen = await Screen.findOne({
            appId,
            name: name.trim()
        });
        if (existingScreen) {
            return res.status(400).json({
                status: 'error',
                message: 'Screen name already exists for this app'
            });
        }

        const screen = await Screen.create({
            appId,
            name: name.trim(),
            description: description?.trim() || '',
            theme: theme || undefined, // Will use default if not provided
            components: components || [],
            order: order || 0,
            status: 'draft'
        });

        res.status(201).json({
            status: 'success',
            message: 'Screen created successfully',
            data: screen
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to create screen'
        });
    }
};

// @desc    Get all screens for an app
// @route   GET /api/screens?appId=xxx
// @access  Public
const getAllScreens = async (req, res) => {
    try {
        const { appId, status, search } = req.query;

        const query = {};
        if (appId) {
            query.appId = appId;
        }
        if (status) {
            query.status = status;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const screens = await Screen.find(query)
            .populate('appId', 'name platform')
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        res.status(200).json({
            status: 'success',
            count: screens.length,
            data: screens
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch screens'
        });
    }
};

// @desc    Get single screen by ID
// @route   GET /api/screens/:id
// @access  Public
const getScreenById = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id)
            .populate('appId', 'name platform')
            .select('-__v');

        if (!screen) {
            return res.status(404).json({
                status: 'error',
                message: 'Screen not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: screen
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid screen ID'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to fetch screen'
        });
    }
};

// @desc    Update screen
// @route   PUT /api/screens/:id
// @access  Public
const updateScreen = async (req, res) => {
    try {
        const { name, description, theme, components, order, status } = req.body;

        const screen = await Screen.findById(req.params.id);

        if (!screen) {
            return res.status(404).json({
                status: 'error',
                message: 'Screen not found'
            });
        }

        // Check if new name already exists for this app (if name is being changed)
        if (name && name.trim() !== screen.name) {
            const existingScreen = await Screen.findOne({
                appId: screen.appId,
                name: name.trim()
            });
            if (existingScreen) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Screen name already exists for this app'
                });
            }
        }

        // Update fields
        if (name) screen.name = name.trim();
        if (description !== undefined) screen.description = description?.trim() || '';
        if (theme) screen.theme = theme;
        if (components !== undefined) screen.components = components;
        if (order !== undefined) screen.order = order;
        if (status) screen.status = status;

        await screen.save();

        res.status(200).json({
            status: 'success',
            message: 'Screen updated successfully',
            data: screen
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid screen ID'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to update screen'
        });
    }
};

// @desc    Delete screen
// @route   DELETE /api/screens/:id
// @access  Public
const deleteScreen = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id);

        if (!screen) {
            return res.status(404).json({
                status: 'error',
                message: 'Screen not found'
            });
        }

        await Screen.findByIdAndDelete(req.params.id);

        res.status(200).json({
            status: 'success',
            message: 'Screen deleted successfully'
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid screen ID'
            });
        }
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to delete screen'
        });
    }
};

module.exports = {
    createScreen,
    getAllScreens,
    getScreenById,
    updateScreen,
    deleteScreen
};

