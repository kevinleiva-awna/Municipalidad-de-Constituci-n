const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');
const {
  suscribir, listar, desactivar, exportarCSV,
} = require('../controllers/newsletter.controller');

const router = express.Router();
const adminRouter = express.Router();

// Público
router.post('/suscribir', suscribir);

// Admin
adminRouter.use(authMiddleware, allowRoles('ADMIN'));
adminRouter.get('/', listar);
adminRouter.get('/exportar', exportarCSV);
adminRouter.delete('/:id', desactivar);

module.exports = { router, adminRouter };
