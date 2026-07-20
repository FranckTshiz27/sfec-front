import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { KeycloakService } from 'keycloak-angular';
// import { Product } from '../enum/Product';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuth = false;
  isAsking=false
  private loggedIn = new BehaviorSubject<boolean>(false);
  // public  centralsSelectedBranche: Product = Product.AUTOSUR;

  constructor(
    private route: Router,
    private http: HttpClient,
    private servkeycloak: KeycloakService,
  ) {}

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  changeLogged(value: boolean) {
    this.loggedIn.next(value);
  }

  logout() {
    this.loggedIn.next(false);
    this.route.navigate(['/auth']);
  }

  login(user: any) {
    if (user.userName !== '' && user.password != '') {
      this.loggedIn.next(true);
      this.route.navigate(['/']);
    }
  }

  auth(compte: any): Observable<any> {
    return this.http.post<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.USER +
        environment.API.V1.AUTH,
      compte
    );
  }
  authenticate(email: any): Observable<any> {
    return this.http.get<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.USER +
        environment.API.V1.AUTH_BY_EMAIL
    );
  }

  add(user: any): Observable<any> {
    return this.http.post<any>(
      environment.API.URL_BASE +
        environment.API.SUB_RESSOURCE.USER +
        environment.API.V1.ADD,
      user
    );
  }

  isAdmin(): boolean {
    console.log(this.servkeycloak.getKeycloakInstance());
    
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('Admin');
  }
  isClient(): boolean {
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('Client');
  }
  isUSER(): boolean {
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('USER');
  }
  isPartner(): boolean {
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('Partenaire');
  }

  isProducteur(): boolean {
    return this.servkeycloak
      .getKeycloakInstance()
      .hasResourceRole('Producteur');
  }
}
