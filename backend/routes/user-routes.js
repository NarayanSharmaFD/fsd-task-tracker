const express = require('express');

const userController = require('../controllers/user-controller');
const isAuth = require('../middleware/is-auth');

const userRouter = express.Router();


userRouter.post('/user', isAuth, userController.postAddUser);

userRouter.get('/user', isAuth, userController.getAddUser);

userRouter.get('/user-list', isAuth, userController.getUserList);

userRouter.post('/delete-user', isAuth, userController.postDeleteUser);

//userRouter.get('/edit-user/:userId', userController.getEditUser);

userRouter.post('/edit-user/:userId', isAuth, userController.postEditUser);

module.exports = userRouter;
