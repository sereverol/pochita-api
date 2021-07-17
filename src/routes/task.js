const router = require('express').Router();
const task = require('../controllers/task_controller');

router.get('/list/:listId', task.getTaskByListId);

router.post('/', task.createTask);

router.put('/field', task.updateTaskFieldById);

router.delete('/:taskId', task.deleteTaskById);

module.exports = router;
