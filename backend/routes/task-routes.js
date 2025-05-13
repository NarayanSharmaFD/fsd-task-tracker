const express = require('express');

const taskController = require('../controllers/task-controller');
const isAuth = require('../middleware/is-auth');

const taskRouter = express.Router();

taskRouter.post('/task/:projectId', isAuth, taskController.postAddTask);

taskRouter.get('/create-task/:projectId', isAuth, taskController.getAddTask);

taskRouter.post('/task-list/:projectId', isAuth, taskController.getTaskList);

taskRouter.post('/delete-task', isAuth, taskController.postDeleteTask);

taskRouter.post('/edit-task/:taskId', isAuth, taskController.postEditTask);

module.exports = taskRouter;
