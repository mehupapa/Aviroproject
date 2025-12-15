const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Image name is required'],
        trim: true
    },
    originalName: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    path: {
        type: String,
        default: null
    },
    url: {
        type: String,
        required: true
    },
    cloudinaryPublicId: {
        type: String,
        required: true,
        unique: true
    },
    cloudinarySecureUrl: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    width: {
        type: Number,
        default: null
    },
    height: {
        type: Number,
        default: null
    },
    category: {
        type: String,
        enum: ['icon', 'image', 'logo', 'background', 'avatar', 'banner', 'thumbnail', 'other'],
        default: 'image'
    },
    tags: [{
        type: String,
        trim: true
    }],
    description: {
        type: String,
        trim: true
    },
    alt: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes
imageSchema.index({ name: 1 });
imageSchema.index({ category: 1 });
imageSchema.index({ status: 1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Image', imageSchema);

