import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreateEntreprisePayload,
  EditEntreprisePayload,
  EntrepriseItem,
} from '../dto/EntrepriseItem';

@Injectable({
  providedIn: 'root',
})
export class EntrepriseService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<EntrepriseItem[]> {
    return this.http.get<EntrepriseItem[]>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.ENTREPRISE}`
    );
  }

  add(payload: CreateEntreprisePayload): Observable<EntrepriseItem> {
    return this.http.post<EntrepriseItem>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.ENTREPRISE}`,
      payload
    );
  }

  update(
    id: string,
    payload: EditEntreprisePayload
  ): Observable<EntrepriseItem> {
    return this.http.patch<EntrepriseItem>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.ENTREPRISE}/${id}`,
      payload
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.ENTREPRISE}/${id}`
    );
  }
}
