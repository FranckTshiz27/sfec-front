import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { FrappeSalesInvoiceRequest } from '../dto/frappe-sales-invoice-request.model';

@Injectable({
  providedIn: 'root',
})
export class FrappeSalesInvoiceRequestService {
  private readonly baseUri = `${environment.API.URL_BASE}/frappe-sales-invoice-request`;

  constructor(private http: HttpClient) {}

  getByCleAndStatus(
    cle: string,
    status: string
  ): Observable<FrappeSalesInvoiceRequest> {
    const params = new HttpParams().set('cle', cle).set('status', status);

    return this.http.get<FrappeSalesInvoiceRequest>(
      `${this.baseUri}/by-cle-and-status`,
      { params }
    );
  }

  getByCleWithStatusOne(cle: string): Observable<FrappeSalesInvoiceRequest> {
    return this.http.get<FrappeSalesInvoiceRequest>(
      `${this.baseUri}/by-cle-status-one/${cle}`
    );
  }

  getByCreatedPeriod(
    dateDebut: string,
    dateFin: string
  ): Observable<FrappeSalesInvoiceRequest[]> {
    const params = new HttpParams().set('dateDebut', dateDebut).set('dateFin', dateFin);
    return this.http.get<FrappeSalesInvoiceRequest[]>(`${this.baseUri}/by-created-period`, {
      params,
    });
  }
}
