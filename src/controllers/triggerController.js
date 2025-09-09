/**
 * Trigger Controller
 * Handles HTTP requests for workflow triggers
 * Part of the presentation layer in clean architecture
 */

const workflowEngine = require('../engine/workflowEngine');
const logService = require('../services/logService');

class TriggerController {
  /**
   * Simulate user signup trigger
   * POST /api/triggers/userSignup
   */
  async triggerUserSignup(req, res) {
    try {
      const userData = req.body;

      // Default user data if none provided
      const defaultUserData = {
        email: userData.email || 'user@example.com',
        name: userData.name || 'Test User',
        id: userData.id || `user-${Date.now()}`,
        signupTime: new Date().toISOString(),
      };

      console.log('🔔 User signup trigger received:', defaultUserData);

      // Trigger the user signup event
      await workflowEngine.trigger('userSignup', defaultUserData);

      res.json({
        success: true,
        message: 'User signup trigger executed successfully',
        data: {
          trigger: 'userSignup',
          userData: defaultUserData,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('User signup trigger error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to execute user signup trigger',
      });
    }
  }

  /**
   * Generic trigger endpoint
   * POST /api/triggers/:triggerName
   */
  async genericTrigger(req, res) {
    try {
      const { triggerName } = req.params;
      const triggerData = req.body;

      console.log(`🔔 Generic trigger received: ${triggerName}`, triggerData);

      // Trigger the event
      await workflowEngine.trigger(triggerName, triggerData);

      res.json({
        success: true,
        message: `Trigger "${triggerName}" executed successfully`,
        data: {
          trigger: triggerName,
          triggerData,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error(`Generic trigger error (${req.params.triggerName}):`, error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: `Failed to execute trigger: ${req.params.triggerName}`,
      });
    }
  }

  /**
   * Get all logs
   * GET /api/triggers/logs
   */
  async getAllLogs(req, res) {
    try {
      const { limit, offset, workflowId, status } = req.query;

      const options = {
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
        workflowId,
      };

      let logs;
      if (status) {
        logs = await logService.getLogsByStatus(status);
      } else {
        logs = await logService.getAllLogs(options);
      }

      res.json({
        success: true,
        message: 'Logs retrieved successfully',
        data: logs,
        count: logs.length,
      });
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve logs',
      });
    }
  }

  /**
   * Get log statistics
   * GET /api/triggers/logs/stats
   */
  async getLogStats(req, res) {
    try {
      const stats = await logService.getLogStats();

      res.json({
        success: true,
        message: 'Log statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      console.error('Get log stats error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve log statistics',
      });
    }
  }

  /**
   * Test workflow engine connectivity
   * GET /api/triggers/test
   */
  async testEngine(req, res) {
    try {
      const testData = {
        message: 'Engine connectivity test',
        timestamp: new Date().toISOString(),
      };

      // Emit a test event (won't trigger any workflows unless they exist)
      workflowEngine.emit('test', testData);

      res.json({
        success: true,
        message: 'Workflow engine is running and responsive',
        data: {
          engineStatus: 'active',
          registeredActions: Array.from(workflowEngine.actions.keys()),
          testData,
        },
      });
    } catch (error) {
      console.error('Engine test error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Workflow engine test failed',
      });
    }
  }
}

module.exports = new TriggerController();
