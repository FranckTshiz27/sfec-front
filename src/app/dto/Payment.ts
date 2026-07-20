export interface Payment {
  id: string; // UUID
  name: string;
  amount: number;
  currencyCode: string;
  currencyRate: number;
  createdAt: string; // ou Date si vous préférez
}