const express = require('express');
const router = express.Router();
const {
    createApp,
    getAllApps,
    getAppById,
    updateApp,
    deleteApp
} = require('../controllers/appController');

// App routes
router.post('/', createApp);
router.get('/', getAllApps);
router.get('/:id', getAppById);
router.put('/:id', updateApp);
router.delete('/:id', deleteApp);

module.exports = router;

