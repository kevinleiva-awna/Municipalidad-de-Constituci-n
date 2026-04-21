const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');
const { upload } = require('../utils/cloudinary');
const {
  listar, obtener, crear, actualizar, eliminar,
} = require('../controllers/eventos.controller');

const router = express.Router();

router.get('/', listar);
router.get('/:id', obtener);

router.post(
  '/',
  authMiddleware,
  allowRoles('ADMIN', 'FUNCIONARIO'),
  upload.single('imagen'),
  crear,
);

router.put(
  '/:id',
  authMiddleware,
  allowRoles('ADMIN', 'FUNCIONARIO'),
  upload.single('imagen'),
  actualizar,
);

router.delete(
  '/:id',
  authMiddleware,
  allowRoles('ADMIN'),
  eliminar,
);

module.exports = router;
