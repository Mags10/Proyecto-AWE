const { Router } = require('express');
const { getUsers, postUser, putUser, resetUserPassword } = require('../controllers/users.controller');
const { ROLES, requireAuth, requireRoles } = require('../middlewares/auth.middleware');

const routes = Router();

routes.get('/', requireAuth, requireRoles(ROLES.ADMIN), getUsers);
routes.post('/', requireAuth, requireRoles(ROLES.ADMIN), postUser);
routes.put('/:id', requireAuth, requireRoles(ROLES.ADMIN), putUser);
routes.post('/:id/reset-password', requireAuth, requireRoles(ROLES.ADMIN), resetUserPassword);

module.exports = routes;
