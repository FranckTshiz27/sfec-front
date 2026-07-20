import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ShopService
{

  constructor(private http: HttpClient)
  {

  }

  // http request
  getAll(): Observable<any>
  {
    return this.http.get<any>(environment.API.URL_BASE + environment.API.SUB_RESSOURCE.SHOP);
  }
  // getAll for Admin user
  getAllForAdminUser(): Observable<any>
  {
    return this.http.get<any>(environment.API.URL_BASE + environment.API.SUB_RESSOURCE.SHOP + environment.API.V1.GET_ALL_FOR_ADMIN_USER);
  }

  getAllSecondaire(): Observable<any>
  {
    return this.http.get<any>(environment.API.URL_BASE + environment.API.SUB_RESSOURCE.SHOP + environment.API.V1.GET_ALL_SECONDARY);
  }
  // getAllPrimary(): Observable<any>
  // {
  //   return this.http.get<any>(environment.API.URL_BASE + environment.API.SUB_RESSOURCE.INTERMEDIAIRE + environment.API.V1.GET_ALL_PRIMARY);
  // }

  get(id: number): Observable<any>
  {
    return this.http.get<any>(environment.API.URL_BASE + environment.API.SUB_RESSOURCE.SHOP + environment.API.V1.GET + id);
  }

  add(obj: any): Observable<any>
  {
    return this.http.post<any>(environment.API.URL_BASE + environment.API.SUB_RESSOURCE.SHOP , obj);
  }

  update(obj: any): Observable<any>
  {
    return this.http.patch<any>(`${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.SHOP}/${obj.id}`, obj);
  }

}
