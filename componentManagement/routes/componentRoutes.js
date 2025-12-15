const express = require('express');
const router = express.Router();
const {
    createComponent,
    getAllComponents,
    getComponentsByScreen,
    getComponentById,
    updateComponent,
    updateComponentStyles,
    updateComponentPosition,
    deleteComponent
} = require('../controllers/componentController');

// Component routes
router.post('/', createComponent);
router.get('/', getAllComponents);
router.get('/screen/:screenId', getComponentsByScreen);
router.get('/:id', getComponentById);
router.put('/:id', updateComponent);
router.patch('/:id/styles', updateComponentStyles);
router.patch('/:id/position', updateComponentPosition);
router.delete('/:id', deleteComponent);

module.exports = router;

