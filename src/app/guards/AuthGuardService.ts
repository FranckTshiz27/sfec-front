import { Injectable } from '@angular/core';
import
{
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Localstore } from '../services/store/local.store';


@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate
{
  constructor(private router: Router, private authService: AuthService) { }

  canActivate(_next: ActivatedRouteSnapshot, _state: RouterStateSnapshot): Observable<boolean>
  {
    return this.authService.isLoggedIn.pipe(
      take(1),
      map((isLoggedIn: Boolean) =>
      {
        if (!isLoggedIn)
        {
          const compte: any = Localstore.getCompte('COMPTE');
          if (compte === '' || compte === undefined)
          {
            this.router.navigate(['/auth']);
            return false;
          }
        }
        return true;
      })
    );
  }
}
