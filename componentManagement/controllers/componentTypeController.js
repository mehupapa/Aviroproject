const ComponentType = require('../models/componentTypeModel');
const {
    sendSuccess,
    sendCreated,
    sendNotFound,
    sendUpdated,
    sendDeleted,
    sendValidationError,
    handleError
} = require('../../utils/responseHelper');

// @desc    Get all component types (for sidebar)
// @route   GET /api/component-types
// @access  Public
const getAllComponentTypes = async (req, res) => {
    try {
        const { category, visible } = req.query;

        const query = {};
        if (category) {
            query.category = category;
        }
        if (visible !== undefined) {
            query.visible = visible === 'true';
        }

        const componentTypes = await ComponentType.find(query)
            .sort({ order: 1, name: 1 })
            .select('-__v');

        return sendSuccess(res, componentTypes);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch component types');
    }
};

// @desc    Get single component type by type
// @route   GET /api/component-types/:type
// @access  Public
const getComponentTypeByType = async (req, res) => {
    try {
        const componentType = await ComponentType.findOne({ type: req.params.type })
            .select('-__v');

        if (!componentType) {
            return sendNotFound(res, 'Component type not found');
        }

        return sendSuccess(res, componentType);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch component type');
    }
};

// @desc    Create component type
// @route   POST /api/component-types
// @access  Public
const createComponentType = async (req, res) => {
    try {
        const {
            type,
            name,
            description,
            icon,
            category,
            defaultStyles,
            defaultProperties,
            defaultData,
            visible,
            order
        } = req.body;

        if (!type) {
            return sendValidationError(res, 'Component type is required');
        }

        if (!name) {
            return sendValidationError(res, 'Component name is required');
        }

        // Check if type already exists
        const existingType = await ComponentType.findOne({ type });
        if (existingType) {
            return sendValidationError(res, 'Component type already exists');
        }

        const componentType = await ComponentType.create({
            type,
            name,
            description: description || '',
            icon: icon || '',
            category: category || 'basic',
            defaultStyles: defaultStyles || {},
            defaultProperties: defaultProperties || {},
            defaultData: defaultData || {},
            visible: visible !== undefined ? visible : true,
            order: order || 0
        });

        return sendCreated(res, componentType, 'Component type created successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to create component type');
    }
};

// @desc    Update component type
// @route   PUT /api/component-types/:id
// @access  Public
const updateComponentType = async (req, res) => {
    try {
        const {
            name,
            description,
            icon,
            category,
            defaultStyles,
            defaultProperties,
            defaultData,
            visible,
            order
        } = req.body;

        const componentType = await ComponentType.findById(req.params.id);

        if (!componentType) {
            return sendNotFound(res, 'Component type not found');
        }

        // Update fields
        if (name) componentType.name = name;
        if (description !== undefined) componentType.description = description;
        if (icon !== undefined) componentType.icon = icon;
        if (category) componentType.category = category;
        if (defaultStyles !== undefined) componentType.defaultStyles = defaultStyles;
        if (defaultProperties !== undefined) componentType.defaultProperties = defaultProperties;
        if (defaultData !== undefined) componentType.defaultData = defaultData;
        if (visible !== undefined) componentType.visible = visible;
        if (order !== undefined) componentType.order = order;

        await componentType.save();

        return sendUpdated(res, componentType, 'Component type updated successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to update component type');
    }
};

// @desc    Delete component type
// @route   DELETE /api/component-types/:id
// @access  Public
const deleteComponentType = async (req, res) => {
    try {
        const componentType = await ComponentType.findById(req.params.id);

        if (!componentType) {
            return sendNotFound(res, 'Component type not found');
        }

        await ComponentType.findByIdAndDelete(req.params.id);

        return sendDeleted(res, 'Component type deleted successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to delete component type');
    }
};

// @desc    Initialize default component types
// @route   POST /api/component-types/initialize
// @access  Public
const initializeDefaultComponentTypes = async (req, res) => {
    try {
        const defaultTypes = [
            { type: 'button', name: 'Button', category: 'basic', icon: '🔘', order: 1 },
            { type: 'input', name: 'Input', category: 'form', icon: '📝', order: 2 },
            { type: 'textarea', name: 'Textarea', category: 'form', icon: '📄', order: 3 },
            { type: 'text', name: 'Text', category: 'basic', icon: '📝', order: 4 },
            { type: 'image', name: 'Image', category: 'media', icon: '🖼️', order: 5 },
            { type: 'container', name: 'Container', category: 'layout', icon: '📦', order: 6 },
            { type: 'div', name: 'Div', category: 'layout', icon: '⬜', order: 7 },
            { type: 'form', name: 'Form', category: 'form', icon: '📋', order: 8 },
            { type: 'label', name: 'Label', category: 'form', icon: '🏷️', order: 9 },
            { type: 'select', name: 'Select', category: 'form', icon: '📑', order: 10 },
            { type: 'checkbox', name: 'Checkbox', category: 'form', icon: '☑️', order: 11 },
            { type: 'radio', name: 'Radio', category: 'form', icon: '🔘', order: 12 },
            { type: 'link', name: 'Link', category: 'basic', icon: '🔗', order: 13 },
            { type: 'icon', name: 'Icon', category: 'basic', icon: '⭐', order: 14 },
            { type: 'card', name: 'Card', category: 'layout', icon: '🃏', order: 15 },
            { type: 'header', name: 'Header', category: 'navigation', icon: '📊', order: 16 },
            { type: 'footer', name: 'Footer', category: 'navigation', icon: '📊', order: 17 },
            { type: 'navbar', name: 'Navbar', category: 'navigation', icon: '🧭', order: 18 },
            { type: 'sidebar', name: 'Sidebar', category: 'navigation', icon: '📑', order: 19 },
            { type: 'modal', name: 'Modal', category: 'layout', icon: '🪟', order: 20 },
            { type: 'dropdown', name: 'Dropdown', category: 'form', icon: '📋', order: 21 },
            { type: 'table', name: 'Table', category: 'data', icon: '📊', order: 22 },
            { type: 'list', name: 'List', category: 'data', icon: '📋', order: 23 },
            { type: 'video', name: 'Video', category: 'media', icon: '🎥', order: 24 },
            { type: 'audio', name: 'Audio', category: 'media', icon: '🔊', order: 25 },
            { type: 'map', name: 'Map', category: 'media', icon: '🗺️', order: 26 },
            { type: 'chart', name: 'Chart', category: 'data', icon: '📈', order: 27 },
            { type: 'custom', name: 'Custom', category: 'custom', icon: '⚙️', order: 28 }
        ];

        const createdTypes = [];
        const existingTypes = [];

        for (const typeData of defaultTypes) {
            const existing = await ComponentType.findOne({ type: typeData.type });
            if (!existing) {
                const componentType = await ComponentType.create({
                    ...typeData,
                    visible: true,
                    defaultStyles: {},
                    defaultProperties: {},
                    defaultData: {}
                });
                createdTypes.push(componentType);
            } else {
                existingTypes.push(existing);
            }
        }

        return sendSuccess(res, {
            created: createdTypes.length,
            existing: existingTypes.length,
            message: `Initialized ${createdTypes.length} new component types. ${existingTypes.length} already existed.`
        });
    } catch (error) {
        return handleError(res, error, 'Failed to initialize component types');
    }
};

module.exports = {
    getAllComponentTypes,
    getComponentTypeByType,
    createComponentType,
    updateComponentType,
    deleteComponentType,
    initializeDefaultComponentTypes
};

