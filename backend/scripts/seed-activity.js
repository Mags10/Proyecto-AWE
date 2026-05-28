const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const ensureDefaultUsers = require('../src/startup/ensure-default-users');
const Ingredient = require('../src/models/ingredient.model');
const PurchaseRecord = require('../src/models/purchase-record.model');
const Recipe = require('../src/models/recipe.model');
const ProductionBatch = require('../src/models/production-batch.model');
const Sale = require('../src/models/sale.model');

const MARKER = '[seed-activity:v1]';
const DAY_COUNT = 14;

const ADMIN_CREDENTIALS = {
  email: process.env.SEED_ADMIN_EMAIL || 'admin@kitchenflow.local',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
};

const KITCHEN_CREDENTIALS = {
  email: process.env.SEED_KITCHEN_EMAIL || 'cocina@kitchenflow.local',
  password: process.env.SEED_KITCHEN_PASSWORD || 'Cocina123!',
};

const FLOOR_CREDENTIALS = {
  email: process.env.SEED_FLOOR_EMAIL || 'piso@kitchenflow.local',
  password: process.env.SEED_FLOOR_PASSWORD || 'Piso123!',
};

const INGREDIENT_BLUEPRINTS = [
  { name: 'Leche entera', unit: 'litro', currentStock: 6, averageCost: 12.4, minimumStock: 10 },
  { name: 'Espresso blend', unit: 'kilogramo', currentStock: 3, averageCost: 92, minimumStock: 4 },
  { name: 'Jarabe de vainilla', unit: 'mililitro', currentStock: 900, averageCost: 0.19, minimumStock: 600 },
  { name: 'Jarabe de chocolate', unit: 'mililitro', currentStock: 800, averageCost: 0.18, minimumStock: 500 },
  { name: 'Concentrado matcha', unit: 'mililitro', currentStock: 700, averageCost: 0.24, minimumStock: 450 },
  { name: 'Harina de trigo', unit: 'kilogramo', currentStock: 6, averageCost: 31, minimumStock: 5 },
  { name: 'Avena integral', unit: 'kilogramo', currentStock: 4, averageCost: 16, minimumStock: 3 },
  { name: 'Azúcar estándar', unit: 'kilogramo', currentStock: 6, averageCost: 22, minimumStock: 4 },
  { name: 'Mantequilla', unit: 'caja', currentStock: 3, averageCost: 18, minimumStock: 2 },
  { name: 'Huevos', unit: 'caja', currentStock: 3, averageCost: 4, minimumStock: 2 },
  { name: 'Canela molida', unit: 'paquete', currentStock: 2, averageCost: 14, minimumStock: 1 },
  { name: 'Cocoa en polvo', unit: 'kilogramo', currentStock: 2, averageCost: 78, minimumStock: 1 },
];

const RECIPE_BLUEPRINTS = [
  {
    name: 'Cappuccino Barista',
    category: 'Bebidas',
    salePrice: 68,
    yieldText: '1 taza',
    notes: `${MARKER} Receta operativa para simular turno de bebidas.`,
    ingredients: [
      { ingredientName: 'Espresso blend', quantity: 0.018 },
      { ingredientName: 'Leche entera', quantity: 0.18 },
      { ingredientName: 'Azúcar estándar', quantity: 0.005 },
    ],
  },
  {
    name: 'Latte Vainilla 16oz',
    category: 'Bebidas',
    salePrice: 74,
    yieldText: '1 vaso',
    notes: `${MARKER} Receta operativa para simular turno de bebidas.`,
    ingredients: [
      { ingredientName: 'Espresso blend', quantity: 0.018 },
      { ingredientName: 'Leche entera', quantity: 0.24 },
      { ingredientName: 'Jarabe de vainilla', quantity: 25 },
    ],
  },
  {
    name: 'Mocha de la Casa 16oz',
    category: 'Bebidas',
    salePrice: 79,
    yieldText: '1 vaso',
    notes: `${MARKER} Receta operativa para simular turno de bebidas.`,
    ingredients: [
      { ingredientName: 'Espresso blend', quantity: 0.018 },
      { ingredientName: 'Leche entera', quantity: 0.22 },
      { ingredientName: 'Jarabe de chocolate', quantity: 20 },
      { ingredientName: 'Cocoa en polvo', quantity: 0.01 },
    ],
  },
  {
    name: 'Matcha Latte Frío 16oz',
    category: 'Bebidas',
    salePrice: 82,
    yieldText: '1 vaso',
    notes: `${MARKER} Receta operativa para simular turno de bebidas.`,
    ingredients: [
      { ingredientName: 'Leche entera', quantity: 0.22 },
      { ingredientName: 'Concentrado matcha', quantity: 30 },
      { ingredientName: 'Azúcar estándar', quantity: 0.006 },
    ],
  },
  {
    name: 'Rol de Canela de la Casa',
    category: 'Panadería',
    salePrice: 42,
    yieldText: '1 pieza',
    notes: `${MARKER} Receta operativa para simular vitrina de panadería.`,
    ingredients: [
      { ingredientName: 'Harina de trigo', quantity: 0.08 },
      { ingredientName: 'Azúcar estándar', quantity: 0.02 },
      { ingredientName: 'Mantequilla', quantity: 0.03 },
      { ingredientName: 'Huevos', quantity: 0.04 },
      { ingredientName: 'Canela molida', quantity: 0.01 },
    ],
  },
  {
    name: 'Galleta de Avena Artesanal',
    category: 'Panadería',
    salePrice: 28,
    yieldText: '1 pieza',
    notes: `${MARKER} Receta operativa para simular vitrina de panadería.`,
    ingredients: [
      { ingredientName: 'Avena integral', quantity: 0.05 },
      { ingredientName: 'Harina de trigo', quantity: 0.015 },
      { ingredientName: 'Azúcar estándar', quantity: 0.012 },
      { ingredientName: 'Mantequilla', quantity: 0.018 },
      { ingredientName: 'Huevos', quantity: 0.02 },
    ],
  },
];

const PROVIDERS = {
  dairy: `${MARKER} Lácteos del Bajío`,
  coffee: `${MARKER} Café de Especialidad del Centro`,
  bakery: `${MARKER} Insumos Panaderos del Norte`,
  syrups: `${MARKER} Saborizantes MX`,
};

const PURCHASE_SCHEDULE = [
  { ingredientName: 'Leche entera', cadence: 2, baseQuantity: 18, provider: PROVIDERS.dairy },
  { ingredientName: 'Espresso blend', cadence: 3, baseQuantity: 4.5, provider: PROVIDERS.coffee },
  { ingredientName: 'Jarabe de vainilla', cadence: 4, baseQuantity: 1200, provider: PROVIDERS.syrups },
  { ingredientName: 'Jarabe de chocolate', cadence: 5, baseQuantity: 1000, provider: PROVIDERS.syrups },
  { ingredientName: 'Concentrado matcha', cadence: 6, baseQuantity: 900, provider: PROVIDERS.syrups },
  { ingredientName: 'Harina de trigo', cadence: 4, baseQuantity: 6, provider: PROVIDERS.bakery },
  { ingredientName: 'Avena integral', cadence: 6, baseQuantity: 4, provider: PROVIDERS.bakery },
  { ingredientName: 'Azúcar estándar', cadence: 5, baseQuantity: 5, provider: PROVIDERS.bakery },
  { ingredientName: 'Mantequilla', cadence: 6, baseQuantity: 3, provider: PROVIDERS.bakery },
  { ingredientName: 'Huevos', cadence: 5, baseQuantity: 3, provider: PROVIDERS.bakery },
  { ingredientName: 'Canela molida', cadence: 7, baseQuantity: 2, provider: PROVIDERS.bakery },
  { ingredientName: 'Cocoa en polvo', cadence: 7, baseQuantity: 1.5, provider: PROVIDERS.bakery },
];

const RECIPE_ORDER = [
  'Rol de Canela de la Casa',
  'Galleta de Avena Artesanal',
  'Cappuccino Barista',
  'Latte Vainilla 16oz',
  'Mocha de la Casa 16oz',
  'Matcha Latte Frío 16oz',
];

const RECIPE_DEMAND = {
  'Rol de Canela de la Casa': { base: 7, weekendBonus: 2, buffer: 2 },
  'Galleta de Avena Artesanal': { base: 9, weekendBonus: 3, buffer: 2 },
  'Cappuccino Barista': { base: 8, weekendBonus: 1, buffer: 3 },
  'Latte Vainilla 16oz': { base: 10, weekendBonus: 2, buffer: 3 },
  'Mocha de la Casa 16oz': { base: 6, weekendBonus: 1, buffer: 2 },
  'Matcha Latte Frío 16oz': { base: 4, weekendBonus: 1, buffer: 2 },
};

const roundMoney = (value) => Math.round(value * 100) / 100;
const roundQuantity = (value) => Math.round(value * 1000) / 1000;

const cliArgs = new Set(process.argv.slice(2));
const forceMode = cliArgs.has('--force');
const cleanMode = cliArgs.has('--clean') || cliArgs.has('--reset');

function getConnectionString() {
  return process.env.MONGO_URI || 'mongodb://localhost:27017/monorepo';
}

async function connectDatabase() {
  await mongoose.connect(getConnectionString());
  await ensureDefaultUsers();
}

function buildApiCandidates() {
  const provided = process.env.SEED_API_BASE_URL;
  const candidates = [];

  if (provided) {
    candidates.push(provided);
  }

  candidates.push(
    'http://127.0.0.1:3000/api',
    'http://localhost:3000/api',
    'http://127.0.0.1:3010/api',
    'http://localhost:3010/api',
    'http://backend:3000/api'
  );

  return [...new Set(candidates)];
}

async function requestJson(baseUrl, method, pathname, token, body) {
  const response = await fetch(`${baseUrl}${pathname}`, {
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
    const message = payload?.message || `${method} ${pathname} failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    error.baseUrl = baseUrl;
    throw error;
  }

  return payload;
}

async function login(baseUrl, credentials) {
  return requestJson(baseUrl, 'POST', '/auth/login', null, credentials);
}

async function discoverApiBaseUrl() {
  const attempts = [];

  for (const baseUrl of buildApiCandidates()) {
    try {
      await login(baseUrl, ADMIN_CREDENTIALS);
      return baseUrl;
    } catch (error) {
      attempts.push(`${baseUrl}: ${error.message}`);
    }
  }

  throw new Error(
    [
      'No fue posible conectar con la API para ejecutar el seed por endpoints.',
      'Asegúrate de que el backend esté levantado.',
      'Sugerencia local/VPS con Docker: docker compose exec backend npm run seed:activity',
      'Intentos:',
      ...attempts.map((attempt) => `- ${attempt}`),
    ].join('\n')
  );
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function atTime(date, hours, minutes) {
  const copy = new Date(date);
  copy.setHours(hours, minutes, 0, 0);
  return copy;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function calcCadenceQuantity(baseQuantity, dayIndex, seedOffset) {
  const multiplier = 1 + ((dayIndex + seedOffset) % 3) * 0.08;
  return roundQuantity(baseQuantity * multiplier);
}

function calcPurchasePrice(unitCost, quantity, dayIndex, seedOffset) {
  const multiplier = 1.02 + ((dayIndex + seedOffset) % 4) * 0.015;
  return roundMoney(unitCost * quantity * multiplier);
}

function calcDemand(recipeName, date, dayIndex) {
  const config = RECIPE_DEMAND[recipeName];
  const weekendExtra = isWeekend(date) ? config.weekendBonus : 0;
  const wave = (dayIndex + recipeName.length) % 3;
  return Math.max(2, config.base + weekendExtra + wave);
}

function splitInteger(total, weights) {
  const sum = weights.reduce((acc, weight) => acc + weight, 0);
  const raw = weights.map((weight) => (total * weight) / sum);
  const base = raw.map((value) => Math.floor(value));
  let remainder = total - base.reduce((acc, value) => acc + value, 0);

  const ranked = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction);

  for (let idx = 0; idx < ranked.length && remainder > 0; idx += 1) {
    base[ranked[idx].index] += 1;
    remainder -= 1;
  }

  return base;
}

async function backdateDocument(model, id, updates) {
  await model.collection.updateOne(
    { _id: new mongoose.Types.ObjectId(String(id)) },
    { $set: updates }
  );
}

async function ensureNoDuplicateSeed() {
  const [purchaseCount, recipeCount, batchCount, saleCount] = await Promise.all([
    PurchaseRecord.countDocuments({ provider: new RegExp(`^${MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }),
    Recipe.countDocuments({ notes: new RegExp(MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }),
    ProductionBatch.countDocuments({ notes: new RegExp(MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }),
    Sale.countDocuments({ notes: new RegExp(MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }),
  ]);

  const total = purchaseCount + recipeCount + batchCount + saleCount;

  if (total > 0 && !forceMode) {
    throw new Error(
      [
        `Ya existe actividad sembrada con el marcador ${MARKER}.`,
        'Para evitar duplicados, el script se detuvo sin modificar datos.',
        'Si realmente quieres ejecutar otra corrida, usa: npm run seed:activity -- --force o limpia primero con --clean.',
      ].join('\n')
    );
  }
}

async function clearSeededData() {
  await Promise.all([
    PurchaseRecord.deleteMany({}),
    ProductionBatch.deleteMany({}),
    Sale.deleteMany({}),
    Recipe.deleteMany({}),
    Ingredient.deleteMany({}),
  ]);
}

async function fetchCollections(baseUrl, tokens) {
  const [ingredients, recipes] = await Promise.all([
    requestJson(baseUrl, 'GET', '/ingredients?limit=200', tokens.admin),
    requestJson(baseUrl, 'GET', '/recipes?limit=200', tokens.kitchen),
  ]);

  return { ingredients, recipes };
}

async function ensureIngredients(baseUrl, adminToken) {
  const existing = await requestJson(baseUrl, 'GET', '/ingredients?limit=200', adminToken);
  const existingByName = new Map(existing.map((ingredient) => [ingredient.name.toLowerCase(), ingredient]));
  const ingredientMap = new Map();

  for (let index = 0; index < INGREDIENT_BLUEPRINTS.length; index += 1) {
    const blueprint = INGREDIENT_BLUEPRINTS[index];
    let ingredient = existingByName.get(blueprint.name.toLowerCase());

    if (!ingredient) {
      const result = await requestJson(baseUrl, 'POST', '/ingredients', adminToken, blueprint);
      ingredient = result.ingredient;

      const createdAt = atTime(addDays(startOfDay(new Date()), -(DAY_COUNT + 3)), 7, 30 + index);
      await backdateDocument(Ingredient, ingredient._id, {
        createdAt,
        updatedAt: createdAt,
      });
    }

    ingredientMap.set(blueprint.name, ingredient);
  }

  return ingredientMap;
}

async function ensureRecipes(baseUrl, kitchenToken, ingredientMap) {
  const existing = await requestJson(baseUrl, 'GET', '/recipes?limit=200', kitchenToken);
  const existingByName = new Map(existing.map((recipe) => [recipe.name.toLowerCase(), recipe]));
  const recipeMap = new Map();

  for (let index = 0; index < RECIPE_BLUEPRINTS.length; index += 1) {
    const blueprint = RECIPE_BLUEPRINTS[index];
    let recipe = existingByName.get(blueprint.name.toLowerCase());

    if (!recipe) {
      const body = {
        name: blueprint.name,
        category: blueprint.category,
        salePrice: blueprint.salePrice,
        yieldText: blueprint.yieldText,
        notes: blueprint.notes,
        ingredients: blueprint.ingredients.map((item) => ({
          ingredientId: ingredientMap.get(item.ingredientName)._id,
          quantity: item.quantity,
        })),
      };

      const result = await requestJson(baseUrl, 'POST', '/recipes', kitchenToken, body);
      recipe = result.recipe;

      const createdAt = atTime(addDays(startOfDay(new Date()), -(DAY_COUNT + 2)), 10, index * 7);
      await backdateDocument(Recipe, recipe._id, {
        createdAt,
        updatedAt: createdAt,
      });
    }

    recipeMap.set(blueprint.name, recipe);
  }

  return recipeMap;
}

async function createPurchasesForDay(baseUrl, adminToken, ingredientMap, dayDate, dayIndex) {
  const purchaseIds = [];

  for (let index = 0; index < PURCHASE_SCHEDULE.length; index += 1) {
    const schedule = PURCHASE_SCHEDULE[index];

    if (dayIndex % schedule.cadence !== 0) {
      continue;
    }

    const ingredient = ingredientMap.get(schedule.ingredientName);
    const quantityReceived = calcCadenceQuantity(schedule.baseQuantity, dayIndex, index);
    const totalPrice = calcPurchasePrice(
      Number(ingredient.averageCost || 0),
      quantityReceived,
      dayIndex,
      index + 1
    );
    const invoiceDate = atTime(dayDate, 8, 10 + index);

    const result = await requestJson(baseUrl, 'POST', '/purchase-records', adminToken, {
      provider: schedule.provider,
      invoiceDate: invoiceDate.toISOString(),
      ingredientId: ingredient._id,
      quantityReceived,
      totalPrice,
    });

    const purchaseRecord = result.purchaseRecord;
    purchaseIds.push(purchaseRecord._id);

    await backdateDocument(PurchaseRecord, purchaseRecord._id, {
      invoiceDate,
      createdAt: invoiceDate,
      updatedAt: invoiceDate,
    });

    const refreshedIngredient = await Ingredient.findById(ingredient._id).lean();
    ingredientMap.set(schedule.ingredientName, refreshedIngredient);
  }

  return purchaseIds;
}

function buildActualIngredients(plannedIngredients, dayIndex, recipeIndex) {
  return plannedIngredients.map((ingredient, index) => {
    const varianceKey = (dayIndex + recipeIndex + index) % 5;
    const varianceFactor = varianceKey === 0 ? 1.04 : varianceKey === 1 ? 1.02 : 1;

    return {
      ingredientId: ingredient.ingredient,
      actualQuantity: roundQuantity(Number(ingredient.plannedQuantity) * varianceFactor),
    };
  });
}

async function createCompletedProductionForDay(
  baseUrl,
  kitchenToken,
  recipeMap,
  recipeName,
  dayDate,
  dayIndex,
  recipeIndex
) {
  const recipe = recipeMap.get(recipeName);
  const demand = calcDemand(recipeName, dayDate, dayIndex);
  const plannedQuantity = demand + RECIPE_DEMAND[recipeName].buffer;
  const productionCreatedAt = atTime(dayDate, 6 + Math.floor(recipeIndex / 2), 10 + recipeIndex * 11);
  const startAt = new Date(productionCreatedAt.getTime() + 12 * 60000);
  const durationMinutes = 24 + ((dayIndex + recipeIndex) % 4) * 7;
  const completedAt = new Date(startAt.getTime() + durationMinutes * 60000);
  const productionNote = `${MARKER} Turno ${dayIndex + 1} | ${recipeName}`;

  let created;

  try {
    created = await requestJson(baseUrl, 'POST', '/production-batches', kitchenToken, {
      recipeId: recipe._id,
      plannedQuantity,
      notes: productionNote,
    });
  } catch (error) {
    error.message = `${error.message} | receta=${recipeName} | fecha=${dayDate.toISOString().slice(0, 10)} | planeado=${plannedQuantity}`;
    throw error;
  }

  const batch = created.productionBatch;

  await backdateDocument(ProductionBatch, batch._id, {
    createdAt: productionCreatedAt,
    updatedAt: productionCreatedAt,
  });

  await requestJson(baseUrl, 'POST', `/production-batches/${batch._id}/start`, kitchenToken);

  await backdateDocument(ProductionBatch, batch._id, {
    startedAt: startAt,
    updatedAt: startAt,
  });

  const actualProduced =
    plannedQuantity - (((dayIndex + recipeIndex) % 6 === 0 || (dayIndex + recipeIndex) % 11 === 0) ? 1 : 0);
  const actualIngredients = buildActualIngredients(batch.plannedIngredients, dayIndex, recipeIndex);

  await requestJson(baseUrl, 'POST', `/production-batches/${batch._id}/complete`, kitchenToken, {
    actualProduced,
    actualIngredients,
    durationMinutes,
    notes: `${productionNote} | cerrado`,
  });

  await backdateDocument(ProductionBatch, batch._id, {
    createdAt: productionCreatedAt,
    updatedAt: completedAt,
    startedAt: startAt,
    completedAt,
    durationMinutes,
    notes: `${productionNote} | cerrado`,
  });
}

async function createCancelledProduction(baseUrl, kitchenToken, recipeMap, dayDate) {
  const recipe = recipeMap.get('Rol de Canela de la Casa');
  const createdAt = atTime(dayDate, 7, 40);
  const startedAt = new Date(createdAt.getTime() + 9 * 60000);
  const cancelledAt = new Date(startedAt.getTime() + 16 * 60000);
  const note = `${MARKER} Lote cancelado por ajuste de horno`;

  const created = await requestJson(baseUrl, 'POST', '/production-batches', kitchenToken, {
    recipeId: recipe._id,
    plannedQuantity: 6,
    notes: note,
  });

  const batchId = created.productionBatch._id;
  await backdateDocument(ProductionBatch, batchId, {
    createdAt,
    updatedAt: createdAt,
  });

  await requestJson(baseUrl, 'POST', `/production-batches/${batchId}/start`, kitchenToken);

  await backdateDocument(ProductionBatch, batchId, {
    startedAt,
    updatedAt: startedAt,
  });

  await requestJson(baseUrl, 'POST', `/production-batches/${batchId}/cancel`, kitchenToken, {
    reason: 'Ajuste de temperatura y masa fuera de especificación',
  });

  await backdateDocument(ProductionBatch, batchId, {
    createdAt,
    updatedAt: cancelledAt,
    startedAt,
    cancelledAt,
    notes: note,
    cancellationReason: 'Ajuste de temperatura y masa fuera de especificación',
  });
}

async function createInProgressProduction(baseUrl, kitchenToken, recipeMap) {
  const recipe = recipeMap.get('Galleta de Avena Artesanal');
  const createdAt = new Date(Date.now() - 45 * 60000);
  const startedAt = new Date(Date.now() - 28 * 60000);
  const note = `${MARKER} Producción activa de cierre de turno`;

  const created = await requestJson(baseUrl, 'POST', '/production-batches', kitchenToken, {
    recipeId: recipe._id,
    plannedQuantity: 6,
    notes: note,
  });

  const batchId = created.productionBatch._id;

  await backdateDocument(ProductionBatch, batchId, {
    createdAt,
    updatedAt: createdAt,
  });

  await requestJson(baseUrl, 'POST', `/production-batches/${batchId}/start`, kitchenToken);

  await backdateDocument(ProductionBatch, batchId, {
    startedAt,
    updatedAt: startedAt,
    notes: note,
  });
}

function buildTicketPlan(dayDate, dayIndex) {
  const dayDemand = Object.fromEntries(
    RECIPE_ORDER.map((recipeName) => [recipeName, calcDemand(recipeName, dayDate, dayIndex)])
  );

  const ticketTemplates = [
    {
      time: [9, 20],
      lines: [
        ['Cappuccino Barista', [0.4, 0.35, 0.25]],
        ['Latte Vainilla 16oz', [0.35, 0.35, 0.3]],
        ['Rol de Canela de la Casa', [0.5, 0.3, 0.2]],
      ],
    },
    {
      time: [11, 5],
      lines: [
        ['Cappuccino Barista', [0.35, 0.4, 0.25]],
        ['Mocha de la Casa 16oz', [0.45, 0.35, 0.2]],
        ['Galleta de Avena Artesanal', [0.4, 0.35, 0.25]],
      ],
    },
    {
      time: [14, 10],
      lines: [
        ['Latte Vainilla 16oz', [0.35, 0.3, 0.35]],
        ['Mocha de la Casa 16oz', [0.3, 0.35, 0.35]],
        ['Matcha Latte Frío 16oz', [0.3, 0.3, 0.4]],
        ['Rol de Canela de la Casa', [0.3, 0.35, 0.35]],
      ],
    },
    {
      time: [17, 25],
      lines: [
        ['Galleta de Avena Artesanal', [0.35, 0.3, 0.35]],
        ['Matcha Latte Frío 16oz', [0.35, 0.25, 0.4]],
        ['Latte Vainilla 16oz', [0.3, 0.35, 0.35]],
      ],
    },
  ];

  const allocations = new Map();

  for (const [recipeName, total] of Object.entries(dayDemand)) {
    const templateIndexes = [];

    ticketTemplates.forEach((template, index) => {
      if (template.lines.some(([lineRecipe]) => lineRecipe === recipeName)) {
        templateIndexes.push(index);
      }
    });

    const weights = templateIndexes.map((templateIndex) => {
      const template = ticketTemplates[templateIndex];
      const line = template.lines.find(([lineRecipe]) => lineRecipe === recipeName);
      return line ? line[1][dayIndex % line[1].length] : 1;
    });

    const split = splitInteger(total, weights);
    allocations.set(recipeName, { templateIndexes, split });
  }

  return ticketTemplates.map((template, templateIndex) => {
    const items = [];

    for (const [recipeName] of template.lines) {
      const allocation = allocations.get(recipeName);
      const localIndex = allocation.templateIndexes.indexOf(templateIndex);
      if (localIndex === -1) {
        continue;
      }

      const quantity = allocation.split[localIndex];
      if (quantity > 0) {
        items.push({ recipeName, quantity });
      }
    }

    return {
      soldAt: atTime(dayDate, template.time[0], template.time[1]),
      items,
    };
  });
}

async function createSalesForDay(baseUrl, floorToken, recipeMap, dayDate, dayIndex) {
  const tickets = buildTicketPlan(dayDate, dayIndex);

  for (let index = 0; index < tickets.length; index += 1) {
    const ticket = tickets[index];
    if (!ticket.items.length) {
      continue;
    }

    const result = await requestJson(baseUrl, 'POST', '/sales', floorToken, {
      soldAt: ticket.soldAt.toISOString(),
      notes: `${MARKER} Ticket ${dayIndex + 1}-${index + 1}`,
      items: ticket.items.map((item) => ({
        recipeId: recipeMap.get(item.recipeName)._id,
        quantity: item.quantity,
      })),
    });

    await backdateDocument(Sale, result.sale._id, {
      soldAt: ticket.soldAt,
      createdAt: ticket.soldAt,
      updatedAt: ticket.soldAt,
      notes: `${MARKER} Ticket ${dayIndex + 1}-${index + 1}`,
    });
  }
}

async function seedActivity(baseUrl, tokens, recipeMap, ingredientMap) {
  const today = startOfDay(new Date());

  for (let offset = DAY_COUNT - 1; offset >= 0; offset -= 1) {
    const dayDate = addDays(today, -offset);
    const dayIndex = DAY_COUNT - 1 - offset;

    await createPurchasesForDay(baseUrl, tokens.admin, ingredientMap, dayDate, dayIndex);

    for (let recipeIndex = 0; recipeIndex < RECIPE_ORDER.length; recipeIndex += 1) {
      const recipeName = RECIPE_ORDER[recipeIndex];
      await createCompletedProductionForDay(
        baseUrl,
        tokens.kitchen,
        recipeMap,
        recipeName,
        dayDate,
        dayIndex,
        recipeIndex
      );
    }

    if (dayIndex === 4) {
      await createCancelledProduction(baseUrl, tokens.kitchen, recipeMap, dayDate);
    }

    await createSalesForDay(baseUrl, tokens.floor, recipeMap, dayDate, dayIndex);
  }

  await createInProgressProduction(baseUrl, tokens.kitchen, recipeMap);
}

async function refreshMaps(baseUrl, tokens) {
  const { ingredients, recipes } = await fetchCollections(baseUrl, tokens);

  return {
    ingredientMap: new Map(ingredients.map((ingredient) => [ingredient.name, ingredient])),
    recipeMap: new Map(recipes.map((recipe) => [recipe.name, recipe])),
  };
}

async function main() {
  try {
    await connectDatabase();

    if (cleanMode) {
      console.log('Modo limpieza activado: borrando insumos, recetas, compras, producciones y ventas antes del seed...');
      await clearSeededData();
    } else {
      await ensureNoDuplicateSeed();
    }

    const baseUrl = await discoverApiBaseUrl();

    const [adminSession, kitchenSession, floorSession] = await Promise.all([
      login(baseUrl, ADMIN_CREDENTIALS),
      login(baseUrl, KITCHEN_CREDENTIALS),
      login(baseUrl, FLOOR_CREDENTIALS),
    ]);

    const tokens = {
      admin: adminSession.accessToken,
      kitchen: kitchenSession.accessToken,
      floor: floorSession.accessToken,
    };

    const ingredientMap = await ensureIngredients(baseUrl, tokens.admin);
    const recipeMap = await ensureRecipes(baseUrl, tokens.kitchen, ingredientMap);

    await seedActivity(baseUrl, tokens, recipeMap, ingredientMap);

    const refreshed = await refreshMaps(baseUrl, tokens);

    console.log('Seeder de actividad completado.');
    console.log(`API usada: ${baseUrl}`);
    console.log(`Insumos disponibles: ${refreshed.ingredientMap.size}`);
    console.log(`Recetas disponibles: ${refreshed.recipeMap.size}`);
    console.log(
      [
        `Compras sembradas: ${await PurchaseRecord.countDocuments({ provider: new RegExp(`^${MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) })}`,
        `Producciones sembradas: ${await ProductionBatch.countDocuments({ notes: new RegExp(MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })}`,
        `Ventas sembradas: ${await Sale.countDocuments({ notes: new RegExp(MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) })}`,
      ].join('\n')
    );
  } catch (error) {
    console.error('Error ejecutando el seeder de actividad:');
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
