const express = require('express');
const router = express.Router();
const {
    createScreen,
    getAllScreens,
    getScreenById,
    updateScreen,
    updateScreenPosition,
    deleteScreen
} = require('../controllers/screenController');

// Screen routes
router.post('/', createScreen);
router.get('/', getAllScreens);
router.get('/:id', getScreenById);
router.put('/:id', updateScreen);
router.patch('/:id/position', updateScreenPosition); // For drag operations
router.delete('/:id', deleteScreen);

module.exports = router;

