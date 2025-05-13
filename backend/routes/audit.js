const express = require('express');

const auditController = require('../controllers/audit-controller');
const isAuth = require('../middleware/is-auth');

const auditRouter = express.Router();

auditRouter.get('/audit', isAuth, auditController.getAuditList);

module.exports = auditRouter;
