const BusinessSignal = require('../models/BusinessSignal');
const AgentTask = require('../models/AgentTask');
const Integration = require('../models/Integration');
const DecisionEngine = require('../services/autonomous/DecisionEngine');
const WorkflowEngine = require('../services/autonomous/WorkflowEngine');

/**
 * @desc    Get all business signals for a store
 * @route   GET /api/v1/ecommerce/autonomous/signals/:storeId
 */
exports.getSignals = async (req, res) => {
    try {
        const signals = await BusinessSignal.find({ storeId: req.params.storeId }).sort({ createdAt: -1 });
        res.json({ success: true, data: signals });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Get all autonomous agent tasks (The AI's activity feed)
 * @route   GET /api/v1/ecommerce/autonomous/tasks/:storeId
 */
exports.getAgentTasks = async (req, res) => {
    try {
        const tasks = await AgentTask.find({ storeId: req.params.storeId }).sort({ createdAt: -1 });
        res.json({ success: true, data: tasks });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Manually trigger an AI Audit of the store
 * @route   POST /api/v1/ecommerce/autonomous/audit/:storeId
 */
exports.triggerAudit = async (req, res) => {
    try {
        // 1. Create a synthetic 'audit' signal
        const signal = new BusinessSignal({
            storeId: req.params.storeId,
            type: 'REVENUE_DROP', // Simulate a trigger
            payload: { message: 'Manual audit requested' }
        });
        await signal.save();

        // 2. Ask the Brain to process it
        const decision = await DecisionEngine.processIncomingSignal(signal);

        res.json({ 
            success: true, 
            message: 'Autonomous audit initiated',
            aiThoughts: decision 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Get AI-computed store health and anomalies
 * @route   GET /api/v1/ecommerce/autonomous/health/:storeId
 */
const AnalyticsEngine = require('../services/autonomous/AnalyticsEngine');

exports.getStoreHealth = async (req, res) => {
    try {
        const health = await AnalyticsEngine.calculateStoreHealth(req.params.storeId);
        res.json({ success: true, data: health });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * @desc    Approve an AI-planned task
 * @route   PATCH /api/v1/ecommerce/autonomous/tasks/:taskId/approve
 */
exports.approveTask = async (req, res) => {
    try {
        const task = await AgentTask.findById(req.params.taskId);
        if (!task) return res.status(404).json({ success: false, error: 'Task not found' });

        // Update status to executing
        task.status = 'executing';
        task.approvedBy = req.user.id;
        task.approvedAt = new Date();
        await task.save();
        
        // Find the primary integration to execute against
        const integration = await Integration.findOne({ storeId: task.storeId, isActive: true });
        
        if (!integration) {
            task.status = 'failed';
            await task.save();
            return res.status(400).json({ success: false, error: 'No active integration found for this store' });
        }

        // Trigger execution asynchronously
        setImmediate(async () => {
            try {
                const results = await WorkflowEngine.executeTask(task, integration);
                task.status = results.some(r => r.status === 'failed') ? 'failed' : 'completed';
                task.completedAt = new Date();
                await task.save();
            } catch (err) {
                console.error('[AutonomousController] Task execution failed:', err.message);
                task.status = 'failed';
                await task.save();
            }
        });
        
        res.json({ success: true, data: task, message: 'Task execution started' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
