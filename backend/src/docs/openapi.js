const openapiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'KitchenFlow API',
    version: '1.0.0',
    description: 'API para control de insumos, abastecimiento y costo promedio ponderado.'
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor local'
    }
  ],
  tags: [
    {
      name: 'Status',
      description: 'Estado del backend'
    },
    {
      name: 'Ingredients',
      description: 'Inventario de insumos'
    },
    {
      name: 'PurchaseRecords',
      description: 'Registro de compras y recalculo WAC'
    }
  ],
  paths: {
    '/api/status': {
      get: {
        tags: ['Status'],
        summary: 'Obtiene el estado del backend',
        responses: {
          200: {
            description: 'Backend disponible',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/StatusResponse'
                }
              }
            }
          }
        }
      }
    },
    '/api/ingredients': {
      get: {
        tags: ['Ingredients'],
        summary: 'Lista insumos activos',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: false,
            schema: { type: 'string' },
            description: 'Filtro por nombre'
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
            description: 'Cantidad maxima de resultados'
          }
        ],
        responses: {
          200: {
            description: 'Lista de insumos',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Ingredient' }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      },
      post: {
        tags: ['Ingredients'],
        summary: 'Crea un insumo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateIngredientInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Insumo creado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/IngredientMutationResponse' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },
    '/api/ingredients/{id}': {
      get: {
        tags: ['Ingredients'],
        summary: 'Obtiene un insumo por id',
        parameters: [{ $ref: '#/components/parameters/ObjectId' }],
        responses: {
          200: {
            description: 'Insumo encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Ingredient' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      },
      put: {
        tags: ['Ingredients'],
        summary: 'Actualiza un insumo',
        parameters: [{ $ref: '#/components/parameters/ObjectId' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateIngredientInput' }
            }
          }
        },
        responses: {
          200: {
            description: 'Insumo actualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/IngredientMutationResponse' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      },
      delete: {
        tags: ['Ingredients'],
        summary: 'Desactiva un insumo',
        parameters: [{ $ref: '#/components/parameters/ObjectId' }],
        responses: {
          200: {
            description: 'Insumo desactivado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageResponse' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      }
    },
    '/api/purchase-records': {
      get: {
        tags: ['PurchaseRecords'],
        summary: 'Lista compras registradas',
        parameters: [
          {
            name: 'ingredientId',
            in: 'query',
            required: false,
            schema: {
              type: 'string',
              pattern: '^[a-fA-F0-9]{24}$'
            },
            description: 'Filtra compras por insumo'
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
            description: 'Cantidad maxima de resultados'
          }
        ],
        responses: {
          200: {
            description: 'Lista de compras',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/PurchaseRecord' }
                }
              }
            }
          },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      },
      post: {
        tags: ['PurchaseRecords'],
        summary: 'Registra una compra y recalcula WAC',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreatePurchaseRecordInput' }
            }
          }
        },
        responses: {
          201: {
            description: 'Compra registrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PurchaseRecordMutationResponse' }
              }
            }
          },
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { $ref: '#/components/responses/InternalServerError' }
        }
      }
    }
  },
  components: {
    parameters: {
      ObjectId: {
        name: 'id',
        in: 'path',
        required: true,
        schema: {
          type: 'string',
          pattern: '^[a-fA-F0-9]{24}$'
        },
        description: 'ObjectId de MongoDB'
      }
    },
    responses: {
      BadRequest: {
        description: 'Solicitud invalida',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MessageResponse' }
          }
        }
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MessageResponse' }
          }
        }
      },
      InternalServerError: {
        description: 'Error interno del servidor',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MessageResponse' }
          }
        }
      }
    },
    schemas: {
      StatusResponse: {
        type: 'object',
        required: ['status', 'message', 'timestamp'],
        properties: {
          status: { type: 'string', example: 'ok' },
          message: { type: 'string', example: 'Backend is running and connected to MongoDB' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      MessageResponse: {
        type: 'object',
        required: ['message', 'timestamp'],
        properties: {
          message: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      Ingredient: {
        type: 'object',
        required: ['_id', 'name', 'unit', 'currentStock', 'averageCost', 'minimumStock', 'active'],
        properties: {
          _id: { type: 'string', example: '665100000000000000000001' },
          name: { type: 'string', example: 'Leche entera' },
          unit: { type: 'string', example: 'litro' },
          currentStock: { type: 'number', example: 120 },
          averageCost: { type: 'number', example: 11.58 },
          minimumStock: { type: 'number', example: 20 },
          active: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreateIngredientInput: {
        type: 'object',
        required: ['name', 'unit'],
        properties: {
          name: { type: 'string', example: 'Leche entera' },
          unit: { type: 'string', example: 'litro' },
          currentStock: { type: 'number', minimum: 0, default: 0 },
          averageCost: { type: 'number', minimum: 0, default: 0 },
          minimumStock: { type: 'number', minimum: 0, default: 0 }
        }
      },
      IngredientMutationResponse: {
        type: 'object',
        required: ['message', 'ingredient', 'timestamp'],
        properties: {
          message: { type: 'string' },
          ingredient: { $ref: '#/components/schemas/Ingredient' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      },
      PurchaseRecord: {
        type: 'object',
        required: [
          '_id',
          'provider',
          'invoiceDate',
          'ingredient',
          'quantityReceived',
          'totalPrice',
          'unitPrice',
          'previousStock',
          'previousAverageCost',
          'newStock',
          'newAverageCost'
        ],
        properties: {
          _id: { type: 'string', example: '665200000000000000000001' },
          provider: { type: 'string', example: 'Lacteos del Valle' },
          invoiceDate: { type: 'string', format: 'date-time' },
          ingredient: { $ref: '#/components/schemas/Ingredient' },
          quantityReceived: { type: 'number', example: 20 },
          totalPrice: { type: 'number', example: 240 },
          unitPrice: { type: 'number', example: 12 },
          previousStock: { type: 'number', example: 100 },
          previousAverageCost: { type: 'number', example: 11.5 },
          newStock: { type: 'number', example: 120 },
          newAverageCost: { type: 'number', example: 11.58 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      CreatePurchaseRecordInput: {
        type: 'object',
        required: ['provider', 'invoiceDate', 'ingredientId', 'quantityReceived', 'totalPrice'],
        properties: {
          provider: { type: 'string', example: 'Lacteos del Valle' },
          invoiceDate: { type: 'string', format: 'date', example: '2026-05-25' },
          ingredientId: { type: 'string', example: '665100000000000000000001' },
          quantityReceived: { type: 'number', minimum: 0, example: 20 },
          totalPrice: { type: 'number', minimum: 0, example: 240 }
        }
      },
      PurchaseRecordMutationResponse: {
        type: 'object',
        required: ['message', 'purchaseRecord', 'ingredient', 'timestamp'],
        properties: {
          message: { type: 'string' },
          purchaseRecord: { $ref: '#/components/schemas/PurchaseRecord' },
          ingredient: { $ref: '#/components/schemas/Ingredient' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
};

module.exports = openapiDocument;
