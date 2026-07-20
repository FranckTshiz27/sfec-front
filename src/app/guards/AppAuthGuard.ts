import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, } from '@angular/router';
import { KeycloakService, KeycloakAuthGuard } from 'keycloak-angular';
import { KeycloakAuthorizationService, KeycloakAuthzAuthGuard, } from 'ngx-keycloak-authz-lib';

@Injectable({
  providedIn: 'root',
})
export class AppAuthGuard extends KeycloakAuthzAuthGuard
{
  constructor(
    protected override router: Router,
    protected override keycloakAngular: KeycloakService,
    protected override keycloakAuth: KeycloakAuthorizationService
  )
  {
    super(router, keycloakAngular, keycloakAuth);
  }
  isAccessAllowed(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean>
  {
    return new Promise(async (resolve, reject) =>
    {
      if (!this.authenticated)
      {
        this.keycloakAngular.login();
        return;
      }
      const requiredRoles = route.data['roles'];
      const requiredPermissions = route.data['permissions'];
      if (!requiredPermissions || requiredPermissions.length === 0)
      {
        return resolve(true);
      } else
      {
        if (!this.permissions || this.permissions.length === 0)
        {
          resolve(false);
        }
        let granted: boolean = false;
        for (const requiredPermission of requiredPermissions)
        {
          if (this.keycloakAuth.checkAuthorization(requiredPermission))
          {
            granted = true;
            break;
          }
        }
        resolve(granted);
      }
    });
  }
}
