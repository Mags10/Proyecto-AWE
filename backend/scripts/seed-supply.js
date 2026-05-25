const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const connectDB = require('../src/config/database');
const Ingredient = require('../src/models/ingredient.model');
const PurchaseRecord = require('../src/models/purchase-record.model');

const roundMoney = (value) => Math.round(value * 100) / 100;

const ingredientCatalog = [
  {
    unit: 'litro',
    items: [
      ['Leche entera', 20],
      ['Leche deslactosada', 18],
      ['Leche light', 16],
      ['Crema para batir', 10],
      ['Crema para café', 12],
      ['Half and half', 10],
      ['Leche evaporada', 10],
      ['Leche de almendra', 12],
      ['Leche de avena', 12],
      ['Bebida de soya', 12],
      ['Agua filtrada', 30],
      ['Agua mineral', 24]
    ]
  },
  {
    unit: 'kilogramo',
    items: [
      ['Café arábica', 10],
      ['Espresso blend', 8],
      ['Café descafeinado', 6],
      ['Café molido oscuro', 8],
      ['Té negro', 4],
      ['Té verde', 4],
      ['Matcha', 3],
      ['Azúcar estándar', 15],
      ['Azúcar mascabado', 12],
      ['Harina de trigo', 20],
      ['Harina de repostería', 18],
      ['Cocoa en polvo', 8]
    ]
  },
  {
    unit: 'mililitro',
    items: [
      ['Jarabe de vainilla', 1500],
      ['Jarabe de caramelo', 1500],
      ['Jarabe de avellana', 1200],
      ['Jarabe de chocolate', 1200],
      ['Jarabe de fresa', 1000],
      ['Jarabe de menta', 1000],
      ['Jarabe chai', 1000],
      ['Jarabe maple', 1000],
      ['Extracto de vainilla', 800],
      ['Extracto de almendra', 800],
      ['Concentrado chai', 1000],
      ['Concentrado matcha', 1000]
    ]
  },
  {
    unit: 'caja',
    items: [
      ['Huevos', 6],
      ['Mantequilla', 6],
      ['Queso crema', 6],
      ['Fresas', 6],
      ['Plátano', 8],
      ['Manzana', 8],
      ['Naranja', 8],
      ['Limón', 10],
      ['Mango', 6],
      ['Piña', 4],
      ['Mora azul', 4],
      ['Zarzamora', 4]
    ]
  },
  {
    unit: 'paquete',
    items: [
      ['Avena integral', 8],
      ['Sal refinada', 10],
      ['Canela molida', 4],
      ['Nuez', 4],
      ['Almendra', 4],
      ['Vainilla en vaina', 3],
      ['Chispas de chocolate', 6],
      ['Cocoa nibs', 4],
      ['Té negro en bolsitas', 10],
      ['Té verde en bolsitas', 10],
      ['Café soluble', 6],
      ['Levadura seca', 6]
    ]
  },
  {
    unit: 'pieza',
    items: [
      ['Huevos', 6],
      ['Limones', 12],
      ['Naranjas', 12],
      ['Plátanos', 12],
      ['Mangos', 8],
      ['Fresas', 12],
      ['Manzanas', 12],
      ['Piñas', 6],
      ['Vainilla en vaina', 3],
      ['Canela en rama', 4],
      ['Anís estrella', 3],
      ['Hojas de menta', 8]
    ]
  }
];

const ingredientsSeed = ingredientCatalog.flatMap((group) =>
  group.items.map(([name, minimumStock]) => ({
    name,
    unit: group.unit,
    minimumStock
  }))
);

const purchaseSeed = [
  {
    provider: 'Lácteos del Valle',
    invoiceDate: '2026-05-03',
    ingredientName: 'Leche entera',
    quantityReceived: 50,
    totalPrice: 520
  },
  {
    provider: 'Distribuidora Central',
    invoiceDate: '2026-05-17',
    ingredientName: 'Leche entera',
    quantityReceived: 30,
    totalPrice: 360
  },
  {
    provider: 'Lácteos del Valle',
    invoiceDate: '2026-05-08',
    ingredientName: 'Crema para batir',
    quantityReceived: 24,
    totalPrice: 480
  },
  {
    provider: 'Distribuidora Central',
    invoiceDate: '2026-05-20',
    ingredientName: 'Crema para batir',
    quantityReceived: 18,
    totalPrice: 405
  },
  {
    provider: 'Tostadores del Altiplano',
    invoiceDate: '2026-05-05',
    ingredientName: 'Café arábica',
    quantityReceived: 20,
    totalPrice: 1900
  },
  {
    provider: 'Tostadores del Altiplano',
    invoiceDate: '2026-05-19',
    ingredientName: 'Café arábica',
    quantityReceived: 10,
    totalPrice: 1050
  },
  {
    provider: 'Tostadores del Altiplano',
    invoiceDate: '2026-05-06',
    ingredientName: 'Espresso blend',
    quantityReceived: 18,
    totalPrice: 1710
  },
  {
    provider: 'Mayorista La Dulcería',
    invoiceDate: '2026-05-10',
    ingredientName: 'Azúcar estándar',
    quantityReceived: 40,
    totalPrice: 760
  },
  {
    provider: 'Mayorista La Dulcería',
    invoiceDate: '2026-05-21',
    ingredientName: 'Azúcar mascabado',
    quantityReceived: 36,
    totalPrice: 828
  },
  {
    provider: 'Abarrotes San Miguel',
    invoiceDate: '2026-05-14',
    ingredientName: 'Harina de trigo',
    quantityReceived: 25,
    totalPrice: 675
  },
  {
    provider: 'Abarrotes San Miguel',
    invoiceDate: '2026-05-27',
    ingredientName: 'Harina de repostería',
    quantityReceived: 20,
    totalPrice: 620
  },
  {
    provider: 'Chocolate y Cacao SA',
    invoiceDate: '2026-05-11',
    ingredientName: 'Cocoa en polvo',
    quantityReceived: 12,
    totalPrice: 720
  },
  {
    provider: 'Siropes del Centro',
    invoiceDate: '2026-05-12',
    ingredientName: 'Jarabe de vainilla',
    quantityReceived: 12,
    totalPrice: 2400
  },
  {
    provider: 'Siropes del Centro',
    invoiceDate: '2026-05-24',
    ingredientName: 'Jarabe de caramelo',
    quantityReceived: 10,
    totalPrice: 2100
  },
  {
    provider: 'Frutas del Bajío',
    invoiceDate: '2026-05-08',
    ingredientName: 'Fresas',
    quantityReceived: 6,
    totalPrice: 330
  },
  {
    provider: 'Frutas del Bajío',
    invoiceDate: '2026-05-18',
    ingredientName: 'Plátano',
    quantityReceived: 8,
    totalPrice: 96
  },
  {
    provider: 'Frutas del Bajío',
    invoiceDate: '2026-05-20',
    ingredientName: 'Mango',
    quantityReceived: 6,
    totalPrice: 180
  },
  {
    provider: 'Frutas del Bajío',
    invoiceDate: '2026-05-21',
    ingredientName: 'Limones',
    quantityReceived: 16,
    totalPrice: 160
  },
  {
    provider: 'Frutas del Bajío',
    invoiceDate: '2026-05-23',
    ingredientName: 'Naranjas',
    quantityReceived: 16,
    totalPrice: 192
  },
  {
    provider: 'Frutas del Bajío',
    invoiceDate: '2026-05-25',
    ingredientName: 'Vainilla en vaina',
    quantityReceived: 6,
    totalPrice: 390
  },
  {
    provider: 'Frutas del Bajío',
    invoiceDate: '2026-05-26',
    ingredientName: 'Canela en rama',
    quantityReceived: 8,
    totalPrice: 176
  },
  {
    provider: 'Frutas del Bajío',
    invoiceDate: '2026-05-27',
    ingredientName: 'Anís estrella',
    quantityReceived: 4,
    totalPrice: 120
  },
  {
    provider: 'Frutas del Bajío',
    invoiceDate: '2026-05-28',
    ingredientName: 'Hojas de menta',
    quantityReceived: 20,
    totalPrice: 180
  }
];

function getIngredientPurchaseHistory(name) {
  return purchaseSeed.filter((purchase) => purchase.ingredientName === name);
}

async function applyPurchase(ingredient, purchaseInput) {
  const previousStock = ingredient.currentStock || 0;
  const previousAverageCost = ingredient.averageCost || 0;
  const unitPrice = roundMoney(purchaseInput.totalPrice / purchaseInput.quantityReceived);
  const newStock = previousStock + purchaseInput.quantityReceived;
  const newAverageCost = roundMoney(
    ((previousStock * previousAverageCost) + (purchaseInput.quantityReceived * unitPrice)) / newStock
  );

  const purchaseRecord = new PurchaseRecord({
    provider: purchaseInput.provider,
    invoiceDate: purchaseInput.invoiceDate,
    ingredient: ingredient._id,
    quantityReceived: purchaseInput.quantityReceived,
    totalPrice: purchaseInput.totalPrice,
    unitPrice,
    previousStock,
    previousAverageCost,
    newStock,
    newAverageCost
  });

  ingredient.currentStock = newStock;
  ingredient.averageCost = newAverageCost;

  await ingredient.save();
  await purchaseRecord.save();
}

async function main() {
  await connectDB();

  const connection = mongoose.connection;
  if (connection.readyState !== 1) {
    await new Promise((resolve, reject) => {
      connection.once('connected', resolve);
      connection.once('error', reject);
    });
  }

  await PurchaseRecord.deleteMany({});
  await Ingredient.deleteMany({});

  const createdIngredients = await Ingredient.insertMany(
    ingredientsSeed.map((ingredient) => ({
      ...ingredient,
      currentStock: 0,
      averageCost: 0,
      active: true
    }))
  );

  const ingredientMap = new Map(createdIngredients.map((ingredient) => [ingredient.name, ingredient]));

  for (const ingredientName of ingredientMap.keys()) {
    const ingredient = ingredientMap.get(ingredientName);
    const purchases = getIngredientPurchaseHistory(ingredientName);

    for (const purchaseInput of purchases) {
      await applyPurchase(ingredient, purchaseInput);
    }
  }

  console.log('Seeding de insumos y compras completado con éxito.');
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Error ejecutando el seeder de abastecimiento:');
  console.error(error);

  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error('No se pudo cerrar la conexión a MongoDB:');
    console.error(disconnectError);
  }

  process.exit(1);
});