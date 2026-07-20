import { Attestation } from "./attestation";
import { Demande } from "./Demande";

export interface RequestApag {
  id: string;
  demandes: Demande[];
  numeroDemande: string;
  referenceDemande:string;
  codeDemandeur: string;
  codeIntermediaire: string;
  codeCompagnie: string;
  codeAcces: string;
  pointDeVente: string;
  bureau: string;
  statut: string;
  errormMessage:string;
  typeAttestation:string;
}