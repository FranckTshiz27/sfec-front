import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  faArrowAltCircleUp,
  faEye,
  faPrint,
} from '@fortawesome/free-solid-svg-icons';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { catchError, Observable, of } from 'rxjs';
import { User } from 'src/app/dto/User';
import { AuthService } from 'src/app/services/auth.service';
import { IntermediaireService } from 'src/app/services/intermediaire.service';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { UserService } from 'src/app/services/user.service';
import { IntermediaireItem } from '../interface/IntermediaireItem';
import { NzSelectSizeType } from 'ng-zorro-antd/select';
import { Localstore } from 'src/app/services/store/local.store';
import { EntrepriseService } from 'src/app/services/entreprise.service';
import { EntrepriseItem } from 'src/app/dto/EntrepriseItem';
import { ShopService } from 'src/app/services/shop.service';
import { ShopItem } from 'src/app/dto/ShopItem';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private userService: UserService,
    private message: MessageDialogService,
    private intermediaryService: IntermediaireService,
    private entrepriseService: EntrepriseService,
    private shopService: ShopService
  ) {}
  validateForm!: FormGroup;
  passwordVisible: boolean = false;
  confirmPasswordVisible: boolean = false;
  users: User[] | [] | undefined;
  filteredusers: User[] | [] | undefined;
  selectedUser?: User;
  roles: String[] | undefined;
  total = 1;
  listOfRandomUser: any[] = [];
  loading = false;
    loadingUsers = false;
  pageSize = 10;
  pageIndex = 1;
  isSaving = false;
  faEye = faEye;
  faPrint = faPrint;
  visible_view = false;
  listOfData: IntermediaireItem[] = [];
  listOfDataInit: IntermediaireItem[] = [];

  entreprises: (EntrepriseItem & { belongsTo?: boolean; isActive?: boolean })[] = [];
  entreprisesInit: (EntrepriseItem & { belongsTo?: boolean; isActive?: boolean })[] = [];
  shops: ShopItem[] = [];
  shopsInit: ShopItem[] = [];
  savigUserInterms: boolean = false;
  faIcon = faArrowAltCircleUp;
  _filter: string = '';
  _filterEntreprise: string = '';
  _filterShop: string = '';
  _filterUser: string = '';
  filterGender = [
    { text: 'male', value: 'male' },
    { text: 'female', value: 'female' },
  ];
  isUserAddingMoalVisible: boolean = false;
  size: NzSelectSizeType = 'default';
  selectedShop?: ShopItem;

  userIntermediairies?: any[];
  ngOnInit(): void {
    this.getUsers();
    this.getEntreprises();
    this.getShops();
    this.loadRoles();
    this.getIntermediaires();
    this.validateForm = this.fb.group({
      email: this.fb.control('', [Validators.email, Validators.required]),
      motDePasse: this.fb.control('', [Validators.required]),
      confirmeMotDePasse: this.fb.control('', [Validators.required]),
      nom: this.fb.control('', [Validators.required]),
      prenom: this.fb.control('', [Validators.required]),
      nomUtilisateur: this.fb.control('', [Validators.required]),
      codeDemandeur: this.fb.control('', [Validators.required]),
      role: this.fb.control('', [Validators.required]),
    });
  }

  showUserModal(): void {
    this.isUserAddingMoalVisible = true;
  }
  handleCancelUserModal(): void {
    this.isUserAddingMoalVisible = false;
  }

  submitForm(): boolean {
    console.log(this.validateForm);

    let isValid: boolean = true;
    if (this.validateForm.valid) {
      return true;
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          isValid = false;
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return isValid;
    }
  }

  // addUser() {
  //   const isValid = this.submitForm();
  //   if (!isValid) {
  //     return;
  //   }

  //   this.isSaving = true;

  //   let obj = {
  //     email: this.validateForm?.get('email')?.value,
  //     password: this.validateForm?.get('motDePasse')?.value,
  //     lastName: this.validateForm.get('prenom')?.value,
  //     firstName: this.validateForm.get('nom')?.value,
  //     username: this.validateForm.get('nomUtilisateur')?.value,
  //     codeDemandeur: this.validateForm.get('codeDemandeur')?.value,
  //     role: this.validateForm.get('role')?.value,
  //   };

  //   this.userService.add(obj).subscribe(
  //     (response) => {
  //       this.isSaving = false;
  //       this.validateForm.reset();
  //       this.message.success(
  //         "L'utilisateur enregistré avec succès",
  //         'Info Enregistrement'
  //       );
  //     },
  //     (error) => {
  //       this.isSaving = false;
  //       this.message.error(
  //         "L'enregistrement de l'utilisateur a échoué, veuillez contacter l'administrateur",
  //         'Echec Enregistrement'
  //       );
  //     }
  //   );
  // }

  getUsers() {
    (this.loadingUsers = true),
      this.userService.get().subscribe(
        (response) => {
          this.users = [...response];
          console.log(this.users);
          this.filteredusers = [...this.users];
          this.loadingUsers = false;
        },
        (error) => {
          console.log(error);
          this.loadingUsers = false;
        }
      );
  }

  loadRoles() {
    this.roles = ['ADMIN', 'USER'];
  }

  closeView(): void {
    this.visible_view = false;
  }
  open(user: User) {
    this.visible_view = true;
    this.selectedUser = { ...user };
    this.selectedShop = this.selectedUser?.userShop?.shop;

    console.log(this.selectedUser);

    this.listOfData = this.listOfData.map((interm) => {
      // console.log(interm);

      interm.belongsTo =
        this.selectedUser?.intermediaries.some(
          (intermUser) => intermUser.id == interm.id
        ) || false;

      return interm;
    });

    this.applyUserEntrepriseAssignments();
    this.applyUserShopAssignment();
  }

  getIntermediaires() {
    this.listOfData = [];
    this.listOfDataInit = [];
    this.intermediaryService.getAll().subscribe(
      (reponse: any) => {
        if (reponse != null) {
          //reussie
          this.listOfData = reponse;
          this.listOfDataInit = reponse;
          this.setBelongsToValue(this.listOfData);
          this.setBelongsToValue(this.listOfDataInit);
          this.loading = false;
        } else {
          this.loading = false;
          if (reponse.result.code === 201 || reponse.result.code === 202) {
          } else if (reponse.result.code === 204) {
          }
        }
      },
      (error: any) => {
        this.loading = false;
      }
    );
  }

  getEntreprises() {
    this.entreprises = [];
    this.entreprisesInit = [];
    this.entrepriseService.getAll().subscribe(
      (reponse) => {
        this.entreprises = (reponse || []).map((item: EntrepriseItem) => ({
          ...item,
          belongsTo: false,
          isActive: false,
        }));
        this.entreprisesInit = [...this.entreprises];
        this.applyUserEntrepriseAssignments();
        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  getShops() {
    this.shops = [];
    this.shopsInit = [];
    this.shopService.getAll().subscribe(
      (reponse) => {
        this.shops = (reponse || []).map((shop: ShopItem) => ({
          ...shop,
          belongsTo: false,
        }));
        this.shopsInit = [...this.shops];
        this.applyUserShopAssignment();
        this.loading = false;
      },
      () => {
        this.loading = false;
      }
    );
  }

  setBelongsToValue(intermediairies: IntermediaireItem[]) {
    this.listOfData = this.listOfData.map((interm) => {
      if (this.userIntermediairies != null)
        this.userIntermediairies?.some((inter) => inter.id == interm.id)
          ? (interm.belongsTo = true)
          : (interm.belongsTo = false);

      return interm;
    });
    this.userIntermediairies;
  }
  get Filter(): string {
    return this._filter;
  }

  get FilterUser(): string {
    return this._filterUser;
  }

  get FilterShop(): string {
    return this._filterShop;
  }

  get FilterEntreprise(): string {
    return this._filterEntreprise;
  }

  set Filter(value: string) {
    this._filter = value;
    this.getIntermediairesFromName();
  }

  set FilterUser(value: string) {
    this._filterUser = value;
    this.getUsersFromNameOrEmail();
  }

  set FilterShop(value: string) {
    this._filterShop = value;
    this.getShopsFromName();
  }

  set FilterEntreprise(value: string) {
    this._filterEntreprise = value;
    this.getEntreprisesFromName();
  }

  // set FilterUser(value: string) {
  //   this._filterUser = value;
  //   this.getUsersFromNameOrEmail();
  // }

  getIntermediairesFromName() {
    this.listOfData = this.listOfDataInit.filter(
      (inter: IntermediaireItem) =>
        inter.name.toLowerCase().indexOf(this.Filter.toLowerCase()) != -1
    );
  }

  getEntreprisesFromName() {
    this.entreprises = this.entreprisesInit.filter(
      (entreprise) =>
        entreprise.nom
          .toLowerCase()
          .indexOf(this.FilterEntreprise.toLowerCase()) != -1 ||
        entreprise.code
          .toLowerCase()
          .indexOf(this.FilterEntreprise.toLowerCase()) != -1 ||
        entreprise.nif
          .toLowerCase()
          .indexOf(this.FilterEntreprise.toLowerCase()) != -1
    );
  }

  getShopsFromName() {
    this.shops = this.shopsInit.filter(
      (shop) =>
        shop.shopName.toLowerCase().indexOf(this.FilterShop.toLowerCase()) !=
          -1 ||
        shop.nim?.toLowerCase().indexOf(this.FilterShop.toLowerCase()) != -1 ||
        shop.adress1?.toLowerCase().indexOf(this.FilterShop.toLowerCase()) != -1
    );
  }

  getUsersFromNameOrEmail() {
    this.filteredusers = this.users?.filter(
      (user: User) =>
        user.fname?.toLowerCase().includes(this.FilterUser.toLowerCase()) ||
        user.lname?.toLowerCase().includes(this.FilterUser.toLowerCase()) ||
        user.keycloakId?.toLowerCase().includes(this.FilterUser.toLowerCase())
    );
  }

  save() {
    this.savigUserInterms = true;
    let selectedInterms = this.listOfData.filter((item) => item.belongsTo);
    const selectedEntreprises = this.entreprises
      .filter((item) => item.belongsTo)
      .map((item) => ({
        idEntreprise: item.id,
        isActive: !!item.isActive,
      }));

    let payload = {
      user: this.selectedUser,
      interms: selectedInterms,
      entreprises: selectedEntreprises,
    };

    console.log(' select ed user ');

    console.log(this.selectedUser);

    if (this.selectedUser)
      this.userService.addUserInterms(payload).subscribe(
        () => {
          this.selectedUser!.intermediaries = [...selectedInterms];
          (this.selectedUser as any).entreprises = [...selectedEntreprises];
          this.filteredusers = this.filteredusers?.map((user) => {
            if (user.keycloakId == this.selectedUser!.keycloakId) {
              user.intermediaries = [...selectedInterms];
              (user as any).entreprises = [...selectedEntreprises];
            }
            return user;
          });
          this.saveShopAfterAssignments();
        },
        () => {
          this.savigUserInterms = false;
          this.message.error("L'affectation a échoué", 'Info affectation');
        }
      );
    else {
      this.savigUserInterms = false;
      this.message.warning(
        "Veuillez d'abord sélectionner un utilisateur.",
        'Avertissement'
      );
    }
  }

  saveAllAssignments(): void {
    this.save();
  }

  onEntrepriseSelectionChange(item: EntrepriseItem & { belongsTo?: boolean; isActive?: boolean }): void {
    if (!item.belongsTo) {
      item.isActive = false;
    }
  }

  onShopRadioSelect(item: ShopItem): void {
    this.shops = this.shops.map((shop) => ({
      ...shop,
      belongsTo: shop.id === item.id,
    }));
    this.shopsInit = this.shopsInit.map((shop) => ({
      ...shop,
      belongsTo: shop.id === item.id,
    }));
    this.selectedShop = item;
  }

  saveShops() {
    this.savigUserInterms = true;
    const payload = {
      user: this.selectedUser,
      shop: this.selectedShop,
    };

    if (this.selectedUser != null && this.selectedShop != undefined) {
      this.userService.addUserShop(payload).subscribe(
        () => {
          this.savigUserInterms = false;
          if (this.selectedUser) {
            (this.selectedUser as any).userShop = {
              ...(this.selectedUser as any).userShop,
              shop: this.selectedShop,
            };
          }
          this.filteredusers = this.filteredusers?.map((user) => {
            if (user.keycloakId == this.selectedUser!.keycloakId) {
              user.userShop = {
                ...(user.userShop || {}),
                shop: this.selectedShop,
              };
            }
            return user;
          });
          this.message.success("L'affectation effectuée", 'Info affectation');
        },
        () => {
          this.savigUserInterms = false;
          this.message.error("L'affectation a échoué", 'Info affectation');
        }
      );
    } else {
      this.savigUserInterms = false;
      this.message.warning(
        'Veuillez sélectionner un point de vente',
        'Avertissement'
      );
    }
  }

  private saveShopAfterAssignments(): void {
    if (!this.selectedUser || !this.selectedShop) {
      this.savigUserInterms = false;
      this.message.success("L'affectation effectuée", 'Info affectation');
      return;
    }

    const payload = {
      user: this.selectedUser,
      shop: this.selectedShop,
    };

    this.userService.addUserShop(payload).subscribe(
      () => {
        this.savigUserInterms = false;
        if (this.selectedUser) {
          (this.selectedUser as any).userShop = {
            ...(this.selectedUser as any).userShop,
            shop: this.selectedShop,
          };
        }
        this.filteredusers = this.filteredusers?.map((user) => {
          if (user.keycloakId == this.selectedUser!.keycloakId) {
            user.userShop = {
              ...(user.userShop || {}),
              shop: this.selectedShop,
            };
          }
          return user;
        });
        this.message.success("L'affectation effectuée", 'Info affectation');
      },
      () => {
        this.savigUserInterms = false;
        this.message.error(
          "L'affectation des intermédiaires/entreprises est faite, mais celle du point de vente a échoué.",
          'Info affectation'
        );
      }
    );
  }

  private applyUserEntrepriseAssignments(): void {
    const associations = this.extractUserEntrepriseAssociations(this.selectedUser);
    const byId = new Map(
      associations.map((assoc) => [assoc.idEntreprise, !!assoc.isActive])
    );

    this.entreprises = this.entreprises.map((entreprise) => {
      const isAssociated = byId.has(entreprise.id);
      return {
        ...entreprise,
        belongsTo: isAssociated,
        isActive: isAssociated ? !!byId.get(entreprise.id) : false,
      };
    });
  }

  private applyUserShopAssignment(): void {
    const selectedShopId = `${this.selectedUser?.userShop?.shop?.id ?? ''}`;
    this.shops = this.shops.map((shop) => ({
      ...shop,
      belongsTo: !!selectedShopId && `${shop.id}` === selectedShopId,
    }));
    this.shopsInit = this.shopsInit.map((shop) => ({
      ...shop,
      belongsTo: !!selectedShopId && `${shop.id}` === selectedShopId,
    }));
    if (selectedShopId) {
      this.selectedShop = this.shops.find((shop) => `${shop.id}` === selectedShopId);
    }
  }

  private extractUserEntrepriseAssociations(
    user: any
  ): Array<{ idEntreprise: string; isActive: boolean }> {
    if (!user) {
      return [];
    }

    const rawAssociations =
      user?.entreprises ??
      user?.entrepriseAssociations ??
      user?.userEntreprises ??
      [];

    if (!Array.isArray(rawAssociations)) {
      return [];
    }

    return rawAssociations
      .map((assoc: any) => {
        const idEntreprise =
          assoc?.idEntreprise ??
          assoc?.entreprise?.id ??
          assoc?.id ??
          '';
        return {
          idEntreprise: `${idEntreprise}`,
          isActive: !!assoc?.isActive,
        };
      })
      .filter((assoc) => !!assoc.idEntreprise);
  }
}
