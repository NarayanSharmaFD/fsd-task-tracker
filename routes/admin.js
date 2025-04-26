const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// // /admin/add-product => POST
router.post('/add-product', isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

router.post('/roles', adminController.postAddRole);

router.get('/roles',adminController.getAddRole);

router.post('/statuses', adminController.postAddStatus);

router.get('/statuses', adminController.getAddStatus);

router.post('/user', adminController.postAddUser);

router.get('/user', adminController.getAddUser);

router.post('/project', adminController.postAddProject);

router.get('/project', adminController.getAddProject);

router.post('/task/:projectId', adminController.postAddTask);

router.get('/create-task/:projectId', adminController.getAddTask);

router.get('/project-list', adminController.getProjectList);

router.post('/delete-project', adminController.postDeleteProject);

router.get('/edit-project/:projectId', isAuth, adminController.getEditProject);

router.post('/edit-project', isAuth, adminController.postEditProject);

router.get('/task-list/:projectId', isAuth, adminController.getTaskList);

router.post('/delete-task', isAuth, adminController.postDeleteTask);

router.get('/edit-task/:taskId', isAuth, adminController.getEditTask);

router.post('/edit-task/:taskId', isAuth, adminController.postEditTask);

router.get('/user-list', adminController.getUserList);

router.post('/delete-user', adminController.postDeleteUser);

router.get('/edit-user/:userId', adminController.getEditUser);

router.post('/edit-user/:userId', adminController.postEditUser);







module.exports = router;
