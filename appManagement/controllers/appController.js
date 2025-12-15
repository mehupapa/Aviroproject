const App = require('../models/appModel');
const {
    sendCreated,
    sendSuccess,
    sendNotFound,
    sendUpdated,
    sendDeleted,
    sendValidationError,
    handleError
} = require('../../utils/responseHelper');

// @desc    Create a new app
// @route   POST /api/apps
// @access  Public
const createApp = async (req, res) => {
    try {
        const { name, theme } = req.body;

        if (!name) {
            return sendValidationError(res, 'App name is required');
        }

        // Check if app name already exists
        const existingApp = await App.findOne({ name: name.trim() });
        if (existingApp) {
            return sendValidationError(res, 'App name already exists');
        }

        // Default theme object
        const defaultTheme = {
            colors: {
                primary: '#0766ff',
                primaryContent: '#ffffff',
                primaryDark: '#0051d3',
                primaryLight: '#3a85ff',
                secondary: '#ff073d',
                secondaryContent: '#ffffff',
                secondaryDark: '#d3002e',
                secondaryLight: '#ff3a65',
                background: '#eeeff2',
                foreground: '#fbfbfc',
                border: '#dbdee3',
                copy: '#21252b',
                copyLight: '#596373',
                copyLighter: '#7e899b',
                success: '#07ff07',
                warning: '#ffff07',
                error: '#ff0707',
                successContent: '#000700',
                warningContent: '#070700',
                errorContent: '#ffffff'
            },
            radius: {
                button: '8',
                input: '8',
                card: '12',
                general: '10'
            },
            version: '1.0'
        };

        const appData = {
            name: name.trim(),
            theme: theme || defaultTheme // Always set theme - use provided or default
        };

        const app = await App.create(appData);

        return sendCreated(res, app, 'App created successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to create app');
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

        return sendSuccess(res, apps);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch apps');
    }
};

// @desc    Get single app by ID
// @route   GET /api/apps/:id
// @access  Public
const getAppById = async (req, res) => {
    try {
        const app = await App.findById(req.params.id).select('-__v');

        if (!app) {
            return sendNotFound(res, 'App not found');
        }

        return sendSuccess(res, app);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch app');
    }
};

// @desc    Update app
// @route   PUT /api/apps/:id
// @access  Public
const updateApp = async (req, res) => {
    try {
        const { name, theme } = req.body;

        const app = await App.findById(req.params.id);

        if (!app) {
            return sendNotFound(res, 'App not found');
        }

        // Check if new name already exists (if name is being changed)
        if (name && name.trim() !== app.name) {
            const existingApp = await App.findOne({ name: name.trim() });
            if (existingApp) {
                return sendValidationError(res, 'App name already exists');
            }
        }

        // Update fields
        if (name) app.name = name.trim();
        if (theme) app.theme = theme; // Update full theme object

        await app.save();

        return sendUpdated(res, app, 'App updated successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to update app');
    }
};

// @desc    Delete app
// @route   DELETE /api/apps/:id
// @access  Public
const deleteApp = async (req, res) => {
    try {
        const app = await App.findById(req.params.id);

        if (!app) {
            return sendNotFound(res, 'App not found');
        }

        await App.findByIdAndDelete(req.params.id);

        return sendDeleted(res, 'App deleted successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to delete app');
    }
};

module.exports = {
    createApp,
    getAllApps,
    getAppById,
    updateApp,
    deleteApp
};

