import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { TypeCodification } from '../dto/TypeCodification';


@Injectable({
  providedIn: 'root'
})
export class TypeService
{

  constructor(private http: HttpClient)
  {

  }

  // http request
  // getAll(): Observable<TypeCodification>
  // {
    // return this.http.get<any>(environment.API.URL_BASE + environment.API.SUB_RESSOURCE.TYPE);
  // }
  
}
