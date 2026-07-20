import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreateExchangeRatePayload,
  EditExchangeRatePayload,
  ExchangeRateItem,
} from '../dto/ExchangeRateItem';

@Injectable({
  providedIn: 'root',
})
export class ExchangeRateService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<ExchangeRateItem[]> {
    return this.http.get<ExchangeRateItem[]>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.EXCHANGE_RATE}`
    );
  }

  getActive(): Observable<ExchangeRateItem[]> {
    return this.http.get<ExchangeRateItem[]>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.EXCHANGE_RATE}/active`
    );
  }

  add(payload: CreateExchangeRatePayload): Observable<ExchangeRateItem> {
    return this.http.post<ExchangeRateItem>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.EXCHANGE_RATE}`,
      payload
    );
  }

  update(
    id: string,
    payload: EditExchangeRatePayload
  ): Observable<ExchangeRateItem> {
    return this.http.patch<ExchangeRateItem>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.EXCHANGE_RATE}/${id}`,
      payload
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.EXCHANGE_RATE}/${id}`
    );
  }
}
