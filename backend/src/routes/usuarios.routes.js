const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const allowRoles = require('../middleware/roles.middleware');
const {
  listar, crearFuncionario, cambiarRol, desactivar, reactivar,
} = require('../controllers/usuarios.controller');

const router = express.Router();

router.use(authMiddleware, allowRoles('ADMIN'));

router.get('/', listar);
router.post('/', crearFuncionario);
router.put('/:id/rol', cambiarRol);
router.delete('/:id', desactivar);
router.post('/:id/reactivar', reactivar);

module.exports = router;
