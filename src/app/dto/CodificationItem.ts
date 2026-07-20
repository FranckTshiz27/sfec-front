export interface CodificationItem {
  id: string; // UUID est représenté comme string en TypeScript
  code: string;
  description: string;
  type: string;
  etat: string;
  correspondance:String;
  libelleType:string
}