import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RiskService
{

  constructor(private http: HttpClient)
  {

  }

  // http request
  getRisksByNumPolcy(numPolicy: string,codeint:number,numeave:number): Observable<any>
  {
    return this.http.get<any>(`${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.RISK}${environment.API.V1.RISKS_NUM_POLICY}/${numPolicy}/${codeint}/${numeave}`);
  }
  getRiskByImmatriculation(immatriculation: string): Observable<any>
  {
    return this.http.get<any>(`${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.RISK}${environment.API.V1.RISK_BY_IMMATRICULATION}${immatriculation}`);
  }
  
}
