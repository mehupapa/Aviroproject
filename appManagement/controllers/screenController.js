const Screen = require('../models/screenModel');
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

// @desc    Create a new screen for an app
// @route   POST /api/screens
// @access  Public
const createScreen = async (req, res) => {
    try {
        const {
            applicationId,
            data,
            position,
            hidden,
            components
        } = req.body;

        if (!applicationId) {
            return sendValidationError(res, 'Application ID is required');
        }

        // Verify app exists
        const app = await App.findById(applicationId);
        if (!app) {
            return sendNotFound(res, 'App not found');
        }

        const screen = await Screen.create({
            applicationId,
            data: data || { label: 'Screen-1' },
            position: position || { x: 0, y: 0 },
            hidden: hidden !== undefined ? hidden : false,
            components: components || [],
            status: 'draft'
        });

        return sendCreated(res, screen, 'Screen created successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to create screen');
    }
};

// @desc    Get all screens for an app
// @route   GET /api/screens?appId=xxx
// @access  Public
const getAllScreens = async (req, res) => {
    try {
        const { applicationId, status } = req.query;

        const query = {};
        if (applicationId) {
            query.applicationId = applicationId;
        }
        if (status) {
            query.status = status;
        }

        const screens = await Screen.find(query)
            .sort({ createdAt: -1 })
            .select('-__v');

        // Format response for React Flow
        const formattedScreens = screens.map(screen => ({
            id: screen._id.toString(),
            applicationId: screen.applicationId,
            data: screen.data || { label: 'Screen-1' },
            position: screen.position || { x: 0, y: 0 },
            hidden: screen.hidden || false,
            components: screen.components,
            status: screen.status,
            createdAt: screen.createdAt,
            updatedAt: screen.updatedAt
        }));

        return sendSuccess(res, formattedScreens);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch screens');
    }
};

// @desc    Get single screen by ID
// @route   GET /api/screens/:id
// @access  Public
const getScreenById = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id)
            .select('-__v');

        if (!screen) {
            return sendNotFound(res, 'Screen not found');
        }

        // Format response for React Flow
        const formattedScreen = {
            id: screen._id.toString(),
            applicationId: screen.applicationId,
            data: screen.data || { label: 'Screen-1' },
            position: screen.position || { x: 0, y: 0 },
            hidden: screen.hidden || false,
            components: screen.components,
            status: screen.status,
            createdAt: screen.createdAt,
            updatedAt: screen.updatedAt
        };

        return sendSuccess(res, formattedScreen);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch screen');
    }
};

// @desc    Update screen
// @route   PUT /api/screens/:id
// @access  Public
const updateScreen = async (req, res) => {
    try {
        const {
            data,
            position,
            hidden,
            components,
            status,
            applicationId
        } = req.body;

        const screen = await Screen.findById(req.params.id);

        if (!screen) {
            return sendNotFound(res, 'Screen not found');
        }

        // Update fields
        if (data) {
            // Merge data object to preserve existing fields like 'type'
            screen.data = {
                ...screen.data,
                ...data
            };
        }
        if (position) {
            // Merge position object to preserve existing coordinates
            screen.position = {
                ...screen.position,
                ...position
            };
        }
        if (hidden !== undefined) screen.hidden = hidden;
        if (components !== undefined) screen.components = components;
        if (status) screen.status = status;
        if (applicationId) screen.applicationId = applicationId;

        await screen.save();

        // Format response for React Flow
        const formattedScreen = {
            id: screen._id.toString(),
            applicationId: screen.applicationId,
            data: screen.data || { label: 'Screen-1' },
            position: screen.position || { x: 0, y: 0 },
            hidden: screen.hidden || false,
            components: screen.components,
            status: screen.status,
            createdAt: screen.createdAt,
            updatedAt: screen.updatedAt
        };

        return sendUpdated(res, formattedScreen, 'Screen updated successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to update screen');
    }
};

// @desc    Delete screen
// @route   DELETE /api/screens/:id
// @access  Public
const deleteScreen = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id);

        if (!screen) {
            return sendNotFound(res, 'Screen not found');
        }

        await Screen.findByIdAndDelete(req.params.id);

        return sendDeleted(res, 'Screen deleted successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to delete screen');
    }
};

// @desc    Update screen position (for drag operations)
// @route   PATCH /api/screens/:id/position
// @access  Public
const updateScreenPosition = async (req, res) => {
    try {
        const { position, applicationId } = req.body;

        if (!position || typeof position.x === 'undefined' || typeof position.y === 'undefined') {
            return sendValidationError(res, 'Position with x and y coordinates is required');
        }

        const screen = await Screen.findById(req.params.id);

        if (!screen) {
            return sendNotFound(res, 'Screen not found');
        }

        // Update position
        screen.position = position;
        if (applicationId) screen.applicationId = applicationId;

        await screen.save();

        // Format response for React Flow
        const formattedScreen = {
            id: screen._id.toString(),
            applicationId: screen.applicationId,
            data: screen.data || { label: 'Screen-1' },
            position: screen.position,
            hidden: screen.hidden || false
        };

        return sendUpdated(res, formattedScreen, 'Screen position updated successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to update screen position');
    }
};

module.exports = {
    createScreen,
    getAllScreens,
    getScreenById,
    updateScreen,
    updateScreenPosition,
    deleteScreen
};

