const Component = require('../models/componentModel');
const ComponentType = require('../models/componentTypeModel');
const Screen = require('../../appManagement/models/screenModel');
const {
    sendCreated,
    sendSuccess,
    sendNotFound,
    sendUpdated,
    sendDeleted,
    sendValidationError,
    handleError
} = require('../../utils/responseHelper');

// @desc    Create a new component
// @route   POST /api/components
// @access  Public
const createComponent = async (req, res) => {
    try {
        const {
            screenId,
            applicationId,
            type,
            data,
            position,
            styles,
            properties,
            parentId,
            order,
            hidden
        } = req.body;

        if (!screenId) {
            return sendValidationError(res, 'Screen ID is required');
        }

        if (!applicationId) {
            return sendValidationError(res, 'Application ID is required');
        }

        if (!type) {
            return sendValidationError(res, 'Component type is required');
        }

        // Verify screen exists
        const screen = await Screen.findById(screenId);
        if (!screen) {
            return sendNotFound(res, 'Screen not found');
        }

        // Verify parent component exists if parentId is provided
        if (parentId) {
            const parent = await Component.findById(parentId);
            if (!parent) {
                return sendNotFound(res, 'Parent component not found');
            }
        }

        // Get default styles and properties from component type
        const componentType = await ComponentType.findOne({ type });
        const defaultStyles = componentType?.defaultStyles || {};
        const defaultProperties = componentType?.defaultProperties || {};
        const defaultData = componentType?.defaultData || {};

        // Merge provided styles/properties with defaults
        const mergedStyles = { ...defaultStyles, ...(styles || {}) };
        const mergedProperties = { ...defaultProperties, ...(properties || {}) };
        const mergedData = { ...defaultData, ...(data || {}) };

        const component = await Component.create({
            screenId,
            applicationId,
            type,
            data: mergedData,
            position: position || { x: 0, y: 0 },
            styles: mergedStyles,
            properties: mergedProperties,
            parentId: parentId || null,
            order: order || 0,
            hidden: hidden !== undefined ? hidden : true, // Hidden by default
            status: 'draft'
        });

        // Format response
        const formattedComponent = formatComponentResponse(component);

        return sendCreated(res, formattedComponent, 'Component created successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to create component');
    }
};

// @desc    Get all components
// @route   GET /api/components
// @access  Public
const getAllComponents = async (req, res) => {
    try {
        const { screenId, applicationId, type, parentId, status } = req.query;

        const query = {};
        if (screenId) query.screenId = screenId;
        if (applicationId) query.applicationId = applicationId;
        if (type) query.type = type;
        if (parentId) query.parentId = parentId;
        if (status) query.status = status;

        const components = await Component.find(query)
            .populate('parentId', 'type data')
            .populate('children', 'type data')
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        const formattedComponents = components.map(comp => formatComponentResponse(comp));

        return sendSuccess(res, formattedComponents);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch components');
    }
};

// @desc    Get components by screen ID
// @route   GET /api/components/screen/:screenId
// @access  Public
const getComponentsByScreen = async (req, res) => {
    try {
        const { screenId } = req.params;

        const components = await Component.find({ screenId })
            .populate('parentId', 'type data')
            .populate('children', 'type data')
            .sort({ order: 1, createdAt: -1 })
            .select('-__v');

        const formattedComponents = components.map(comp => formatComponentResponse(comp));

        return sendSuccess(res, formattedComponents);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch components');
    }
};

// @desc    Get single component by ID
// @route   GET /api/components/:id
// @access  Public
const getComponentById = async (req, res) => {
    try {
        const component = await Component.findById(req.params.id)
            .populate('parentId', 'type data styles')
            .populate('children', 'type data styles')
            .select('-__v');

        if (!component) {
            return sendNotFound(res, 'Component not found');
        }

        const formattedComponent = formatComponentResponse(component);

        return sendSuccess(res, formattedComponent);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch component');
    }
};

// @desc    Update component
// @route   PUT /api/components/:id
// @access  Public
const updateComponent = async (req, res) => {
    try {
        const {
            type,
            data,
            position,
            styles,
            properties,
            parentId,
            order,
            hidden,
            status,
            applicationId
        } = req.body;

        const component = await Component.findById(req.params.id);

        if (!component) {
            return sendNotFound(res, 'Component not found');
        }

        // Verify parent component exists if parentId is being changed
        if (parentId && parentId !== component.parentId?.toString()) {
            const parent = await Component.findById(parentId);
            if (!parent) {
                return sendNotFound(res, 'Parent component not found');
            }
        }

        // Update fields
        if (type) component.type = type;
        if (data !== undefined) component.data = data;
        if (position) component.position = position;
        if (styles !== undefined) {
            // Merge styles object
            component.styles = { ...component.styles, ...styles };
        }
        if (properties !== undefined) component.properties = properties;
        if (parentId !== undefined) component.parentId = parentId;
        if (order !== undefined) component.order = order;
        if (hidden !== undefined) component.hidden = hidden;
        if (status) component.status = status;
        if (applicationId) component.applicationId = applicationId;

        await component.save();

        const formattedComponent = formatComponentResponse(component);

        return sendUpdated(res, formattedComponent, 'Component updated successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to update component');
    }
};

// @desc    Update component styles only
// @route   PATCH /api/components/:id/styles
// @access  Public
const updateComponentStyles = async (req, res) => {
    try {
        const { styles } = req.body;

        if (!styles || typeof styles !== 'object') {
            return sendValidationError(res, 'Styles object is required');
        }

        const component = await Component.findById(req.params.id);

        if (!component) {
            return sendNotFound(res, 'Component not found');
        }

        // Merge styles
        component.styles = { ...component.styles, ...styles };

        await component.save();

        const formattedComponent = formatComponentResponse(component);

        return sendUpdated(res, formattedComponent, 'Component styles updated successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to update component styles');
    }
};

// @desc    Update component position
// @route   PATCH /api/components/:id/position
// @access  Public
const updateComponentPosition = async (req, res) => {
    try {
        const { position } = req.body;

        if (!position || typeof position.x === 'undefined' || typeof position.y === 'undefined') {
            return sendValidationError(res, 'Position with x and y coordinates is required');
        }

        const component = await Component.findById(req.params.id);

        if (!component) {
            return sendNotFound(res, 'Component not found');
        }

        component.position = position;

        await component.save();

        const formattedComponent = formatComponentResponse(component);

        return sendUpdated(res, formattedComponent, 'Component position updated successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to update component position');
    }
};

// @desc    Delete component
// @route   DELETE /api/components/:id
// @access  Public
const deleteComponent = async (req, res) => {
    try {
        const component = await Component.findById(req.params.id);

        if (!component) {
            return sendNotFound(res, 'Component not found');
        }

        // Delete all children components first
        await Component.deleteMany({ parentId: component._id });

        await Component.findByIdAndDelete(req.params.id);

        return sendDeleted(res, 'Component deleted successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to delete component');
    }
};

// Helper function to format component response
const formatComponentResponse = (component) => {
    return {
        id: component._id.toString(),
        screenId: component.screenId.toString(),
        applicationId: component.applicationId,
        type: component.type,
        data: component.data || {},
        position: component.position || { x: 0, y: 0 },
        styles: component.styles || {},
        properties: component.properties || {},
        parentId: component.parentId ? component.parentId.toString() : null,
        children: component.children ? component.children.map(child => child.toString()) : [],
        order: component.order || 0,
        hidden: component.hidden || false,
        status: component.status,
        createdAt: component.createdAt,
        updatedAt: component.updatedAt
    };
};

module.exports = {
    createComponent,
    getAllComponents,
    getComponentsByScreen,
    getComponentById,
    updateComponent,
    updateComponentStyles,
    updateComponentPosition,
    deleteComponent
};

