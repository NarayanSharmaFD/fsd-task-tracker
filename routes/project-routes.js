const express = require('express');

const projectController = require('../controllers/project-controller');
const isAuth = require('../middleware/is-auth');

const projectRouter = express.Router();

projectRouter.get('/project-list', isAuth, projectController.getProjectList);

projectRouter.post('/project', isAuth, projectController.postAddProject);

projectRouter.get('/project', isAuth, projectController.getAddProject);

projectRouter.post('/delete-project', isAuth, projectController.postDeleteProject);

projectRouter.get('/edit-project/:projectId', isAuth, projectController.getEditProject);

projectRouter.post('/edit-project', isAuth, projectController.postEditProject);

module.exports = projectRouter;
