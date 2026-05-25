const { Router } = require('express');
const {
  getIngredients,
  getIngredientById,
  postIngredient,
  putIngredient,
  deleteIngredient
} = require('../controllers/ingredients.controller');

const routes = Router();

routes.get('/', getIngredients);
routes.get('/:id', getIngredientById);
routes.post('/', postIngredient);
routes.put('/:id', putIngredient);
routes.delete('/:id', deleteIngredient);

module.exports = routes;
