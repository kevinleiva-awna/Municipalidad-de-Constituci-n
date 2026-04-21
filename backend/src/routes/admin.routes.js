const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');
const { stats } = require('../controllers/admin.controller');

const router = express.Router();

router.use(authMiddleware, allowRoles('ADMIN'));

router.get('/stats', stats);

module.exports = router;
