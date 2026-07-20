import {
  APP_INITIALIZER,
  CUSTOM_ELEMENTS_SCHEMA,
  isDevMode,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { fr_FR } from 'ng-zorro-antd/i18n';
import { CommonModule, registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { IconsProviderModule } from './icons-provider.module';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { PolicyRiskComponent } from './pages/policy-risk/policy-risk.component';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { UserComponent } from './pages/user/user.component';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ɵNzTransitionPatchModule } from 'ng-zorro-antd/core/transition-patch';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { ReactiveFormsModule } from '@angular/forms';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AuthGuardService } from './guards/AuthGuardService';
import { AuthService } from './services/auth.service';
import { KeycloakService } from 'keycloak-angular';
import { CookieService } from 'ngx-cookie-service';
import { environment } from 'src/environments/environment';
import { KeycloackHttpInterceptorService } from './services/keycloack/keycloack-http-interceptor.service';
import { RiskListComponent } from './pages/risks/risk-list.component';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { IntermediaireNewComponent } from './pages/intermediaire/intermediaire-new.component';
import { villeComponent } from './pages/ville/ville.component';
import { communeComponent } from './pages/commune/commune.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { StatusComponent } from './pages/status/status.component';
import { InvoiceListComponent } from './pages/invoices/invoice-list.component';
import { ShopComponent } from './pages/shop/shop.component';
import { TransactionListDoneComponent } from './pages/transaction/transaction-list-done.component';
import { RapportComponent } from './pages/rapport/rapport.component';
import { ExchangeRateComponent } from './pages/exchange-rate/exchange-rate.component';
import { EntrepriseComponent } from './pages/entreprise/entreprise.component';

registerLocaleData(fr);

function initializeKeycloak(keycloak: KeycloakService) {
  return () => {
    if (isDevMode()) {
      return keycloak.init({
        config: {
          url: environment.keycloakConfig.config.url,
          realm: environment.keycloakConfig.config.realm,
          clientId: environment.keycloakConfig.config.clientId,
        },
        initOptions: {
          onLoad: 'check-sso',
          redirectUri: environment.keycloakConfig.initOptions.redirectUri,
        },
        loadUserProfileAtStartUp:
          environment.keycloakConfig.loadUserProfileAtStartUp,
        enableBearerInterceptor: true,
        bearerExcludedUrls: ['/assets', '/clients/public'],
      });
    } else {
      return keycloak.init({
        config: {
          url: environment.keycloakConfig.config.url,
          realm: environment.keycloakConfig.config.realm,
          clientId: environment.keycloakConfig.config.clientId,
        },
        initOptions: {
          onLoad: 'check-sso',
          redirectUri: environment.keycloakConfig.initOptions.redirectUri,
        },
        loadUserProfileAtStartUp:
          environment.keycloakConfig.loadUserProfileAtStartUp,
      });
    }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    PolicyRiskComponent,
    UserComponent,
    InvoiceListComponent,
    RiskListComponent,
    TransactionListDoneComponent,
    IntermediaireNewComponent,
    villeComponent,
    communeComponent,
    StatusComponent,
    ShopComponent,
    RapportComponent,
    ExchangeRateComponent,
    EntrepriseComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    IconsProviderModule,
    NzLayoutModule,
    NzMenuModule,
    NzBreadCrumbModule,
    NzTableModule,
    NzGridModule,
    ɵNzTransitionPatchModule,
    NzInputModule,
    NzIconModule,
    NzButtonModule,
    NzModalModule,
    ReactiveFormsModule,
    NzDescriptionsModule,
    NzDividerModule,
    NzDrawerModule,
    FontAwesomeModule,
    NzSelectModule,
    NzDropDownModule,
    NzDatePickerModule,
    NzRadioModule,
    CommonModule,
    NzCheckboxModule,
    NzTabsModule,
    NzDropDownModule,
    NzMenuModule,
    NzTagModule,
    NzTableModule,
    NzTableModule,
  ],
  exports: [
    NzTabsModule,
    NzButtonModule,
    // ... exportez pour les autres modules
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    AuthGuardService,
    AuthService,
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloackHttpInterceptorService,
      multi: true,
    },
    CookieService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
