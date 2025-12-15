/**
 * Response Helper Utility
 * Standardizes API response format across all controllers
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        status: 'success',
        message: message
    };

    if (data !== null) {
        if (Array.isArray(data)) {
            response.count = data.length;
            response.data = data;
        } else if (typeof data === 'object' && data !== null) {
            // If data has count property (for paginated results)
            if (data.count !== undefined) {
                response.count = data.count;
                response.data = data.data || data.items || data;
            } else {
                response.data = data;
            }
        } else {
            response.data = data;
        }
    }

    return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} errors - Additional error details (optional)
 */
const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    const response = {
        status: 'error',
        message: message
    };

    if (errors !== null) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send validation error response
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 * @param {*} errors - Validation errors (optional)
 */
const sendValidationError = (res, message = 'Validation failed', errors = null) => {
    return sendError(res, message, 400, errors);
};

/**
 * Send not found error response
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 */
const sendNotFound = (res, message = 'Resource not found') => {
    return sendError(res, message, 404);
};

/**
 * Send created response
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = 'Resource created successfully') => {
    return sendSuccess(res, data, message, 201);
};

/**
 * Send updated response
 * @param {Object} res - Express response object
 * @param {*} data - Updated resource data
 * @param {string} message - Success message
 */
const sendUpdated = (res, data, message = 'Resource updated successfully') => {
    return sendSuccess(res, data, message, 200);
};

/**
 * Send deleted response
 * @param {Object} res - Express response object
 * @param {string} message - Success message
 */
const sendDeleted = (res, message = 'Resource deleted successfully') => {
    return sendSuccess(res, null, message, 200);
};

/**
 * Handle Mongoose CastError (Invalid ID)
 * @param {Object} res - Express response object
 * @param {Error} error - Mongoose error
 */
const handleCastError = (res, error) => {
    return sendValidationError(res, 'Invalid ID format');
};

/**
 * Handle Mongoose duplicate key error
 * @param {Object} res - Express response object
 * @param {Error} error - Mongoose error
 */
const handleDuplicateError = (res, error) => {
    const field = Object.keys(error.keyPattern || {})[0] || 'field';
    return sendValidationError(res, `${field} already exists`);
};

/**
 * Handle Mongoose validation error
 * @param {Object} res - Express response object
 * @param {Error} error - Mongoose error
 */
const handleValidationError = (res, error) => {
    const errors = {};
    if (error.errors) {
        Object.keys(error.errors).forEach(key => {
            errors[key] = error.errors[key].message;
        });
    }
    return sendValidationError(res, 'Validation failed', errors);
};

/**
 * Handle general error
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default error message
 */
const handleError = (res, error, defaultMessage = 'An error occurred') => {
    // Handle Mongoose errors
    if (error.name === 'CastError') {
        return handleCastError(res, error);
    }
    if (error.code === 11000) {
        return handleDuplicateError(res, error);
    }
    if (error.name === 'ValidationError') {
        return handleValidationError(res, error);
    }

    // Handle general errors
    return sendError(res, error.message || defaultMessage, 500);
};

module.exports = {
    sendSuccess,
    sendError,
    sendValidationError,
    sendNotFound,
    sendCreated,
    sendUpdated,
    sendDeleted,
    handleCastError,
    handleDuplicateError,
    handleValidationError,
    handleError
};

