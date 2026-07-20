import { Ville } from "./Ville";

export interface Commune {
    code: string;
    libelle: string;
    ville: Ville;
    createdat: Date;
    updatedat: Date;
  }