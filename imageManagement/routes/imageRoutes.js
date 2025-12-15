const express = require('express');
const router = express.Router();
const upload = require('../middleware/imageUpload');
const {
    uploadImage,
    getAllImages,
    getImageById,
    updateImage,
    deleteImage,
    bulkDeleteImages
} = require('../controllers/imageController');

// Image routes
router.post('/upload', upload.single('image'), uploadImage);
router.get('/', getAllImages);
router.get('/:id', getImageById);
router.put('/:id', updateImage);
router.delete('/:id', deleteImage);
router.delete('/bulk', bulkDeleteImages);

module.exports = router;

