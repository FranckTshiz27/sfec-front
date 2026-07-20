export interface StatusItem {
  id: string; // UUID est représenté comme string en TypeScript
  code: string;
  description: string;
  type: string;
  etat: string;
}