import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { KeycloakService } from 'keycloak-angular';

import { NzSelectSizeType } from 'ng-zorro-antd/select';
import { VilleItem } from 'src/app/dto/VilleItem';
import { VilleService } from 'src/app/services/ville.service';
import { IntermediaireItem } from 'src/app/dto/IntermediaireItem';


@Component({
  selector: 'app-ville',
  templateUrl: './ville.component.html',
  styleUrls: ['./ville.component.scss'],
})
export class villeComponent implements OnInit {
  sizeSearch: 'large' | 'small' | 'default' = 'default';
  validateForm!: FormGroup;
  validateFormUpdate!: FormGroup;
  validateForm_search!: FormGroup;
  listOfData: VilleItem[] = [];
  listOfDataInit: VilleItem[] = [];
  listOfIntermediairePrimary: IntermediaireItem[] = [];
  types: string[] = [];
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
  editingville?: VilleItem;
  // isUserAddingMoalVisible = true;
  multipleValue = [];
  size: NzSelectSizeType = 'default';
  isEditing: boolean = false;
  _filter: string = '';

  constructor(
    private fb: FormBuilder,
    private servHttp: VilleService,
    private modalService: NzModalService,
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
      code: [null, [Validators.required]],
      valeur: [null, [Validators.required]],
      correspondance: [null, [Validators.required]],

    });

    if (this.isAdmin()) {
      this.activeAction = false;
    } else {
      this.activeAction = true;
    }

    this.getAll();
    // this.loadTypeIntermediaire();
  }

  // loadTypeIntermediaire() {
  //   this.types = [
  //     'Edition attestation',
  //     'Vérification statut',
  //     'Actualisation statut',
  //     'Catégorie Véhicule',
  //     'Sources energie',
  //     'Type véhicule',
  //     'Genre véhicule',
  //     'Usage véhicule',
  //     'Profession assuré',
  //     'Type assuré',
  //     'Type souscripteur',
  //   ];
  // }

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
      code: this.validateForm.value.code,
      valeur: this.validateForm.value.valeur,
      correspondance:this.validateForm.value.correspondance
    };

    console.log(obj);

    this.servHttp.add(obj).subscribe(
      (reponse:any) => {
        if (reponse != null) {
          //reussie

          // Save in local storage
          this.resetForm(); // Reset form
          this.isLoadingOne = false;
          this.message.success(
            'La ville a été créée avec succès.',
            'Info enregistrement'
          );

          this.isVisibleSelectIntermediairesParents = false;

          this.getAll();
        } else {
          this.isLoadingOne = false;
          this.message.error(
            "L'enregistrement de la ville a échoué. Veuillez contacter l'administrateur.",
            'Info enregistrement'
          );
          if (reponse.result.code === 201 || reponse.result.code === 202) {
          } else if (reponse.result.code === 204) {
          }
        }
      },
      (error:any) => {
        this.message.error(
          "L'enregistrement de la ville a échoué. Veuillez contacter l'administrateur.",
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
      id: this.editingville?.id,
      code: this.validateForm?.get('code')?.value,
      valeur: this.validateForm?.get('valeur')?.value,
      correspondance:this.validateForm?.get('correspondance')?.value,
    };

    console.log(obj);

    this.servHttp.update(obj).subscribe(
      (reponse:any) => {
        if (reponse != null) {
          this.message.success(
            "La ville a été mise à jour avec succès.",
            'Info enregistrement'
          );

          this.getAll();
          this.isLoadingOne = false;
          this.visible = false;
        } else {
          this.isLoadingOne = false;
          this.message.error(
            "La mise à jour de la ville a échoué. Veuillez contacter l'administrateur.",
            'Info enregistrement'
          );
          if (reponse.result.code === 201 || reponse.result.code === 202) {
          } else if (reponse.result.code === 204) {
          }
        }
      },
      (error:any) => {
        this.message.error(
          "La mise à jour de la ville n'a pas abouti. Veuillez contacter l'administrateur.",
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
      (reponse:any) => {
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
      (error:any) => {
        this.loading = false;
      }
    );
  }

  showUserModal(): void {
    this.validateForm.reset();
    this.isEditing = false;
    this.isUserAddingMoalVisible = true;
  }
  showEdtingModal(ville: VilleItem): void {
    this.isEditing = true;
    this.editingville = { ...ville };
    this.validateForm.patchValue({
      code: this.editingville.code,
      valeur: this.editingville.valeur,
      correspondance:this.editingville.correspondance
    });
    this.isUserAddingMoalVisible = true;
  }
  handleCancelUserModal(): void {
    this.editingville = {
      id:'',
      code: '',
      valeur: '',
      correspondance:''
    };
    this.isUserAddingMoalVisible = false;
  }



  get Filter(): string {
    return this._filter;
  }

  set Filter(value: string) {
    this._filter = value;
    this.getIntermediairesFromName();
  }

  getIntermediairesFromName() {
    this.listOfData = this.listOfDataInit.filter(
      (ville: VilleItem) =>
        ville.code.toLowerCase().indexOf(this.Filter.toLowerCase()) !=
          -1 ||
        (ville.code != null &&
          ville.code
            .toLowerCase()
            .indexOf(this.Filter.toLowerCase()) != -1)||
        (ville.valeur != null &&
          ville.valeur
            .toLowerCase()
            .indexOf(this.Filter.toLowerCase()) != -1)
    );
  }
}
