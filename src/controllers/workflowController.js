/**
 * Workflow Controller
 * Handles HTTP requests for workflow operations
 * Part of the presentation layer in clean architecture
 */

const workflowService = require('../services/workflowService');
const logService = require('../services/logService');

class WorkflowController {
  /**
   * Create a new workflow
   * POST /api/workflows
   */
  async createWorkflow(req, res) {
    try {
      const { name, trigger, action, config } = req.body;

      // Basic validation
      if (!name || !trigger || !action) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Name, trigger, and action are required fields',
        });
      }

      const workflow = await workflowService.createWorkflow({
        name,
        trigger,
        action,
        config,
      });

      // Log the workflow creation
      await logService.createLog({
        workflowId: workflow.id,
        action: 'workflow_created',
        status: 'success',
        message: `Workflow "${name}" created successfully`,
      });

      res.status(201).json({
        success: true,
        message: 'Workflow created successfully',
        data: workflow,
      });
    } catch (error) {
      console.error('Create workflow error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create workflow',
      });
    }
  }

  /**
   * Get all workflows
   * GET /api/workflows
   */
  async getAllWorkflows(req, res) {
    try {
      const workflows = await workflowService.getAllWorkflows();

      res.json({
        success: true,
        message: 'Workflows retrieved successfully',
        data: workflows,
        count: workflows.length,
      });
    } catch (error) {
      console.error('Get workflows error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve workflows',
      });
    }
  }

  /**
   * Get workflow by ID
   * GET /api/workflows/:id
   */
  async getWorkflowById(req, res) {
    try {
      const { id } = req.params;
      const workflow = await workflowService.getWorkflowById(id);

      if (!workflow) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Workflow not found',
        });
      }

      res.json({
        success: true,
        message: 'Workflow retrieved successfully',
        data: workflow,
      });
    } catch (error) {
      console.error('Get workflow by ID error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve workflow',
      });
    }
  }

  /**
   * Update workflow
   * PUT /api/workflows/:id
   */
  async updateWorkflow(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const workflow = await workflowService.updateWorkflow(id, updateData);

      // Log the workflow update
      await logService.createLog({
        workflowId: workflow.id,
        action: 'workflow_updated',
        status: 'success',
        message: `Workflow "${workflow.name}" updated successfully`,
      });

      res.json({
        success: true,
        message: 'Workflow updated successfully',
        data: workflow,
      });
    } catch (error) {
      console.error('Update workflow error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to update workflow',
      });
    }
  }

  /**
   * Delete workflow
   * DELETE /api/workflows/:id
   */
  async deleteWorkflow(req, res) {
    try {
      const { id } = req.params;
      const workflow = await workflowService.deleteWorkflow(id);

      res.json({
        success: true,
        message: 'Workflow deleted successfully',
        data: workflow,
      });
    } catch (error) {
      console.error('Delete workflow error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to delete workflow',
      });
    }
  }

  /**
   * Get workflow logs
   * GET /api/workflows/:id/logs
   */
  async getWorkflowLogs(req, res) {
    try {
      const { id } = req.params;
      const logs = await logService.getLogsByWorkflowId(id);

      res.json({
        success: true,
        message: 'Workflow logs retrieved successfully',
        data: logs,
        count: logs.length,
      });
    } catch (error) {
      console.error('Get workflow logs error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve workflow logs',
      });
    }
  }
}

module.exports = new WorkflowController();
