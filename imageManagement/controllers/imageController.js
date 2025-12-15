const Image = require('../models/imageModel');
const cloudinary = require('../../config/cloudinary');
const { Readable } = require('stream');
const {
    sendCreated,
    sendSuccess,
    sendNotFound,
    sendUpdated,
    sendDeleted,
    sendValidationError,
    handleError
} = require('../../utils/responseHelper');

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'zero-code-platform') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto',
                allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'tiff']
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        const readableStream = Readable.from(buffer);
        readableStream.pipe(uploadStream);
    });
};

// @desc    Upload image
// @route   POST /api/images/upload
// @access  Public
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return sendValidationError(res, 'No image file provided');
        }

        const {
            name,
            category,
            tags,
            description,
            alt,
            folder
        } = req.body;

        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(
            req.file.buffer,
            folder || 'zero-code-platform'
        );

        const image = await Image.create({
            name: name || req.file.originalname.split('.')[0],
            originalName: req.file.originalname,
            filename: cloudinaryResult.public_id,
            path: null, // Not needed for Cloudinary
            url: cloudinaryResult.secure_url, // Cloudinary secure URL
            cloudinaryPublicId: cloudinaryResult.public_id,
            cloudinarySecureUrl: cloudinaryResult.secure_url,
            mimeType: req.file.mimetype,
            size: cloudinaryResult.bytes,
            width: cloudinaryResult.width || null,
            height: cloudinaryResult.height || null,
            category: category || 'image',
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            description: description || '',
            alt: alt || name || req.file.originalname.split('.')[0],
            status: 'active'
        });

        return sendCreated(res, image, 'Image uploaded successfully to Cloudinary');
    } catch (error) {
        return handleError(res, error, 'Failed to upload image to Cloudinary');
    }
};

// @desc    Get all images
// @route   GET /api/images
// @access  Public
const getAllImages = async (req, res) => {
    try {
        const { category, status, search, tags } = req.query;

        const query = {};
        if (category) {
            query.category = category;
        }
        if (status) {
            query.status = status;
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { alt: { $regex: search, $options: 'i' } }
            ];
        }
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            query.tags = { $in: tagArray.map(t => t.trim()) };
        }

        const images = await Image.find(query)
            .sort({ createdAt: -1 })
            .select('-__v');

        return sendSuccess(res, images);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch images');
    }
};

// @desc    Get single image by ID
// @route   GET /api/images/:id
// @access  Public
const getImageById = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id).select('-__v');

        if (!image) {
            return sendNotFound(res, 'Image not found');
        }

        return sendSuccess(res, image);
    } catch (error) {
        return handleError(res, error, 'Failed to fetch image');
    }
};

// @desc    Update image metadata
// @route   PUT /api/images/:id
// @access  Public
const updateImage = async (req, res) => {
    try {
        const {
            name,
            category,
            tags,
            description,
            alt,
            status
        } = req.body;

        const image = await Image.findById(req.params.id);

        if (!image) {
            return sendNotFound(res, 'Image not found');
        }

        // Update fields
        if (name) image.name = name;
        if (category) image.category = category;
        if (tags !== undefined) {
            image.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
        }
        if (description !== undefined) image.description = description;
        if (alt !== undefined) image.alt = alt;
        if (status) image.status = status;

        await image.save();

        return sendUpdated(res, image, 'Image updated successfully');
    } catch (error) {
        return handleError(res, error, 'Failed to update image');
    }
};

// @desc    Delete image
// @route   DELETE /api/images/:id
// @access  Public
const deleteImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);

        if (!image) {
            return sendNotFound(res, 'Image not found');
        }

        // Delete from Cloudinary
        if (image.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(image.cloudinaryPublicId);
            } catch (cloudinaryError) {
                console.error('Error deleting from Cloudinary:', cloudinaryError);
                // Continue with database deletion even if Cloudinary deletion fails
            }
        }

        // Delete from database
        await Image.findByIdAndDelete(req.params.id);

        return sendDeleted(res, 'Image deleted successfully from Cloudinary');
    } catch (error) {
        return handleError(res, error, 'Failed to delete image');
    }
};

// @desc    Bulk delete images
// @route   DELETE /api/images/bulk
// @access  Public
const bulkDeleteImages = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return sendValidationError(res, 'Array of image IDs is required');
        }

        const images = await Image.find({ _id: { $in: ids } });

        // Delete from Cloudinary
        for (const image of images) {
            if (image.cloudinaryPublicId) {
                try {
                    await cloudinary.uploader.destroy(image.cloudinaryPublicId);
                } catch (cloudinaryError) {
                    console.error('Error deleting from Cloudinary:', cloudinaryError);
                }
            }
        }

        // Delete from database
        await Image.deleteMany({ _id: { $in: ids } });

        return sendDeleted(res, `${images.length} image(s) deleted successfully`);
    } catch (error) {
        return handleError(res, error, 'Failed to delete images');
    }
};

module.exports = {
    uploadImage,
    getAllImages,
    getImageById,
    updateImage,
    deleteImage,
    bulkDeleteImages
};

