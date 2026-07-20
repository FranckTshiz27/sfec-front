import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class KeycloackHttpInterceptorService implements HttpInterceptor {
  constructor(private keycloak: KeycloakService) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token: any = this.keycloak.getKeycloakInstance().token;

    if (!this.keycloak.isLoggedIn()) return next.handle(req);

    // if (req.responseType === 'blob') {
    //   return next.handle(req);
    // }

    let request = req.clone({
      setHeaders: { Authorization: 'Bearer ' + token },
    });

    return next.handle(request);
  }
}
