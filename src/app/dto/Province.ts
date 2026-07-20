import { Ville } from "./Ville";

export interface Province {
    code: string;
    libelle: string;
    villes: Ville[];
    createdat: Date;
    updatedat: Date;
  }
  