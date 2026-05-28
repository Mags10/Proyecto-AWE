const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const ensureDefaultUsers = require('../src/startup/ensure-default-users');
const Ingredient = require('../src/models/ingredient.model');
const Recipe = require('../src/models/recipe.model');
const ProductionBatch = require('../src/models/production-batch.model');

const API_BASE_URL = process.env.VERIFY_API_BASE_URL || 'http://127.0.0.1:3000/api';
const MARKER = `[verify-role-flows:${new Date().toISOString()}]`;

const CREDENTIALS = {
  admin: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@kitchenflow.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
  },
  kitchen: {
    email: process.env.SEED_KITCHEN_EMAIL || 'cocina@kitchenflow.local',
    password: process.env.SEED_KITCHEN_PASSWORD || 'Cocina123!',
  },
  floor: {
    email: process.env.SEED_FLOOR_EMAIL || 'piso@kitchenflow.local',
    password: process.env.SEED_FLOOR_PASSWORD || 'Piso123!',
  },
};

const roundMoney = (value) => Math.round(value * 100) / 100;

async function connectDatabase() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/monorepo');
  await ensureDefaultUsers();
}

async function requestJson(method, pathname, token, body) {
  const response = await fetch(`${API_BASE_URL}${pathname}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(payload?.message || `${method} ${pathname} failed with ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function expectStatus(expectedStatus, action, label) {
  try {
    await action();
  } catch (error) {
    if (error.status === expectedStatus) {
      console.log(`OK ${label}: respondió ${expectedStatus}`);
      return;
    }

    throw error;
  }

  throw new Error(`${label}: se esperaba status ${expectedStatus} y no ocurrió`);
}

function assertApproxEqual(actual, expected, epsilon, label) {
  if (Math.abs(Number(actual) - Number(expected)) > epsilon) {
    throw new Error(`${label}: esperado ${expected}, recibido ${actual}`);
  }
}

async function loginAll() {
  const [admin, kitchen, floor] = await Promise.all([
    requestJson('POST', '/auth/login', null, CREDENTIALS.admin),
    requestJson('POST', '/auth/login', null, CREDENTIALS.kitchen),
    requestJson('POST', '/auth/login', null, CREDENTIALS.floor),
  ]);

  return {
    admin: admin.accessToken,
    kitchen: kitchen.accessToken,
    floor: floor.accessToken,
  };
}

async function main() {
  const context = {
    ingredientId: null,
    recipeId: null,
    batchIds: [],
    saleId: null,
  };

  try {
    await connectDatabase();
    const tokens = await loginAll();

    console.log(`Verificando roles contra ${API_BASE_URL}`);

    await Promise.all([
      requestJson('GET', '/auth/me', tokens.admin),
      requestJson('GET', '/auth/me', tokens.kitchen),
      requestJson('GET', '/auth/me', tokens.floor),
    ]);
    console.log('OK auth/me para ADMIN, KITCHEN y FLOOR');

    await requestJson('GET', '/users', tokens.admin);
    await expectStatus(403, () => requestJson('GET', '/users', tokens.kitchen), 'KITCHEN no debe listar usuarios');
    await expectStatus(403, () => requestJson('GET', '/users', tokens.floor), 'FLOOR no debe listar usuarios');

    const ingredientName = `${MARKER} Leche QA`;
    const ingredientCreate = await requestJson('POST', '/ingredients', tokens.admin, {
      name: ingredientName,
      unit: 'litro',
      currentStock: 10,
      averageCost: 20,
      minimumStock: 2,
    });

    context.ingredientId = ingredientCreate.ingredient._id;
    console.log(`OK ADMIN creó insumo: ${ingredientName}`);

    await expectStatus(
      403,
      () =>
        requestJson('POST', '/purchase-records', tokens.kitchen, {
          provider: `${MARKER} Proveedor QA`,
          invoiceDate: new Date().toISOString(),
          ingredientId: context.ingredientId,
          quantityReceived: 1,
          totalPrice: 25,
        }),
      'KITCHEN no debe registrar abastecimiento'
    );

    await requestJson('POST', '/purchase-records', tokens.admin, {
      provider: `${MARKER} Proveedor QA`,
      invoiceDate: new Date().toISOString(),
      ingredientId: context.ingredientId,
      quantityReceived: 5,
      totalPrice: 125,
    });

    const ingredientAfterPurchase = await Ingredient.findById(context.ingredientId).lean();
    assertApproxEqual(ingredientAfterPurchase.currentStock, 15, 0.001, 'Stock después de compra');
    assertApproxEqual(ingredientAfterPurchase.averageCost, 21.67, 0.01, 'WAC después de compra');
    console.log('OK ADMIN registró compra y se actualizaron stock + WAC');

    const recipeName = `${MARKER} Latte QA`;
    const recipeCreate = await requestJson('POST', '/recipes', tokens.kitchen, {
      name: recipeName,
      category: 'Bebidas QA',
      salePrice: 60,
      yieldText: '1 vaso',
      notes: `${MARKER} receta de prueba`,
      ingredients: [
        {
          ingredientId: context.ingredientId,
          quantity: 0.5,
        },
      ],
    });

    context.recipeId = recipeCreate.recipe._id;
    console.log(`OK KITCHEN creó receta: ${recipeName}`);

    await expectStatus(
      403,
      () =>
        requestJson('POST', '/recipes', tokens.floor, {
          name: `${MARKER} Receta no permitida`,
          category: 'QA',
          salePrice: 10,
          ingredients: [{ ingredientId: context.ingredientId, quantity: 0.1 }],
        }),
      'FLOOR no debe crear recetas'
    );

    const batchCreate = await requestJson('POST', '/production-batches', tokens.kitchen, {
      recipeId: context.recipeId,
      plannedQuantity: 4,
      notes: `${MARKER} lote completo`,
    });

    context.batchIds.push(batchCreate.productionBatch._id);
    let ingredientAfterReserve = await Ingredient.findById(context.ingredientId).lean();
    assertApproxEqual(ingredientAfterReserve.currentStock, 15, 0.001, 'Stock no debe cambiar al reservar');
    assertApproxEqual(ingredientAfterReserve.reservedStock, 2, 0.001, 'Reserva después de crear lote');
    console.log('OK KITCHEN creó orden de producción y apartó insumos');

    await requestJson('POST', `/production-batches/${context.batchIds[0]}/start`, tokens.kitchen);

    const batchComplete = await requestJson(
      'POST',
      `/production-batches/${context.batchIds[0]}/complete`,
      tokens.kitchen,
      {
        actualProduced: 4,
        actualIngredients: [
          {
            ingredientId: context.ingredientId,
            actualQuantity: 2.2,
          },
        ],
        notes: `${MARKER} lote completo cerrado`,
      }
    );

    ingredientAfterReserve = await Ingredient.findById(context.ingredientId).lean();
    const recipeAfterComplete = await Recipe.findById(context.recipeId).lean();
    const completedBatch = await ProductionBatch.findById(context.batchIds[0]).lean();

    assertApproxEqual(ingredientAfterReserve.currentStock, 12.8, 0.001, 'Stock de insumo después de completar lote');
    assertApproxEqual(ingredientAfterReserve.reservedStock, 0, 0.001, 'Reserva liberada al completar lote');
    assertApproxEqual(recipeAfterComplete.currentStock, 4, 0.001, 'Stock terminado después de producción');
    if (completedBatch.status !== 'COMPLETED') {
      throw new Error(`Lote completado con estado inesperado: ${completedBatch.status}`);
    }
    console.log('OK KITCHEN completó producción y movió stock de insumo -> producto terminado');

    const batchCancel = await requestJson('POST', '/production-batches', tokens.kitchen, {
      recipeId: context.recipeId,
      plannedQuantity: 2,
      notes: `${MARKER} lote cancelado`,
    });

    context.batchIds.push(batchCancel.productionBatch._id);
    let ingredientAfterPending = await Ingredient.findById(context.ingredientId).lean();
    assertApproxEqual(ingredientAfterPending.reservedStock, 1, 0.001, 'Reserva después de lote pendiente para cancelar');

    await requestJson('POST', `/production-batches/${context.batchIds[1]}/cancel`, tokens.kitchen, {
      reason: 'QA cancel',
    });

    ingredientAfterPending = await Ingredient.findById(context.ingredientId).lean();
    assertApproxEqual(ingredientAfterPending.reservedStock, 0, 0.001, 'Reserva liberada al cancelar lote');
    console.log('OK KITCHEN canceló un lote y se liberaron reservas');

    await expectStatus(
      403,
      () =>
        requestJson('POST', '/production-batches', tokens.floor, {
          recipeId: context.recipeId,
          plannedQuantity: 1,
        }),
      'FLOOR no debe producir'
    );

    await expectStatus(403, () => requestJson('GET', '/sales', tokens.kitchen), 'KITCHEN no debe consultar ventas');

    const saleResult = await requestJson('POST', '/sales', tokens.floor, {
      soldAt: new Date().toISOString(),
      notes: `${MARKER} venta QA`,
      items: [
        {
          recipeId: context.recipeId,
          quantity: 3,
        },
      ],
    });

    context.saleId = saleResult.sale._id;
    const recipeAfterSale = await Recipe.findById(context.recipeId).lean();
    assertApproxEqual(recipeAfterSale.currentStock, 1, 0.001, 'Stock terminado después de venta');
    assertApproxEqual(saleResult.sale.totalRevenue, 180, 0.01, 'Ingreso total del ticket');
    assertApproxEqual(saleResult.sale.totalCost, roundMoney(3 * recipeAfterComplete.totalCost), 0.01, 'Costo total del ticket');
    console.log('OK FLOOR registró venta y se descontó stock terminado');

    await expectStatus(403, () => requestJson('GET', '/analytics/dashboard', tokens.floor), 'FLOOR no debe ver dashboard');
    await expectStatus(403, () => requestJson('GET', '/analytics/dashboard', tokens.kitchen), 'KITCHEN no debe ver dashboard');
    await requestJson('GET', '/analytics/dashboard', tokens.admin);
    console.log('OK permisos de dashboard por rol');

    console.log('\nResumen de verificación');
    console.log(`- Insumo QA final: ${ingredientAfterPending.currentStock} L disponibles, ${ingredientAfterPending.reservedStock} L reservados`);
    console.log(`- Receta QA final: ${recipeAfterSale.currentStock} uds en stock terminado`);
    console.log(`- Venta QA total: MXN ${saleResult.sale.totalRevenue.toFixed(2)}`);
    console.log(`- Lote completo: ${batchComplete.productionBatch._id}`);
    console.log(`- Lote cancelado: ${batchCancel.productionBatch._id}`);

    await Ingredient.findByIdAndUpdate(context.ingredientId, { active: false });
    await Recipe.findByIdAndUpdate(context.recipeId, { active: false });
    console.log('OK limpieza ligera: insumo y receta QA se desactivaron para no ensuciar vistas principales');
  } catch (error) {
    console.error('Fallo en la verificación de roles y flujos:');
    console.error(error.message || error);
    if (error.payload) {
      console.error(JSON.stringify(error.payload, null, 2));
    }
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
