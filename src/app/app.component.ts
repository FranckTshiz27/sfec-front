import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from './services/user.service';
import { Localstore } from './services/store/local.store';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  username: string = '';
  showEntrepriseSelector = false;
  userEntreprises: any[] = [];
  selectedEntreprise: any = null;
  selectedEntrepriseId: string | null = null;
  @ViewChild('buttonGroup') buttonGroup!: ElementRef;
  dropdownWidth: number = 0;
  constructor(
    private userService: UserService,
    private servkeycloak: KeycloakService,
    public authService: AuthService,
    private router: Router,
  ) { }
  ngOnInit(): void {
    this.username =
      this.servkeycloak.getKeycloakInstance().tokenParsed?.[
      'preferred_username'
      ];
    this.loadUser();
  }
  ngAfterViewInit() {
    this.dropdownWidth = this.buttonGroup.nativeElement.offsetWidth;
  }
  logout(): void {
    Localstore.deleteCompte();
    Localstore.set('USER', '');
    Localstore.set('SELECTED_ENTREPRISE', '');
    this.servkeycloak.getKeycloakInstance().logout();
  }
  loadUser() {
    this.userService.getUser().subscribe(
      (response) => {
        Localstore.set('USER', JSON.stringify(response));
        this.userEntreprises = this.extractUserEntreprises(response);

        if (this.userEntreprises.length === 0) {
          this.showEntrepriseSelector = false;
          this.selectedEntreprise = null;
          this.selectedEntrepriseId = null;
          Localstore.set('SELECTED_ENTREPRISE', '');
          return;
        }

        this.showEntrepriseSelector = true;
        this.selectedEntreprise = null;
        this.selectedEntrepriseId = null;
        Localstore.set('SELECTED_ENTREPRISE', '');

        const firstAccessible = this.userEntreprises.find((item) =>
          this.isEntrepriseAccessible(item)
        );
        if (firstAccessible?.entreprise?.id) {
          this.selectedEntrepriseId = firstAccessible.entreprise.id;
          this.selectedEntreprise = firstAccessible.entreprise;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  selectEntreprise(item: any): void {
    const entreprise = item?.entreprise;
    if (!entreprise?.id || !this.isEntrepriseAccessible(item)) {
      return;
    }
    this.selectedEntrepriseId = entreprise.id;
    this.selectedEntreprise = entreprise;
  }

  continueWithEntreprise(): void {
    if (!this.canContinueWithSelectedEntreprise()) {
      return;
    }

    if (!this.selectedEntreprise || this.selectedEntreprise.id !== this.selectedEntrepriseId) {
      const found = this.userEntreprises.find(
        (item) => item?.entreprise?.id === this.selectedEntrepriseId
      );
      this.selectedEntreprise = found?.entreprise || null;
    }

    if (!this.selectedEntreprise) {
      return;
    }

    Localstore.set(
      'SELECTED_ENTREPRISE',
      JSON.stringify(this.selectedEntreprise)
    );
    this.showEntrepriseSelector = false;
  }

  private extractUserEntreprises(response: any): any[] {
    const entreprises = response?.userEntreprises;
    return Array.isArray(entreprises) ? entreprises : [];
  }

  isEntrepriseAccessible(item: any): boolean {
    return !!item?.isActive;
  }

  canContinueWithSelectedEntreprise(): boolean {
    if (!this.selectedEntrepriseId) {
      return false;
    }
    const selectedAssociation = this.userEntreprises.find(
      (item) => item?.entreprise?.id === this.selectedEntrepriseId
    );
    return this.isEntrepriseAccessible(selectedAssociation);
  }

}
