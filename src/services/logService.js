/**
 * Log Service Layer
 * Handles business logic for logging workflow executions
 * Part of the application's clean architecture
 */

const { prisma } = require('../config/database');

class LogService {
  /**
   * Create a new log entry
   * @param {Object} logData - { workflowId, action, status, message }
   * @returns {Promise<Object>} Created log
   */
  async createLog(logData) {
    try {
      const { workflowId, action, status, message } = logData;

      // Validate required fields
      if (!workflowId || !action || !status) {
        throw new Error('WorkflowId, action, and status are required fields');
      }

      const log = await prisma.log.create({
        data: {
          workflowId,
          action,
          status,
          message: message || null,
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              trigger: true,
              action: true,
            },
          },
        },
      });

      return log;
    } catch (error) {
      console.error('Error creating log:', error);
      throw error;
    }
  }

  /**
   * Get all logs
   * @param {Object} options - { limit, offset, workflowId }
   * @returns {Promise<Array>} List of logs
   */
  async getAllLogs(options = {}) {
    try {
      const { limit = 50, offset = 0, workflowId } = options;

      const whereClause = workflowId ? { workflowId } : {};

      const logs = await prisma.log.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              trigger: true,
              action: true,
            },
          },
        },
      });

      return logs;
    } catch (error) {
      console.error('Error fetching logs:', error);
      throw error;
    }
  }

  /**
   * Get logs by workflow ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Array>} List of logs for the workflow
   */
  async getLogsByWorkflowId(workflowId) {
    try {
      const logs = await prisma.log.findMany({
        where: { workflowId },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              trigger: true,
              action: true,
            },
          },
        },
      });

      return logs;
    } catch (error) {
      console.error('Error fetching logs by workflow ID:', error);
      throw error;
    }
  }

  /**
   * Get logs by status
   * @param {string} status - Log status ('success', 'failed', 'pending')
   * @returns {Promise<Array>} List of logs with the specified status
   */
  async getLogsByStatus(status) {
    try {
      const logs = await prisma.log.findMany({
        where: { status },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
              trigger: true,
              action: true,
            },
          },
        },
      });

      return logs;
    } catch (error) {
      console.error('Error fetching logs by status:', error);
      throw error;
    }
  }

  /**
   * Get log statistics
   * @returns {Promise<Object>} Log statistics
   */
  async getLogStats() {
    try {
      const [total, success, failed, pending] = await Promise.all([
        prisma.log.count(),
        prisma.log.count({ where: { status: 'success' } }),
        prisma.log.count({ where: { status: 'failed' } }),
        prisma.log.count({ where: { status: 'pending' } }),
      ]);

      return {
        total,
        success,
        failed,
        pending,
        successRate: total > 0 ? ((success / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('Error fetching log statistics:', error);
      throw error;
    }
  }
}

module.exports = new LogService();
