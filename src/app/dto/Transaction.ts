
import { Client } from "./Client";
import { FinalizeInvoiceResponseData } from "./FinalizeInvoiceResponseData";
import { InvoiceItem } from "./InvoiceItem";
import { InvoiceResponseData } from "./InvoiceResponseData";
import { Operator } from "./Operator";
import { Payment } from "./Payment";
import { ShopItem } from "./ShopItem";

export interface Transaction {
  id: string; // UUID devient string en TypeScript
  nif: string;
  cle: string;
  rn: string;
  mode: string;
  isf: string;
  type: string;
  items: InvoiceItem[];
  client: Client;
  shop: ShopItem;
  operator: Operator;
  payments: Payment[];
  reference: string;
  referenceType: string;
  referenceDesc: string;
  cmtaCmth: string;
  currencyCode: string;
  currencyDate: string; // ou Date selon votre format
  currencyRate: number;
  prime: number;
  createdAt: string; // ou Date selon votre format
  updatedAt: string; // ou Date selon votre format
  invoiceResponseData?: InvoiceResponseData; // transient devient optionnel
  finalizeInvoiceResponseData?: FinalizeInvoiceResponseData; // transient devient optionnel
  status: string;
}



