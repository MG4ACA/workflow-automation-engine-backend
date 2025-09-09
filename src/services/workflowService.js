/**
 * Workflow Service Layer
 * Handles business logic for workflow operations
 * Part of the application's clean architecture
 */

const { prisma } = require('../config/database');

class WorkflowService {
  /**
   * Create a new workflow
   * @param {Object} workflowData - { name, trigger, action, config }
   * @returns {Promise<Object>} Created workflow
   */
  async createWorkflow(workflowData) {
    try {
      const { name, trigger, action, config } = workflowData;

      // Validate required fields
      if (!name || !trigger || !action) {
        throw new Error('Name, trigger, and action are required fields');
      }

      const workflow = await prisma.workflow.create({
        data: {
          name,
          trigger,
          action,
          config: config || {},
        },
      });

      return workflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  }

  /**
   * Get all workflows
   * @returns {Promise<Array>} List of workflows
   */
  async getAllWorkflows() {
    try {
      const workflows = await prisma.workflow.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          logs: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 5, // Include only last 5 logs per workflow
          },
        },
      });

      return workflows;
    } catch (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }
  }

  /**
   * Get workflow by ID
   * @param {string} id - Workflow ID
   * @returns {Promise<Object|null>} Workflow or null if not found
   */
  async getWorkflowById(id) {
    try {
      const workflow = await prisma.workflow.findUnique({
        where: { id },
        include: {
          logs: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      return workflow;
    } catch (error) {
      console.error('Error fetching workflow by ID:', error);
      throw error;
    }
  }

  /**
   * Get workflows by trigger type
   * @param {string} trigger - Trigger type (e.g., 'onUserSignup')
   * @returns {Promise<Array>} List of workflows
   */
  async getWorkflowsByTrigger(trigger) {
    try {
      const workflows = await prisma.workflow.findMany({
        where: { trigger },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return workflows;
    } catch (error) {
      console.error('Error fetching workflows by trigger:', error);
      throw error;
    }
  }

  /**
   * Update workflow
   * @param {string} id - Workflow ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated workflow
   */
  async updateWorkflow(id, updateData) {
    try {
      const workflow = await prisma.workflow.update({
        where: { id },
        data: updateData,
      });

      return workflow;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  }

  /**
   * Delete workflow
   * @param {string} id - Workflow ID
   * @returns {Promise<Object>} Deleted workflow
   */
  async deleteWorkflow(id) {
    try {
      const workflow = await prisma.workflow.delete({
        where: { id },
      });

      return workflow;
    } catch (error) {
      console.error('Error deleting workflow:', error);
      throw error;
    }
  }
}

module.exports = new WorkflowService();
