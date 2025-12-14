const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
    colors: {
        primary: { type: String, default: '#0766ff' },
        primaryContent: { type: String, default: '#ffffff' },
        primaryDark: { type: String, default: '#0051d3' },
        primaryLight: { type: String, default: '#3a85ff' },
        secondary: { type: String, default: '#ff073d' },
        secondaryContent: { type: String, default: '#ffffff' },
        secondaryDark: { type: String, default: '#d3002e' },
        secondaryLight: { type: String, default: '#ff3a65' },
        background: { type: String, default: '#eeeff2' },
        foreground: { type: String, default: '#fbfbfc' },
        border: { type: String, default: '#dbdee3' },
        copy: { type: String, default: '#21252b' },
        copyLight: { type: String, default: '#596373' },
        copyLighter: { type: String, default: '#7e899b' },
        success: { type: String, default: '#07ff07' },
        warning: { type: String, default: '#ffff07' },
        error: { type: String, default: '#ff0707' },
        successContent: { type: String, default: '#000700' },
        warningContent: { type: String, default: '#070700' },
        errorContent: { type: String, default: '#ffffff' }
    },
    radius: {
        button: { type: String, default: '8' },
        input: { type: String, default: '8' },
        card: { type: String, default: '12' },
        general: { type: String, default: '10' }
    },
    version: { type: String, default: '1.0' }
}, { _id: false });

const screenSchema = new mongoose.Schema({
    appId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'App',
        required: [true, 'App ID is required'],
        index: true
    },
    name: {
        type: String,
        required: [true, 'Screen name is required'],
        trim: true,
        maxlength: [100, 'Screen name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    theme: {
        type: themeSchema,
        default: () => ({
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
        })
    },
    components: {
        type: mongoose.Schema.Types.Mixed,
        default: []
    },
    order: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true
});

// Indexes
screenSchema.index({ appId: 1, name: 1 });
screenSchema.index({ appId: 1, order: 1 });
screenSchema.index({ status: 1 });

module.exports = mongoose.model('Screen', screenSchema);

