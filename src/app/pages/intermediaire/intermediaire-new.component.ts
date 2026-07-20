import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { KeycloakService } from 'keycloak-angular';

import { NzSelectSizeType } from 'ng-zorro-antd/select';
import Swal from 'sweetalert2';
import { IntermediaireService } from 'src/app/services/intermediaire.service';
import { TypeIntermedaire } from 'src/app/enum/typeIntermediaire';
import { ColumnIntermediaireItem } from '../interface/ColumnIntermediaireItem';
import { IntermediaireItem } from 'src/app/dto/IntermediaireItem';

@Component({
  selector: 'app-intermediaire-new',
  templateUrl: './intermediaire-new.component.html',
  styleUrls: ['./intermediaire-new.component.scss'],
})
export class IntermediaireNewComponent implements OnInit {
  sizeSearch: 'large' | 'small' | 'default' = 'default';
  validateForm!: FormGroup;
  validateFormUpdate!: FormGroup;
  validateForm_search!: FormGroup;
  listOfData: IntermediaireItem[] = [];
  listOfDataInit: IntermediaireItem[] = [];
  listOfIntermediairePrimary: IntermediaireItem[] = [];
  listTypeIntermediaire: string[] = [];
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
  editingIntermediary?: IntermediaireItem;
  multipleValue = [];
  size: NzSelectSizeType = 'default';
  isEditing: boolean = false;
  _filter: string = '';

  constructor(
    private fb: FormBuilder,
    private servHttp: IntermediaireService,
    private message: MessageDialogService,
    private servkeycloak: KeycloakService
  ) {}

  isLoadingOne = false;

  radioValue: string = '';

  loadOne(): void {
    this.isLoadingOne = true;
  }
  ngOnInit() {
    this.validateForm = this.fb.group({
      name: [null, [Validators.required]],
      code: [null, [Validators.required]],
      typeInterm: [null, [Validators.required]],
    });

    this.validateFormUpdate = this.fb.group({
      name_update: [null, [Validators.required]],
      code_update: [null, [Validators.required]],
      codeArcaUpdate: [],
    });

    this.validateForm_search = this.fb.group({
      word_search: [null, [Validators.required]],
    });

    if (this.isAdmin()) {
      this.activeAction = false;
    } else {
      this.activeAction = true;
    }

    this.getAll();
    this.loadTypeIntermediaire();
  }

  loadTypeIntermediaire() {
    this.listTypeIntermediaire = [...this.listTypeIntermediaire, 'Banque'];
    this.listTypeIntermediaire = [
      ...this.listTypeIntermediaire,
      'Bureau Direct',
    ];
    this.listTypeIntermediaire = [...this.listTypeIntermediaire, 'Courtier'];
    this.listTypeIntermediaire = [...this.listTypeIntermediaire, 'Client'];
  }

  searchData(form: any): void {
    const word = form.value.word_search;
    this.listOfData = this.listOfDataInit.filter(
      (item) =>
        item.code.toString().toUpperCase().includes(word.toUpperCase()) ||
        item.name.toString().toUpperCase().includes(word.toUpperCase()) ||
        item.intermediaryType
          .toString()
          .toUpperCase()
          .includes(word.toUpperCase())
    );
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

  typeIntermediaireChange(value: any): void {
    switch (value) {
      case 'Banque':
        this.type_interm_value = TypeIntermedaire.BANK;
        this.isVisibleSelectIntermediairesParents = false;
        this.isVisibleCodeArca = true;
        this.isPrimary = true;
        break;
      case 'Bureau Direct':
        this.type_interm_value = TypeIntermedaire.DIRECT_OFFICE;
        this.isVisibleSelectIntermediairesParents = false;
        this.isPrimary = true;
        this.isVisibleCodeArca = true;
        break;
      case 'Courtier':
        this.type_interm_value = TypeIntermedaire.BROKER;
        this.isVisibleSelectIntermediairesParents = false;
        this.isPrimary = true;
        this.isVisibleCodeArca = true;
        break;
      case 'Client':
        this.type_interm_value = TypeIntermedaire.CLIENT;
        this.isVisibleSelectIntermediairesParents = true;
        this.isPrimary = false;
        this.isVisibleCodeArca = false;
        break;

      default:
        break;
    }
  }

  add() {
    const isValid = this.submitForm();
    if (!isValid) {
      return;
    }

    this.loadOne();

    let obj = {
      name: this.validateForm.value.name,
      code: this.validateForm.value.code,
      type: this.type_interm_value,
    };

    console.log(obj);

    this.servHttp.add(obj).subscribe(
      (reponse) => {
        if (reponse != null) {
          //reussie

          // Save in local storage
          this.resetForm(); // Reset form
          this.isLoadingOne = false;
          this.message.success(
            "L'intermédiaire a été créé avec succès.",
            'Info enregistrement'
          );

          this.isVisibleSelectIntermediairesParents = false;

          this.getAll();
        } else {
          this.isLoadingOne = false;
          this.message.error(
            "L'enregistrement de l'intermédiaire a échoué. Veuillez contacter l'administrateur.",
            'Info enregistrement'
          );
          if (reponse.result.code === 201 || reponse.result.code === 202) {
          } else if (reponse.result.code === 204) {
          }
        }
      },
      (error) => {
        this.message.error(
          "L'enregistrement de l'intermédiaire a échoué. Veuillez contacter l'administrateur.",
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
      id: this.editingIntermediary?.id,
      name: this.validateForm?.get('name')?.value,
      code: this.validateForm?.get('code')?.value,
      type: this.validateForm?.get('typeInterm')?.value
    };

    console.log(obj);

    this.servHttp.update(obj).subscribe(
      (reponse) => {
        if (reponse != null) {
          this.message.success(
            "L'intermédiaire a été mis à jour avec succès.",
            'Info enregistrement'
          );

          this.getAll();
          this.isLoadingOne = false;
          this.visible = false;
        } else {
          this.isLoadingOne = false;
          this.message.error(
            "La mise à jour de l'intermédiaire a échoué. Veuillez contacter l'administrateur.",
            'Info enregistrement'
          );
          if (reponse.result.code === 201 || reponse.result.code === 202) {
          } else if (reponse.result.code === 204) {
          }
        }
      },
      (error) => {
        this.message.error(
          "La mise à jour de l'intermédiaire n'a pas abouti. Veuillez contacter l'administrateur.",
          'Info enregistrement'
        );
        this.isLoadingOne = false;
      }
    );
  }

  updateItemDialogue(id: string, e: MouseEvent): void {
    this.resetFormUpdate();
    this.visible = true;
    this.itemIntermediare = this.listOfData.find((item) => item.id == id);
    this.type_update = this.itemIntermediare?.intermediaryType;
    this.name_update = this.itemIntermediare?.name;
    this.code_update = this.itemIntermediare?.code;
    // this.codeArcaUpdate=this.itemIntermediare?.codeArca
    // this.primaire_update = this.itemIntermediare?.primaire;
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
          // this.listOfIntermediairePrimary = this.listOfData.filter(
          //   (item) => item.primaire
          // ); // renvoie les intermédaires
          // Save in local storage
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
  showEdtingModal(intermediary: IntermediaireItem): void {
    this.isEditing = true;
    this.editingIntermediary = { ...intermediary };
    this.validateForm.patchValue({
      name: this.editingIntermediary.name,
      code: this.editingIntermediary.code,
      typeInterm: this.editingIntermediary.intermediaryType,
    });
    this.isUserAddingMoalVisible = true;
  }
  handleCancelUserModal(): void {
    this.editingIntermediary = {
      code: '',
      id: '',
      intermediaryType: '',
      name: ''
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

  clearFilter(): void {
    this._filter = '';
    this.listOfData = [...this.listOfDataInit];
  }

  getIntermediairesFromName() {
    const query = this.normalizeSearchValue(this.Filter);

    if (!query) {
      this.listOfData = [...this.listOfDataInit];
      return;
    }

    this.listOfData = this.listOfDataInit.filter((inter: IntermediaireItem) => {
      const byName = this.normalizeSearchValue(inter.name).includes(query);
      const byCode = this.normalizeSearchValue(inter.code).includes(query);
      const byType = this.normalizeSearchValue(inter.intermediaryType).includes(
        query
      );

      return byName || byCode || byType;
    });
  }

  private normalizeSearchValue(value: unknown): string {
    return `${value ?? ''}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }
}
