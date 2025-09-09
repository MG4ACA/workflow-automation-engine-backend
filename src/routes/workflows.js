/**
 * Workflow Routes
 * Defines API routes for workflow operations
 */

const express = require('express');
const workflowController = require('../controllers/workflowController');

const router = express.Router();

/**
 * @route   POST /api/workflows
 * @desc    Create a new workflow
 * @access  Public (for now, will add auth later)
 */
router.post('/', workflowController.createWorkflow);

/**
 * @route   GET /api/workflows
 * @desc    Get all workflows
 * @access  Public
 */
router.get('/', workflowController.getAllWorkflows);

/**
 * @route   GET /api/workflows/:id
 * @desc    Get workflow by ID
 * @access  Public
 */
router.get('/:id', workflowController.getWorkflowById);

/**
 * @route   PUT /api/workflows/:id
 * @desc    Update workflow
 * @access  Public
 */
router.put('/:id', workflowController.updateWorkflow);

/**
 * @route   DELETE /api/workflows/:id
 * @desc    Delete workflow
 * @access  Public
 */
router.delete('/:id', workflowController.deleteWorkflow);

/**
 * @route   GET /api/workflows/:id/logs
 * @desc    Get logs for a specific workflow
 * @access  Public
 */
router.get('/:id/logs', workflowController.getWorkflowLogs);

module.exports = router;
