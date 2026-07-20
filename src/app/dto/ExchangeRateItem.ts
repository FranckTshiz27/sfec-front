export interface ExchangeRateItem {
  id: string;
  rate: number;
  effectiveDate: string;
  source: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateExchangeRatePayload {
  rate: number;
  effectiveDate: string;
  source: string;
  active: boolean;
}

export interface EditExchangeRatePayload extends CreateExchangeRatePayload {
  id: string;
}
