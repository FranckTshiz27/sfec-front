import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CertificatService {
  constructor(private http: HttpClient) {}

  // http request
  getAll(size: number, pageIndex: number): Observable<any> {
    //
    return this.http.get<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.CERTIFICAT}${environment.API.V1.GET_ALL}/${size}/${pageIndex}`
    );
  }

  getRapport(periodeDTo: any) {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API.V1.GET_RAPPORT}`,
      periodeDTo
    );
  }
  getResponses(): Observable<any> {
    //
    return this.http.get<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES}`
    );
  }

  getResponseByCertificateReference(
    certificateReference: string
  ): Observable<any> {
    return this.http.get<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSE_BY_CERTIFICATE_REFERENCE}${certificateReference}`
    );
  }

  getResponsesByCertificateReferences(
    certificateReferences: any
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES_BY_CERTIFICATE_REFERENCES}`,
      certificateReferences
    );
  }

  getResponsesByCertificateReferencesFromNas(
    certificateReferences: any
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.CERTIFICAT}${environment.API_SNECA.SUB_RESSOURCE.PRINT}`,
      certificateReferences
    );
  }

  getResponsesByPeriode(periode: any): Observable<any> {
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.CERTIFICAT}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES_BY_PERIODE}`,
      periode
    );
  }

  getResponsesByPeriodeAndCodeAssure(periode: any): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSESBYCODEASSURE}`,
      periode
    );
  }

  getResponsesByImmatriculation(immatriculation: string): Observable<any> {
    if (immatriculation === '') immatriculation = 'undefined';

    return this.http.get<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES_BY_RISK_REFERENCE}${immatriculation}`
    );
  }

  getResponsesByImmatriculationAndIntermediaires(dto: any): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSEBYIMMATRICULATIONANDINTERMEDIAIRES}`,
      dto
    );
  }
  getResponsesByImmatriculationAndCodes(dto: any): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSE_BY_IMMATRICULATIONAN_DPARTNERCODES}`,
      dto
    );
  }
  getResponsesByPeriodeAndRiskReference(
    periodeAndReference: any
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES_BY_PERIODE_AND_RISK_REFERENCE}`,
      periodeAndReference
    );
  }
  sendRequestArca(sendCertificateRequest: any): Observable<any> {
    const url =
      environment.API.URL_BASE +
      environment.API.SUB_RESSOURCE.CERTIFICAT +
      environment.API.V1.REQUEST_ARCA;
    return this.http.post<any>(url, sendCertificateRequest);
  }

  cancelCertificateArca(requestDto: any): Observable<any> {
    const url =
      environment.API.URL_BASE +
      environment.API.SUB_RESSOURCE.CERTIFICAT +
      environment.API.V1.REQUEST_ARCA_CANCEL;
    return this.http.post<any>(url, requestDto);
  }

  getRequestArca(envid: string): Observable<any> {
    const url =
      environment.API.URL_BASE +
      environment.API.SUB_RESSOURCE.CERTIFICAT +
      environment.API.V1.RESPONSE_ARCA +
      envid;
    return this.http.get<any>(url);
  }

  getAllByStatus(obj: any): Observable<any> {
    return this.http.get<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.CERTIFICAT +
        environment.API.V1.GET_ALL_BY_STATUS +
        obj
    );
  }

  getAllByDate(param: any): Observable<any> {
    return this.http.post<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.CERTIFICAT +
        environment.API.V1.GET_ALL_BY_DATE,
      param
    );
  }

  getAllByClientAndDate(param: any): Observable<any> {
    return this.http.post<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.CERTIFICAT +
        environment.API.V1.GET_ALL_BY_CLIENT_AND_PERIODE,
      param
    );
  }

  // http request
  getAllByClient(client: any): Observable<any> {
    return this.http.get<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.CERTIFICAT +
        environment.API.V1.GET_ALL_BY_CLIENT +
        client
    );
  }

  get(id: number): Observable<any> {
    return this.http.get<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.CERTIFICAT +
        environment.API.V1.GET +
        id
    );
  }

  add(obj: any): Observable<any> {
    return this.http.post<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.CERTIFICAT +
        environment.API.V1.ADD,
      obj
    );
  }

  getCertificatByInternPoliceAndCertificat(obj: any): Observable<any> {
    return this.http.post<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.CERTIFICAT +
        environment.API.V1.GET_BY_NUMERO_CERTIFICAT,
      obj
    );
  }

  printerCertificat(obj: any): Observable<any> {
    return this.http.post<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.CERTIFICAT +
        environment.API.V1.REPPORT,
      obj,
      { responseType: 'blob' as 'json' }
    );
  }

  getAllByPeriodeAndIntermediaires(
    periodeIntermediaires: any
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES_BY_PERIODE_AND_INTERMEDIAIRES}`,
      periodeIntermediaires
    );
  }

  getAllByPeriodeAndCodes(periodeIntermediaires: any): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES_BY_PERIODE_AND_PARTNERCODES}`,
      periodeIntermediaires
    );
  }

  getAllByPeriodeAndImmatriculationAndIntermediaires(
    periodeImmatriculationIntermediaires: any
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES_BY_PERIODE_AND_IMMATRICULATION_AND_INTERMEDIAIRES}`,
      periodeImmatriculationIntermediaires
    );
  }
  getAllByPeriodeAndImmatriculationAndParnerCodes(
    periodeImmatriculationIntermediaires: any
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES_BY_PERIODE_AND_IMMATRICULATION_AND_PARTNERCODES}`,
      periodeImmatriculationIntermediaires
    );
  }

  getAllByPeriodeAndImmatriculationAndCodeAssure(
    periodeImmatriculationAndCodeAssure: any
  ): Observable<any> {
    return this.http.post<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSES_BY_PERIODE_AND_IMMATRICULATION_AND_CODEASSURE}`,
      periodeImmatriculationAndCodeAssure
    );
  }

  getAllByImmatriculationAndCodeAssure(
    immatriculation: string,
    code: string
  ): Observable<any> {
    const im =
      immatriculation == null ||
      immatriculation == undefined ||
      immatriculation == ''
        ? 'undefined'
        : immatriculation;
    const cd =
      code == null || code == undefined || code == '' ? 'undefined' : code;
    return this.http.get<any>(
      `${environment.API_SNECA.URL_BASE}${environment.API_SNECA.SUB_RESSOURCE.RESPONSE_BY_IMMATRICULATION_AND_CODEASSURE}${im}/${cd}`
    );
  }
}
