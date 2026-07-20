export interface EntrepriseItem {
  id: string;
  code: string;
  nif: string;
  nom: string;
}

export interface CreateEntreprisePayload {
  code: string;
  nif: string;
  nom: string;
}

export interface EditEntreprisePayload extends CreateEntreprisePayload {
  id: string;
}
