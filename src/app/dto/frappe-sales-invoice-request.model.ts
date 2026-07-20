export class FrappeSalesInvoiceRequest {
  id?: string;
  customer?: string;
  customEdefTypeFacture?: string;
  branch?: string;
  customIsTtc?: number;
  paymentTermsTemplate?: string;
  company?: string;
  sellingPriceList?: string;
  requestStatus?: string;
  cle?: string;
  items?: FrappeItem[];
  frappeResponseSalesInvoice?: FrappeResponseSalesInvoice;
  dgiInvoicePayload?: DgiInvoicePayload;
  createdAt?: string; // Java LocalDateTime -> ISO string
  updatedAt?: string; // Java LocalDateTime -> ISO string

  constructor(init?: Partial<FrappeSalesInvoiceRequest>) {
    Object.assign(this, init);
  }

  /**
   * Payload aligné avec les @JsonProperty du backend Java.
   */
  toApiPayload(): Record<string, unknown> {
    return {
      id: this.id,
      customer: this.customer,
      custom_edef_type_facture: this.customEdefTypeFacture,
      branch: this.branch,
      custom_is_ttc: this.customIsTtc,
      payment_terms_template: this.paymentTermsTemplate,
      company: this.company,
      selling_price_list: this.sellingPriceList,
      status: this.requestStatus,
      cle: this.cle,
      items: this.items,
      frappeResponseSalesInvoice: this.frappeResponseSalesInvoice,
      dgiInvoicePayload: this.dgiInvoicePayload,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

export interface FrappeItem {
  id?: string;
  item_code?: string;
  qty?: number;
  rate?: number;
}

export interface FrappeResponseSalesInvoice {
  id?: string;
  name?: string;
  owner?: string;
  creation?: string;
  modified?: string;
  modifiedBy?: string;
  docstatus?: number;
  idx?: number;
  title?: string;
  namingSeries?: string;
  customer?: string;
  customerName?: string;
  company?: string;
  companyTaxId?: string;
  postingDate?: string;
  postingTime?: string;
  dueDate?: string;
  customEdefTypeClient?: string;
  customEdefTypeDescription?: string;
  customEdefTypeFacture?: string;
  customSfe?: string;
  currency?: string;
  sellingPriceList?: string;
  paymentTermsTemplate?: string;
  customerAddress?: string;
  addressDisplay?: string;
  debitTo?: string;
  againstIncomeAccount?: string;
  language?: string;
  status?: string;
  doctype?: string;
  totalQty?: number;
  baseTotal?: number;
  baseNetTotal?: number;
  total?: number;
  netTotal?: number;
  grandTotal?: number;
  outstandingAmount?: number;
  inWords?: string;
  items?: FrappeResponseSalesInvoiceItem[];
  paymentSchedules?: FrappeResponsePaymentSchedule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FrappeResponseSalesInvoiceItem {
  id?: string;
  name?: string;
  owner?: string;
  creation?: string;
  modified?: string;
  modifiedBy?: string;
  docstatus?: number;
  idx?: number;
  itemCode?: string;
  customEdefTypeArticle?: string;
  itemName?: string;
  description?: string;
  itemGroup?: string;
  qty?: number;
  stockUom?: string;
  uom?: string;
  conversionFactor?: number;
  stockQty?: number;
  priceListRate?: number;
  basePriceListRate?: number;
  marginType?: string;
  marginRateOrAmount?: number;
  rate?: number;
  amount?: number;
  customEdefTaxDetail?: string;
  baseRate?: number;
  baseAmount?: number;
  netRate?: number;
  netAmount?: number;
  baseNetRate?: number;
  baseNetAmount?: number;
  incomeAccount?: string;
  expenseAccount?: string;
  costCenter?: string;
  doctype?: string;
  invoice?: FrappeResponseSalesInvoice;
  createdAt?: string;
  updatedAt?: string;
}

export interface FrappeResponsePaymentSchedule {
  id?: string;
  name?: string;
  owner?: string;
  creation?: string;
  modified?: string;
  modifiedBy?: string;
  docstatus?: number;
  idx?: number;
  paymentTerm?: string;
  dueDate?: string;
  invoicePortion?: number;
  modeOfPayment?: string;
  creditDays?: number;
  creditMonths?: number;
  paymentAmount?: number;
  outstanding?: number;
  paidAmount?: number;
  doctype?: string;
  invoice?: FrappeResponseSalesInvoice;
  createdAt?: string;
  updatedAt?: string;
}

export interface DgiInvoicePayload {
  id?: string;
  nif?: string;
  rn?: string;
  mode?: string;
  isf?: string;
  type?: string;
  reference?: string;
  referenceType?: string;
  referenceDesc?: string;
  cmta?: string;
  cmtb?: string;
  cmtc?: string;
  cmtd?: string;
  cmte?: string;
  cmtf?: string;
  cmtg?: string;
  cmth?: string;
  curCode?: string;
  curDate?: string;
  curRate?: number;
  items?: DgiInvoiceItem[];
  client?: DgiInvoiceClient;
  operator?: DgiInvoiceOperator;
  totals?: DgiInvoiceTotals;
  payments?: DgiInvoicePayment[];
  dgiEstimatedResponse?: string;
}

export interface DgiInvoiceItem {
  id?: string;
  code?: string;
  name?: string;
  originalPrice?: number;
  price?: number;
  priceModification?: string;
  quantity?: number;
  taxGroup?: string;
  taxRate?: number;
  taxSpecificAmount?: number;
  taxSpecificValue?: string;
  taxAmount?: number;
  type?: string;
  value?: number;
  invoice?: DgiInvoicePayload;
}

export interface DgiInvoiceClient {
  id?: string;
  nif?: string;
  type?: string;
  typeDesc?: string;
  name?: string;
  contact?: string;
  address?: string;
}

export interface DgiInvoiceOperator {
  id?: string;
  operatorId?: string;
  name?: string;
}

export interface DgiInvoiceTotals {
  id?: string;
  total?: number;
  vtotal?: number;
}

export interface DgiInvoicePayment {
  id?: string;
  name?: string;
  amount?: number;
  curCode?: string;
  curRate?: number;
  invoice?: DgiInvoicePayload;
}
