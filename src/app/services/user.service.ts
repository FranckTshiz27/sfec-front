import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { User } from '../dto/User';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  // add(obj: any): Observable<any> {
  //   return this.http.post<any>(
  //     `${environment.API.URL_BASE}${environment.API_KEYCLOACK.SUB_RESSOURCE.USER}${environment.API_KEYCLOACK.V1.ADD}`,
  //     obj
  //   );
  // }

  get(): Observable<User[]> {
    return this.http.get<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.USER}${environment.API.V1.GET_ALL}`
    );
  }

  addUserInterms(obj: any): Observable<any> {
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.USER}${environment.API.V1.CREATE_USER_INTERMEDIAIRIES}`,
      obj
    );
  }

  addUserShop(obj: any): Observable<any> {
    return this.http.post<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.USER}${environment.API.V1.CREATE_USER_SHOP}`,
      obj
    );
  }

  getUser(): Observable<any> {
    return this.http.get<any>(
      `${environment.API.URL_BASE}${environment.API.SUB_RESSOURCE.USER}${environment.API.V1.GET_USER_FROM_TOKEN}`
    );
  }
}
