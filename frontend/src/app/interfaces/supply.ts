import type { components } from '../api/schema';

export type Ingredient = components['schemas']['Ingredient'];
export type PurchaseRecord = components['schemas']['PurchaseRecord'];
export type CreateIngredientPayload = components['schemas']['CreateIngredientInput'];
export type CreatePurchaseRecordPayload = components['schemas']['CreatePurchaseRecordInput'];

export interface PurchaseDraft {
  provider: string;
  invoiceDate: string;
  ingredientId: string;
  quantityReceived: number;
  totalPrice: number;
}
