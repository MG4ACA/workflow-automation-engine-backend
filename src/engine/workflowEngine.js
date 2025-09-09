/**
 * Event Engine Core
 * Handles workflow triggers and executes actions using Node.js EventEmitter
 * This is the heart of the workflow automation system
 */

const EventEmitter = require('events');
const workflowService = require('../services/workflowService');
const logService = require('../services/logService');

class WorkflowEngine extends EventEmitter {
  constructor() {
    super();
    this.actions = new Map();
    this.registerDefaultActions();
    this.setupEventListeners();
  }

  /**
   * Register an action handler
   * @param {string} actionName - Name of the action
   * @param {Function} handler - Action handler function
   */
  registerAction(actionName, handler) {
    this.actions.set(actionName, handler);
    console.log(`✅ Registered action: ${actionName}`);
  }

  /**
   * Register default actions as specified in the README
   */
  registerDefaultActions() {
    // Mock email action
    this.registerAction('sendEmail', this.sendEmailAction);

    // Insert row action
    this.registerAction('insertRow', this.insertRowAction);

    // Write log action
    this.registerAction('writeLog', this.writeLogAction);

    // Save file action (mock S3)
    this.registerAction('saveFile', this.saveFileAction);

    // Chain workflow action
    this.registerAction('chainWorkflow', this.chainWorkflowAction);
  }

  /**
   * Setup event listeners for triggers
   */
  setupEventListeners() {
    // Listen for user signup trigger
    this.on('userSignup', this.handleUserSignup.bind(this));

    // Listen for workflow completion (for chaining)
    this.on('workflowCompleted', this.handleWorkflowCompleted.bind(this));

    console.log('✅ Event listeners setup complete');
  }

  /**
   * Handle user signup trigger
   * @param {Object} userData - User data from signup
   */
  async handleUserSignup(userData) {
    try {
      console.log('🔔 User signup triggered:', userData);

      // Find all workflows with 'onUserSignup' trigger
      const workflows = await workflowService.getWorkflowsByTrigger('onUserSignup');

      // Execute each workflow
      for (const workflow of workflows) {
        await this.executeWorkflow(workflow, userData);
      }
    } catch (error) {
      console.error('Error handling user signup:', error);
    }
  }

  /**
   * Handle workflow completion (for chaining)
   * @param {Object} data - { workflowId, result }
   */
  async handleWorkflowCompleted(data) {
    try {
      console.log('🔗 Workflow completed, checking for chains:', data);

      // Find workflows that should be triggered by this completion
      const chainWorkflows = await workflowService.getWorkflowsByTrigger(
        `onWorkflowComplete:${data.workflowId}`
      );

      for (const workflow of chainWorkflows) {
        await this.executeWorkflow(workflow, data.result);
      }
    } catch (error) {
      console.error('Error handling workflow completion:', error);
    }
  }

  /**
   * Execute a workflow
   * @param {Object} workflow - Workflow object from database
   * @param {Object} triggerData - Data from the trigger event
   */
  async executeWorkflow(workflow, triggerData) {
    try {
      console.log(`🚀 Executing workflow: ${workflow.name} (${workflow.id})`);

      // Log workflow start
      await logService.createLog({
        workflowId: workflow.id,
        action: workflow.action,
        status: 'pending',
        message: `Started execution of workflow: ${workflow.name}`,
      });

      // Get action handler
      const actionHandler = this.actions.get(workflow.action);

      if (!actionHandler) {
        throw new Error(`Action handler not found: ${workflow.action}`);
      }

      // Execute the action
      const result = await actionHandler.call(this, workflow.config, triggerData, workflow);

      // Log success
      await logService.createLog({
        workflowId: workflow.id,
        action: workflow.action,
        status: 'success',
        message: `Successfully executed workflow: ${workflow.name}`,
      });

      // Emit workflow completion event for chaining
      this.emit('workflowCompleted', {
        workflowId: workflow.id,
        result,
        workflow,
      });

      console.log(`✅ Workflow executed successfully: ${workflow.name}`);
      return result;
    } catch (error) {
      console.error(`❌ Workflow execution failed: ${workflow.name}`, error);

      // Log failure
      await logService.createLog({
        workflowId: workflow.id,
        action: workflow.action,
        status: 'failed',
        message: `Failed to execute workflow: ${workflow.name}. Error: ${error.message}`,
      });

      throw error;
    }
  }

  /**
   * Trigger an event manually
   * @param {string} triggerName - Name of the trigger
   * @param {Object} data - Trigger data
   */
  async trigger(triggerName, data) {
    try {
      console.log(`🔔 Manual trigger: ${triggerName}`, data);
      this.emit(triggerName, data);
    } catch (error) {
      console.error('Error triggering event:', error);
      throw error;
    }
  }

  // =============================================================
  // ACTION HANDLERS (as specified in README)
  // =============================================================

  /**
   * Send Email Action (Mock SMTP)
   * @param {Object} config - Email configuration
   * @param {Object} triggerData - Data from trigger
   * @param {Object} workflow - Workflow object
   */
  async sendEmailAction(config, triggerData, workflow) {
    try {
      const { to, subject, body } = config;

      // Mock email sending (replace with real SMTP later)
      console.log('📧 Sending email (MOCK):');
      console.log(`  To: ${to || triggerData.email || 'user@example.com'}`);
      console.log(`  Subject: ${subject || 'Workflow Notification'}`);
      console.log(`  Body: ${body || 'Your workflow has been triggered!'}`);

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        success: true,
        action: 'sendEmail',
        details: { to, subject, body },
      };
    } catch (error) {
      console.error('Send email action failed:', error);
      throw error;
    }
  }

  /**
   * Insert Row Action
   * @param {Object} config - Row insertion configuration
   * @param {Object} triggerData - Data from trigger
   * @param {Object} workflow - Workflow object
   */
  async insertRowAction(config, triggerData, workflow) {
    try {
      const { table, data } = config;

      console.log(`📊 Inserting row into ${table || 'logs'}:`, data || triggerData);

      // For now, we'll just insert into logs table as an example
      // Later this can be extended to support custom tables
      const logData = {
        workflowId: workflow.id,
        action: 'insertRow',
        status: 'success',
        message: `Inserted row: ${JSON.stringify(data || triggerData)}`,
      };

      await logService.createLog(logData);

      return {
        success: true,
        action: 'insertRow',
        details: { table, data: data || triggerData },
      };
    } catch (error) {
      console.error('Insert row action failed:', error);
      throw error;
    }
  }

  /**
   * Write Log Action
   * @param {Object} config - Log configuration
   * @param {Object} triggerData - Data from trigger
   * @param {Object} workflow - Workflow object
   */
  async writeLogAction(config, triggerData, workflow) {
    try {
      const { message, status } = config;

      console.log('📝 Writing custom log:', message || 'Custom log entry');

      await logService.createLog({
        workflowId: workflow.id,
        action: 'writeLog',
        status: status || 'success',
        message: message || `Custom log: ${JSON.stringify(triggerData)}`,
      });

      return {
        success: true,
        action: 'writeLog',
        details: { message, status },
      };
    } catch (error) {
      console.error('Write log action failed:', error);
      throw error;
    }
  }

  /**
   * Save File Action (Mock S3)
   * @param {Object} config - File save configuration
   * @param {Object} triggerData - Data from trigger
   * @param {Object} workflow - Workflow object
   */
  async saveFileAction(config, triggerData, workflow) {
    try {
      const { fileName, content, bucket } = config;
      const fs = require('fs').promises;
      const path = require('path');

      // Create mock S3 directory if it doesn't exist
      const mockS3Dir = path.join(process.cwd(), 'mock-s3');
      const bucketDir = path.join(mockS3Dir, bucket || 'default-bucket');

      await fs.mkdir(bucketDir, { recursive: true });

      // Write file
      const filePath = path.join(bucketDir, fileName || `file-${Date.now()}.txt`);
      const fileContent = content || JSON.stringify(triggerData, null, 2);

      await fs.writeFile(filePath, fileContent, 'utf8');

      console.log(`💾 File saved (Mock S3): ${filePath}`);

      return {
        success: true,
        action: 'saveFile',
        details: { fileName, filePath, bucket },
      };
    } catch (error) {
      console.error('Save file action failed:', error);
      throw error;
    }
  }

  /**
   * Chain Workflow Action
   * @param {Object} config - Chain configuration
   * @param {Object} triggerData - Data from trigger
   * @param {Object} workflow - Workflow object
   */
  async chainWorkflowAction(config, triggerData, workflow) {
    try {
      const { workflowId, delay } = config;

      console.log(`🔗 Chaining to workflow: ${workflowId}`);

      // Add delay if specified
      if (delay) {
        console.log(`⏳ Waiting ${delay}ms before chaining...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Get the target workflow
      const targetWorkflow = await workflowService.getWorkflowById(workflowId);

      if (!targetWorkflow) {
        throw new Error(`Target workflow not found: ${workflowId}`);
      }

      // Execute the chained workflow
      const result = await this.executeWorkflow(targetWorkflow, triggerData);

      return {
        success: true,
        action: 'chainWorkflow',
        details: { workflowId, result },
      };
    } catch (error) {
      console.error('Chain workflow action failed:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const workflowEngine = new WorkflowEngine();
module.exports = workflowEngine;
