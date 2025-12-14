const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'App name is required'],
        trim: true,
        unique: true,
        maxlength: [100, 'App name cannot exceed 100 characters']
    }
}, {
    timestamps: true
});

// Indexes
appSchema.index({ name: 1 });

module.exports = mongoose.model('App', appSchema);

