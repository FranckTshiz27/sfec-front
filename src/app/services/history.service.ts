import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HistoryService {
  constructor(private http: HttpClient) {}

  // http request
  saveHistories(dtos: any[]): Observable<any> {
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.HISTORY}${environment.API.V1.HISTORY_CREATE}`,
      dtos
    );
  }

  getHistories() {
    return this.http.get<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.HISTORY}${environment.API.V1.HISTORIES_LIST}`
    );
  }

  getPagedHistories(size: number, pageIndex: number) {
    return this.http.get<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.HISTORY}${environment.API.V1.HISTORIES_LIST}/${size}/${pageIndex}`
    );
  }

  getPagedHistoriesByPeriod(dto: any, size: number, pageIndex: number) {
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.HISTORY}${environment.API.V1.HISTORIES_LIST_BY_PERIOD}/${size}/${pageIndex}`,
      dto
    );
  }

  getPagedHistoriesByPeriodAndObjectName(dto: any, size: number, pageIndex: number) {
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.HISTORY}${environment.API.V1.HISTORIES_LIST_BY_PERIOD_AND_OBJECT_NAME}/${size}/${pageIndex}`,
      dto
    );
  }

  getPagedHistoriesObjectName(name: any, size: number, pageIndex: number) {
    name = name !== '' ? name : 'undefined';
    return this.http.get<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.HISTORY}${environment.API.V1.HISTORIES_LIST_BY_OBJECT_NAME}/${size}/${pageIndex}/${name}`
    );
  }

  
}
