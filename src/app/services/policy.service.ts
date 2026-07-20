import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PolicyService {
  constructor(private http: HttpClient) {}

  pageSize: number = 0;
  pageIndex: number = 0;
  policyFilterText: string = '';
  selectedPolicy: any;
  isPolicySelected: boolean = true;

  // http request
  getAll(): Observable<any> {
    return this.http.get<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.GET_ALL}`
    );
  }

  getPoliciesByNumPolcy(
    codeint: number,
    numeave: number,
    policynumber:string
  ): Observable<any> {

    return !policynumber
      ? this.http.get<any>(
          `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.POLICIES_NUM_POLICY}/undefined/${codeint}/${numeave}`
        )
      : this.http.get<any>(
          `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.POLICIES_NUM_POLICY}/${policynumber}/${codeint}/${numeave}`
        );
  }
  getPolicyByNumPolcyAndCodeIntAndNumAve(
    numPolicy: string,
    codeInt: string,
    numeave: number
  ): Observable<any> {
    let num = numPolicy ? numPolicy : 'undefined';
    let code = codeInt ? codeInt : 'undefined';
    return this.http.get<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.POLICY_NUM_POLICY_CODE_INT_NUM_AVE}${num}/${code}/${numeave}`
    );
  }
  getPoliciesByCodeAssure(
    itemsPerPage: number,
    currentPage: number
  ): Observable<any> {
    return this.http.get<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.POLICIES_CODE_ASSURE}/${itemsPerPage}/${currentPage}`
    );
  }
  getAllByCodes(
    itemsPerPage: number,
    currentPage: number,
    codes: any[]
  ): Observable<any> {
    const dto = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage,
      codes,
    };
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.GET_ALL_FROM_INTERMEDIAIRES}`,
      dto
    );
  }
  getAllByPartnerCodes(
    itemsPerPage: number,
    currentPage: number,
    codes: any[]
  ): Observable<any> {
    const dto = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage,
      codes,
    };
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.GET_ALL_FROM_PARTNER_CODES}`,
      dto
    );
  }
  getAllByPartnerCodesAndNumPolicy(
    itemsPerPage: number,
    currentPage: number,
    codes: any[],
    numPolicy: string,
    codeint: number
  ): Observable<any> {
    const dto = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage,
      codes,
      numPolicy,
      codeint: codeint,
    };
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.GET_ALL_FROM_PARTNER_CODES_AND_NUMPOLICY}`,
      dto
    );
  }
  getAllByCodesAndNumPolicy(
    itemsPerPage: number,
    currentPage: number,
    codes: any[],
    numPolicy: string,
    codeint: number,
    numeave: number
  ): Observable<any> {
    const dto = {
      itemsPerPage: itemsPerPage,
      currentPage: currentPage,
      codes,
      numPolicy,
      codeint: codeint,
      numeave,
    };

    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.GET_ALL_FROM_INTERMEDIAIRES_AND_NUMPOLICY}`,
      dto
    );
  }
 

  getPoliciesByNumPolIcyAndCodeAssure(
    itemsPerPage: number,
    currentPage: number,
    numPolicy: string,
    code_interm: number,
    numeave: number
  ): Observable<any> {
    return !numPolicy
      ? this.http.get<any>(
          `${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.GET_ALL_FROM_CODE_ASSURE_AND_NUMPOLICY}/${itemsPerPage}/${currentPage}/undefined`
        )
      : this.http.get<any>(
          `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.POLICY}${environment.API.V1.GET_ALL_FROM_CODE_ASSURE_AND_NUMPOLICY}/${itemsPerPage}/${currentPage}/${numPolicy}/${code_interm}/${numeave}`
        );
  }
}
