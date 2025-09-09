/**
 * Trigger Routes
 * Defines API routes for workflow triggers
 */

const express = require('express');
const triggerController = require('../controllers/triggerController');

const router = express.Router();

/**
 * @route   POST /api/triggers/userSignup
 * @desc    Simulate a user signup trigger
 * @access  Public
 */
router.post('/userSignup', triggerController.triggerUserSignup);

/**
 * @route   POST /api/triggers/:triggerName
 * @desc    Generic trigger endpoint
 * @access  Public
 */
router.post('/:triggerName', triggerController.genericTrigger);

/**
 * @route   GET /api/triggers/logs
 * @desc    Get all logs with optional filtering
 * @access  Public
 */
router.get('/logs', triggerController.getAllLogs);

/**
 * @route   GET /api/triggers/logs/stats
 * @desc    Get log statistics
 * @access  Public
 */
router.get('/logs/stats', triggerController.getLogStats);

/**
 * @route   GET /api/triggers/test
 * @desc    Test workflow engine connectivity
 * @access  Public
 */
router.get('/test', triggerController.testEngine);

module.exports = router;
