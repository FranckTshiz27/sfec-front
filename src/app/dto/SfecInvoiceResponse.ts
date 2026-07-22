export interface SfecAdditionalTax {
  tax_code?: string;
  tax_label?: string;
  tax_amount?: number;
  tax_rate?: number;
}

export interface SfecInvoiceItem {
  designation?: string;
  classification_code?: string;
  type?: string;
  unit_price?: number;
  quantity?: number;
  subtotal?: number;
  discount_amount?: number;
  discount_type?: string;
  net_amount?: number;
  tax_rate?: string;
  tax_amount?: number;
  total_amount?: number;
}

export interface SfecInvoiceResponse {
  id?: string;
  invoice_id?: string;
  taxpayer_niu?: string;
  invoice_type?: string;
  invoice_subject?: string;
  invoice_due_date?: string;
  reference_invoice_id?: string;
  sciet?: string;
  terminal_identifier?: string;
  subtotal?: number;
  total_tax_t_amount?: number;
  total_tax_r_amount?: number;
  total_exempt_amount?: number;
  total_tax_amount?: number;
  discount_amount?: number;
  amount_due?: number;
  total_line_discount_amount?: number;
  additional_cent_tax?: number;
  electronic_stamp_duty?: number;
  total_amount?: number;
  currency?: string;
  recipient_type?: string;
  recipient_name?: string;
  recipient_niu?: string;
  recipient_rccm?: string;
  recipient_address?: string;
  recipient_phone?: string;
  recipient_email?: string;
  is_recipient_taxable?: boolean;
  payment_method?: string;
  payment_reference?: string;
  payment_date?: string;
  notes?: string;
  additional_taxes?: SfecAdditionalTax[];
  items?: SfecInvoiceItem[];
  status?: string;
  intermediary_code?: number;
  certification_number?: string;
  signature?: string;
  short_signature?: string;
  qr_code?: string;
  certification_date?: string;
  invoice_number?: string;
  identifier?: string;
  created_at?: string;
}
