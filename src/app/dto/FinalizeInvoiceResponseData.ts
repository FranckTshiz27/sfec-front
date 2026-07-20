export interface FinalizeInvoiceResponseData {
  id: string; // UUID en string pour Angular
  dateTime: string;
  qrCode: string;
  codeDEFDGI: string;
  counters: string;
  nim: string;
//   invoice?: Invoice; // Optionnel car @JsonIgnore dans l'entité
}