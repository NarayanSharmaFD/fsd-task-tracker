const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/roles', isAuth, adminController.postAddRole);

router.get('/roles', isAuth, adminController.getAddRole);

router.post('/statuses', isAuth, adminController.postAddStatus);

router.get('/statuses', isAuth, adminController.getAddStatus);

module.exports = router;
