import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { KeycloakService } from 'keycloak-angular';

import { NzSelectSizeType } from 'ng-zorro-antd/select';
import { IntermediaireItem } from '../interface/IntermediaireItem';
import { IntermediaireService } from 'src/app/services/intermediaire.service';
import { TypeIntermedaire } from 'src/app/enum/typeIntermediaire';
import { ColumnIntermediaireItem } from '../interface/ColumnIntermediaireItem';
import { ShopItem } from 'src/app/dto/ShopItem';
import { ShopService } from 'src/app/services/shop.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
})
export class ShopComponent implements OnInit {
  sizeSearch: 'large' | 'small' | 'default' = 'default';
  validateForm!: FormGroup;
  validateFormUpdate!: FormGroup;
  validateForm_search!: FormGroup;
  listOfData: ShopItem[] = [];
  listOfDataInit: ShopItem[] = [];
  listOfIntermediairePrimary: IntermediaireItem[] = [];
  // types: TypeShop[] = [];
  itemIntermediare?: IntermediaireItem;
  loading = true;
  visible: boolean = false;
  activeAction: boolean = true;
  isVisibleSelectIntermediairesParents: boolean = false;
  isVisibleCodeArca: boolean = false;
  isPrimary: boolean = false;
  isLoadingOne_update: boolean = false;
  isUserAddingMoalVisible: boolean = false;
  name_update?: string = '';
  type_update?: string = '';
  primaire_update?: boolean = false;
  code_update?: string = '';
  codeArcaUpdate?: string = '';
  type_interm_value: string = '';
  editingShop?: ShopItem;
  // isUserAddingMoalVisible = true;
  multipleValue = [];
  size: NzSelectSizeType = 'default';
  isEditing: boolean = false;
  _filter: string = '';

  constructor(
    private fb: FormBuilder,
    private servHttp: ShopService,
    private modalService: NzModalService,
    private message: MessageDialogService,
    private servkeycloak: KeycloakService // private typeService: TypeService
  ) {}

  isLoadingOne = false;

  radioValue: string = '';

  loadOne(): void {
    this.isLoadingOne = true;
  }
  ngOnInit() {
    this.validateForm = this.fb.group({
      nim: [null, [Validators.required]],
      shopName: [null, [Validators.required]],
      adress1: [null, [Validators.required]],
      adress2: [null],
      adress3: [null],
      contact1: [null, [Validators.required]],
      contact2: [null],
      token: [null, [Validators.required]],
    });

    if (this.isAdmin()) {
      this.activeAction = false;
    } else {
      this.activeAction = true;
    }

    this.getAll();
  }

  isAdmin(): boolean {
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('Admin');
  }
  isClient(): boolean {
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('Client');
  }
  iSimple(): boolean {
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('Default');
  }
  isProducteur(): boolean {
    return this.servkeycloak
      .getKeycloakInstance()
      .hasResourceRole('Producteur');
  }

  refreshData(): void {
    this.getAll();
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

  submitFormUpdate(): boolean {
    let isValid: boolean = true;
    if (this.validateFormUpdate.valid) {
      return true;
    } else {
      Object.values(this.validateFormUpdate.controls).forEach((control) => {
        if (control.invalid) {
          isValid = false;
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return isValid;
    }
  }

  resetForm(): void {
    // e.preventDefault();
    this.isEditing = false;
    this.validateForm.reset();
    for (const key in this.validateForm.controls) {
      if (this.validateForm.controls.hasOwnProperty(key)) {
        this.validateForm.controls[key].markAsPristine();
        this.validateForm.controls[key].updateValueAndValidity();
      }
    }
  }

  add() {
    const isValid = this.submitForm();
    if (!isValid) {
      return;
    }

    this.loadOne();

    let obj = {
      nim: this.validateForm.value.nim,
      shopName: this.validateForm.value.shopName,
      adress1: this.validateForm.value.adress1,
      adress2: this.validateForm.value.adress2,
      adress3: this.validateForm.value.adress3,
      contact1: this.validateForm.value.contact1,
      contact2: this.validateForm.value.contact2,
      token: this.validateForm.value.token,
    };

    this.servHttp.add(obj).subscribe(
      (reponse) => {
        if (reponse != null) {
          //reussie

          // Save in local storage
          this.resetForm(); // Reset form
          this.isLoadingOne = false;
          this.message.success(
            'Le point de vente a été créée avec succès',
            'Info enregistrement'
          );

          this.isVisibleSelectIntermediairesParents = false;
          this.isUserAddingMoalVisible = false;

          this.getAll();
        } else {
          this.isLoadingOne = false;
          this.message.error(
            "L'enregistrement du point de vente a échoué. Veuillez contacter l'administrateur.",
            'Info enregistrement'
          );
          if (reponse.result.code === 201 || reponse.result.code === 202) {
          } else if (reponse.result.code === 204) {
          }
        }
      },
      (error) => {
        this.message.error(
          "L'enregistrement du point de vente a échoué. Veuillez contacter l'administrateur.",
          'Info enregistrement'
        );
        this.isLoadingOne = false;
      }
    );
  }

  saveOrUdate() {
    this.isEditing ? this.update() : this.add();
  }
  update() {
    const isValid = this.submitForm();
    if (!isValid) {
      return;
    }

    this.isLoadingOne = true;

    let obj = {
      id: this.editingShop?.id,
      nim: this.validateForm?.get('nim')?.value,
      shopName: this.validateForm?.get('shopName')?.value,
      adress1: this.validateForm?.get('adress1')?.value,
      adress2: this.validateForm?.get('adress2')?.value,
      adress3: this.validateForm?.get('adress3')?.value,
      contact1: this.validateForm?.get('contact1')?.value,
      contact2: this.validateForm?.get('contact2')?.value,
      token: this.validateForm?.get('token')?.value,
    };

    console.log(obj);

    this.servHttp.update(obj).subscribe(
      (reponse) => {
        if (reponse != null) {
          this.message.success(
            'Le point de vente a été mis à jour avec succès',
            'Info enregistrement'
          );

          this.getAll();
          this.isLoadingOne = false;
          this.isUserAddingMoalVisible = false;
        } else {
          this.isLoadingOne = false;
          this.message.error(
            "La mise à jour du point de vente a échoué. Veuillez contacter l'administrateur.",
            'Info enregistrement'
          );
          if (reponse.result.code === 201 || reponse.result.code === 202) {
          } else if (reponse.result.code === 204) {
          }
        }
      },
      (error) => {
        this.message.error(
          "La mise à jour du point de vente n'a pas abouti. Veuillez contacter l'administrateur.",
          'Info enregistrement'
        );
        this.isLoadingOne = false;
      }
    );
  }

  close(e: MouseEvent): void {
    this.visible = false;
    this.resetFormUpdate(e); // Reset form
  }

  resetFormUpdate(e?: MouseEvent): void {
    e?.preventDefault();
    this.validateFormUpdate.reset();
    for (const key in this.validateFormUpdate.controls) {
      if (this.validateFormUpdate.controls.hasOwnProperty(key)) {
        this.validateFormUpdate.controls[key].markAsPristine();
        this.validateFormUpdate.controls[key].updateValueAndValidity();
      }
    }
  }

  getAll() {
    this.listOfData = [];
    this.listOfDataInit = [];
    this.servHttp.getAll().subscribe(
      (reponse) => {
        if (reponse != null) {
          //reussie
          this.listOfData = reponse;
          this.listOfDataInit = reponse;
          this.loading = false;
        } else {
          this.loading = false;
          if (reponse.result.code === 201 || reponse.result.code === 202) {
          } else if (reponse.result.code === 204) {
          }
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  showUserModal(): void {
    this.validateForm.reset();
    this.isEditing = false;
    this.isUserAddingMoalVisible = true;
  }
  showEdtingModal(shop: ShopItem): void {
    this.isEditing = true;
    this.editingShop = { ...shop };
    this.validateForm.patchValue({
      nim: this.editingShop.nim,
      shopName: this.editingShop.shopName,
      adress1: this.editingShop.adress1,
      adress2: this.editingShop.adress2,
      adress3: this.editingShop.adress3,
      contact1: this.editingShop.contact1,
      contact2: this.editingShop.contact2,
      token: this.editingShop.token,
    });
    this.isUserAddingMoalVisible = true;
  }
  handleCancelUserModal(): void {
    this.editingShop = {
      id: '',
      nim: '',
      shopName: '',
      adress1: '',
      adress2: '',
      adress3: '',
      contact1: '',
      contact2: '',
      token: '',
      belongsTo:false,
    };
    this.isUserAddingMoalVisible = false;
  }

  listOfColumns: ColumnIntermediaireItem[] = [
    {
      name: 'Intermédiaire',
      sortOrder: null,
      sortDirections: ['ascend', 'descend', null],
      sortFn: null,
      filterMultiple: false,
      listOfFilter: [],
      filterFn: null,
    },
    {
      name: 'Code',
      sortOrder: null,
      sortDirections: ['ascend', 'descend', null],
      sortFn: null,
      filterMultiple: false,
      listOfFilter: [],
      filterFn: null,
    },

    {
      name: 'Catégorie',
      sortOrder: null,
      sortDirections: ['ascend', 'descend', null],
      sortFn: null,
      filterMultiple: false,
      listOfFilter: [],
      filterFn: null,
    },

    {
      name: 'Action',
      sortOrder: null,
      sortDirections: ['ascend', 'descend', null],
      sortFn: null,
      filterMultiple: false,
      listOfFilter: [],
      filterFn: null,
    },
  ];

  get Filter(): string {
    return this._filter;
  }

  set Filter(value: string) {
    this._filter = value;
    this.getIntermediairesFromName();
  }

  getIntermediairesFromName() {
    this.listOfData = this.listOfDataInit.filter(
      (shop: ShopItem) =>
        shop.shopName.toLowerCase().indexOf(this.Filter.toLowerCase()) != -1 ||
        (shop.nim != null &&
          shop.nim.toLowerCase().indexOf(this.Filter.toLowerCase()) != -1) ||
        (shop.adress1 != null &&
          shop.adress1.toLowerCase().indexOf(this.Filter.toLowerCase()) !=
            -1) ||
        (shop.contact1 != null &&
          shop.contact1.toLowerCase().indexOf(this.Filter.toLowerCase()) != -1)
    );
  }
}
