const express = require('express');

const projectController = require('../controllers/project-controller');
const isAuth = require('../middleware/is-auth');

const projectRouter = express.Router();

projectRouter.post('/project-list', isAuth, projectController.postProjectList);

projectRouter.post('/project', isAuth, projectController.postAddProject);

projectRouter.get('/project', isAuth, projectController.getAddProject);

projectRouter.post('/delete-project', isAuth, projectController.postDeleteProject);

projectRouter.post('/edit-project', isAuth, projectController.postEditProject);

module.exports = projectRouter;
