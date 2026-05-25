const { Router } = require('express');
const {
  getPurchaseRecords,
  postPurchaseRecord
} = require('../controllers/purchase-records.controller');

const routes = Router();

routes.get('/', getPurchaseRecords);
routes.post('/', postPurchaseRecord);

module.exports = routes;
