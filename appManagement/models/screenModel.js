const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
    applicationId: {
        type: String,
        required: [true, 'Application ID is required'],
        index: true
    },
    data: {
        label: {
            type: String,
            default: 'Screen-1'
        },
        type: {
            type: String,
            default: 'screen'
        }
    },
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
    hidden: {
        type: Boolean,
        default: false
    },
    components: {
        type: mongoose.Schema.Types.Mixed,
        default: []
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
screenSchema.index({ applicationId: 1 });
screenSchema.index({ status: 1 });

module.exports = mongoose.model('Screen', screenSchema);

