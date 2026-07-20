import { Invoice } from "./Invoice";

export interface InvoiceItem {
  id: string;
  code: string;
  type: string;
  name: string;
  price: number;
  quantity: number;
  taxGroup: string;
  taxSpecificValue: string;
  taxSpecificAmount: number;
  originalPrice: number;
  priceModification: string;
  invoice?: Invoice; // Optionnel si parfois présent
}