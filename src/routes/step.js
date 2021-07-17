const router = require('express').Router();
const step = require('../controllers/step_controller');

router.get('/task/:taskId', step.getStepsByTaskId);

router.post('/', step.createStep);

router.put('/', step.updateStepById);

router.delete('/:stepId', step.deleteStepById);

module.exports = router;
