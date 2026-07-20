import { SfecCertificationResponse } from './SfecCertificationResponse';

export interface Invoice {
  cle: string;
  codeInte?: number;
  numePoli?: number;
  numeAven?: number;
  rn?: string;
  modeFacture?: string;
  dateEncaissement: string; // Format: ISO string ou timestamp
  typeFacture?: string;
  codeArticle?: number;
  typeArticle?: string;
  nameArticle?: string;
  price?: number;
  quantity?: number;
  taxeGroup?: string;
  taxSpecificValue?: number;
  taxSpecificAmount?: number;
  originalPrice?: number;
  priceModification?: number;
  nif?: string;
  nom?: string;
  contact?: string;
  adresse?: string;
  genRassu: string;
  idUser?: string;
  nomUser?: string;
  typePaiement?: string;
  amount?: number;
  currencyCode?: string;
  prime: number;
  tva: number;
  status: string;
  sfec_response?: SfecCertificationResponse;
}
