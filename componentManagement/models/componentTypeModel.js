const mongoose = require('mongoose');

const componentTypeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Component type is required'],
        unique: true,
        enum: [
            'button',
            'input',
            'textarea',
            'text',
            'image',
            'container',
            'div',
            'form',
            'label',
            'select',
            'checkbox',
            'radio',
            'link',
            'icon',
            'card',
            'header',
            'footer',
            'navbar',
            'sidebar',
            'modal',
            'dropdown',
            'table',
            'list',
            'video',
            'audio',
            'map',
            'chart',
            'custom'
        ]
    },
    name: {
        type: String,
        required: [true, 'Component name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['basic', 'form', 'layout', 'media', 'navigation', 'data', 'custom'],
        default: 'basic'
    },
    // Default styles for this component type
    defaultStyles: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Default properties for this component type
    defaultProperties: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Default data for this component type
    defaultData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Whether this component type is visible in sidebar
    visible: {
        type: Boolean,
        default: true
    },
    // Order in sidebar
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes
componentTypeSchema.index({ type: 1 });
componentTypeSchema.index({ category: 1 });
componentTypeSchema.index({ visible: 1, order: 1 });

module.exports = mongoose.model('ComponentType', componentTypeSchema);

