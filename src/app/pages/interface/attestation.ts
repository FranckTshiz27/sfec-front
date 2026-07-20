export interface Attestation {
  id: string; // UUID est représenté comme string en TypeScript
  numero_attestation: string;
  numero_immatriculation: string;
  nature_attestation:string;
  numero_chassis: string;
  date_effet: string;
  date_echeance: string;
  lien_pdf: string;
  lien_image: string;
  lien_qrcode: string;
}