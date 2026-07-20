
import { Commune } from "./Commune";
import { Province } from "./Province";

export interface Ville {
    code: string;
    libelle: string;
    createdat: Date;
    updatedat: Date;
    communes: Commune[];
    province?: Province; // Optionnel car JsonIgnore peut l'exclure lors de la sérialisation
  }