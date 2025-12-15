const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
    screenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen',
        required: [true, 'Screen ID is required'],
        index: true
    },
    applicationId: {
        type: String,
        required: [true, 'Application ID is required'],
        index: true
    },
    type: {
        type: String,
        required: [true, 'Component type is required'],
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
        ],
        default: 'button'
    },
    // Component data/properties
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Position on screen (for React Flow)
    position: {
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        }
    },
    // Dynamic CSS properties
    styles: {
        // Layout
        margin: { type: String, default: '0' },
        marginTop: { type: String, default: '0' },
        marginRight: { type: String, default: '0' },
        marginBottom: { type: String, default: '0' },
        marginLeft: { type: String, default: '0' },
        padding: { type: String, default: '0' },
        paddingTop: { type: String, default: '0' },
        paddingRight: { type: String, default: '0' },
        paddingBottom: { type: String, default: '0' },
        paddingLeft: { type: String, default: '0' },

        // Size
        width: { type: String, default: 'auto' },
        height: { type: String, default: 'auto' },
        minWidth: { type: String, default: 'auto' },
        minHeight: { type: String, default: 'auto' },
        maxWidth: { type: String, default: 'none' },
        maxHeight: { type: String, default: 'none' },

        // Display
        display: { type: String, default: 'block' },
        flexDirection: { type: String, default: 'row' },
        justifyContent: { type: String, default: 'flex-start' },
        alignItems: { type: String, default: 'stretch' },
        flexWrap: { type: String, default: 'nowrap' },
        gap: { type: String, default: '0' },

        // Colors
        color: { type: String, default: '#000000' },
        backgroundColor: { type: String, default: 'transparent' },
        borderColor: { type: String, default: '#000000' },

        // Border
        border: { type: String, default: 'none' },
        borderWidth: { type: String, default: '0' },
        borderStyle: { type: String, default: 'solid' },
        borderRadius: { type: String, default: '0' },
        borderTopLeftRadius: { type: String, default: '0' },
        borderTopRightRadius: { type: String, default: '0' },
        borderBottomLeftRadius: { type: String, default: '0' },
        borderBottomRightRadius: { type: String, default: '0' },

        // Typography
        fontSize: { type: String, default: '16px' },
        fontWeight: { type: String, default: 'normal' },
        fontFamily: { type: String, default: 'inherit' },
        lineHeight: { type: String, default: 'normal' },
        textAlign: { type: String, default: 'left' },
        textDecoration: { type: String, default: 'none' },
        textTransform: { type: String, default: 'none' },
        letterSpacing: { type: String, default: 'normal' },

        // Effects
        opacity: { type: String, default: '1' },
        boxShadow: { type: String, default: 'none' },
        transform: { type: String, default: 'none' },
        transition: { type: String, default: 'none' },

        // Position
        position: { type: String, default: 'static' },
        top: { type: String, default: 'auto' },
        right: { type: String, default: 'auto' },
        bottom: { type: String, default: 'auto' },
        left: { type: String, default: 'auto' },
        zIndex: { type: String, default: 'auto' },

        // Overflow
        overflow: { type: String, default: 'visible' },
        overflowX: { type: String, default: 'visible' },
        overflowY: { type: String, default: 'visible' },

        // Custom CSS (for any additional properties)
        custom: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    // Component-specific properties (e.g., button text, input placeholder)
    properties: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Children components (for nested components)
    children: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Component'
    }],
    // Parent component reference
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Component',
        default: null
    },
    // Order/Index in parent
    order: {
        type: Number,
        default: 0
    },
    // Visibility
    hidden: {
        type: Boolean,
        default: false
    },
    // Status
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true
});

// Indexes
componentSchema.index({ screenId: 1 });
componentSchema.index({ applicationId: 1 });
componentSchema.index({ screenId: 1, order: 1 });
componentSchema.index({ parentId: 1 });
componentSchema.index({ type: 1 });

module.exports = mongoose.model('Component', componentSchema);

