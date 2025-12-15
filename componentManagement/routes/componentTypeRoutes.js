const express = require('express');
const router = express.Router();
const {
    getAllComponentTypes,
    getComponentTypeByType,
    createComponentType,
    updateComponentType,
    deleteComponentType,
    initializeDefaultComponentTypes
} = require('../controllers/componentTypeController');

// Component type routes
router.get('/', getAllComponentTypes);
router.get('/:type', getComponentTypeByType);
router.post('/', createComponentType);
router.post('/initialize', initializeDefaultComponentTypes);
router.put('/:id', updateComponentType);
router.delete('/:id', deleteComponentType);

module.exports = router;

