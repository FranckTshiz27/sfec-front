import { Ville } from "./Ville";
import { VilleItem } from "./VilleItem";

export interface CommuneItem {
  id: string; // UUID représenté comme string en TypeScript
  code: string;
  valeur: string;
  correspondance: string;
  ville:  VilleItem | null; // Supposant que vous avez aussi une interface Ville
}