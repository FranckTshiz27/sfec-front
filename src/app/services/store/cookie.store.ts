import { Injectable } from '@angular/core';
import {CookieService} from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class Cookiestore {

  constructor(private cookieService: CookieService
    ){
      
    }

  public setCookie (key:string,value:any){
      this.cookieService.set(key, value,{ expires: 2, sameSite: 'Strict', secure:true });
   }

   public  getCookie (key:string):any{
    return this.cookieService.get(key);
  }
   public  deleteCookie (key:string):any{
    this.cookieService.delete(key);
  }
   public  deleteCookieAll ():any{
    this.cookieService.deleteAll();
  }


}
