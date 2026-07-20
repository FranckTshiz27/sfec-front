import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { KeycloakService } from 'keycloak-angular';
import { NzSelectSizeType } from 'ng-zorro-antd/select';
import { IntermediaireItem } from '../interface/IntermediaireItem';
import { CommuneItem } from 'src/app/dto/CommuneItem';
import { CommuneService } from 'src/app/services/commune.service';
import { VilleItem } from 'src/app/dto/VilleItem';
import { VilleService } from 'src/app/services/ville.service';

@Component({
  selector: 'app-commune',
  templateUrl: './commune.component.html',
  styleUrls: ['./commune.component.scss'],
})
export class communeComponent implements OnInit {
  sizeSearch: 'large' | 'small' | 'default' = 'default';
  validateForm!: FormGroup;
  validateFormUpdate!: FormGroup;
  validateForm_search!: FormGroup;
  listOfData: CommuneItem[] = [];
  listOfDataInit: CommuneItem[] = [];
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
  editingcommune?: CommuneItem;
  // isUserAddingMoalVisible = true;
  multipleValue = [];
  size: NzSelectSizeType = 'default';
  isEditing: boolean = false;
  _filter: string = '';
  villes?: VilleItem[];

  constructor(
    private fb: FormBuilder,
    private servHttp: CommuneService,
    private modalService: NzModalService,
    private message: MessageDialogService,
    private servkeycloak: KeycloakService,
    private villeService: VilleService
  ) {}

  isLoadingOne = false;

  radioValue: string = '';

  loadOne(): void {
    this.isLoadingOne = true;
  }
  ngOnInit() {
    // this.validateForm = this.fb.group({
    //   code: [null, [Validators.required]],
    //   valeur: [null, [Validators.required]],
    //   correspondance: [null, [Validators.required]],
    //   ville: [null, [Validators.required]],
    // });

    // if (this.isAdmin()) {
    //   this.activeAction = false;
    // } else {
    //   this.activeAction = true;
    // }

    // this.getAll();
    // this.getVilles();
    // this.loadTypeIntermediaire();
  }

  getVilles() {
    this.villeService.getAll().subscribe((response) => {
      this.villes = [...response];
    });
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

  // isAdmin(): boolean {
  //   return this.servkeycloak.getKeycloakInstance().hasResourceRole('Admin');
  // }
  // isClient(): boolean {
  //   return this.servkeycloak.getKeycloakInstance().hasResourceRole('Client');
  // }
  // iSimple(): boolean {
  //   return this.servkeycloak.getKeycloakInstance().hasResourceRole('Default');
  // }
  // isProducteur(): boolean {
  //   return this.servkeycloak
  //     .getKeycloakInstance()
  //     .hasResourceRole('Producteur');
  // }

  // refreshData(): void {
  //   this.getAll();
  // }

  // submitForm(): boolean {
  //   console.log(this.validateForm);

  //   let isValid: boolean = true;
  //   if (this.validateForm.valid) {
  //     return true;
  //   } else {
  //     Object.values(this.validateForm.controls).forEach((control) => {
  //       if (control.invalid) {
  //         isValid = false;
  //         control.markAsDirty();
  //         control.updateValueAndValidity({ onlySelf: true });
  //       }
  //     });
  //     return isValid;
  //   }
  // }

  // submitFormUpdate(): boolean {
  //   let isValid: boolean = true;
  //   if (this.validateFormUpdate.valid) {
  //     return true;
  //   } else {
  //     Object.values(this.validateFormUpdate.controls).forEach((control) => {
  //       if (control.invalid) {
  //         isValid = false;
  //         control.markAsDirty();
  //         control.updateValueAndValidity({ onlySelf: true });
  //       }
  //     });
  //     return isValid;
  //   }
  // }

  // resetForm(): void {
  //   // e.preventDefault();
  //   this.isEditing = false;
  //   this.validateForm.reset();
  //   for (const key in this.validateForm.controls) {
  //     if (this.validateForm.controls.hasOwnProperty(key)) {
  //       this.validateForm.controls[key].markAsPristine();
  //       this.validateForm.controls[key].updateValueAndValidity();
  //     }
  //   }
  // }

  // add() {
  //   const isValid = this.submitForm();
  //   if (!isValid) {
  //     return;
  //   }

  //   this.loadOne();

  //   let obj = {
  //     code: this.validateForm.value.code,
  //     valeur: this.validateForm.value.valeur,
  //     correspondance: this.validateForm.value.correspondance,
  //     ville:this.validateForm.value.ville
  //   };

  
  //   this.servHttp.add(obj).subscribe(
  //     (reponse: any) => {
  //       if (reponse != null) {
  //         //reussie

  //         // Save in local storage
  //         this.resetForm(); // Reset form
  //         this.isLoadingOne = false;
  //         this.message.success(
  //           'La commune a été créée avec succès.',
  //           'Info enregistrement'
  //         );

  //         this.isVisibleSelectIntermediairesParents = false;

  //         this.getAll();
  //       } else {
  //         this.isLoadingOne = false;
  //         this.message.error(
  //           "L'enregistrement de la commune a échoué. Veuillez contacter l'administrateur.",
  //           'Info enregistrement'
  //         );
  //         if (reponse.result.code === 201 || reponse.result.code === 202) {
  //         } else if (reponse.result.code === 204) {
  //         }
  //       }
  //     },
  //     (error: any) => {
  //       this.message.error(
  //         "L'enregistrement de la commune a échoué. Veuillez contacter l'administrateur.",
  //         'Info enregistrement'
  //       );
  //       this.isLoadingOne = false;
  //     }
  //   );
  // }

  // saveOrUdate() {
  //   this.isEditing ? this.update() : this.add();
  // }
  // update() {
  //   const isValid = this.submitForm();
  //   if (!isValid) {
  //     return;
  //   }

  //   this.isLoadingOne = true;

  //   let obj = {
  //     id: this.editingcommune?.id,
  //     code: this.validateForm?.get('code')?.value,
  //     valeur: this.validateForm?.get('valeur')?.value,
  //     correspondance: this.validateForm?.get('correspondance')?.value,
  //     villeCode:this.validateForm?.get('ville')?.value,
  //   };

  //   console.log(obj);

  //   this.servHttp.update(obj).subscribe(
  //     (reponse: any) => {
  //       if (reponse != null) {
  //         this.message.success(
  //           'La commune a été mise à jour avec succès.',
  //           'Info enregistrement'
  //         );

  //         this.getAll();
  //         this.isLoadingOne = false;
  //         this.visible = false;
  //       } else {
  //         this.isLoadingOne = false;
  //         this.message.error(
  //           "La mise à jour de la commune a échoué. Veuillez contacter l'administrateur.",
  //           'Info enregistrement'
  //         );
  //         if (reponse.result.code === 201 || reponse.result.code === 202) {
  //         } else if (reponse.result.code === 204) {
  //         }
  //       }
  //     },
  //     (error: any) => {
  //       this.message.error(
  //         "La mise à jour de la commune n'a pas abouti. Veuillez contacter l'administrateur.",
  //         'Info enregistrement'
  //       );
  //       this.isLoadingOne = false;
  //     }
  //   );
  // }

  // close(e: MouseEvent): void {
  //   this.visible = false;
  //   this.resetFormUpdate(e); // Reset form
  // }

  // resetFormUpdate(e?: MouseEvent): void {
  //   e?.preventDefault();
  //   this.validateFormUpdate.reset();
  //   for (const key in this.validateFormUpdate.controls) {
  //     if (this.validateFormUpdate.controls.hasOwnProperty(key)) {
  //       this.validateFormUpdate.controls[key].markAsPristine();
  //       this.validateFormUpdate.controls[key].updateValueAndValidity();
  //     }
  //   }
  // }

  // getAll() {
  //   this.listOfData = [];
  //   this.listOfDataInit = [];
  //   this.servHttp.getAll().subscribe(
  //     (reponse: any) => {
  //       if (reponse != null) {
  //         //reussie
  //         this.listOfData = reponse;
  //         this.listOfDataInit = reponse;
  //         // this.listOfIntermediairePrimary = this.listOfData.filter(
  //         //   (item) => item.primaire
  //         // ); // renvoie les intermédaires
  //         // Save in local storage
  //         this.loading = false;
  //       } else {
  //         this.loading = false;
  //         if (reponse.result.code === 201 || reponse.result.code === 202) {
  //         } else if (reponse.result.code === 204) {
  //         }
  //       }
  //     },
  //     (error: any) => {
  //       this.loading = false;
  //     }
  //   );
  // }

  // showUserModal(): void {
  //   this.validateForm.reset();
  //   this.isEditing = false;
  //   this.isUserAddingMoalVisible = true;
  // }
  // showEdtingModal(commune: CommuneItem): void {
  //   this.isEditing = true;
  //   this.editingcommune = { ...commune };
  //   this.validateForm.patchValue({
  //     code: this.editingcommune.code,
  //     valeur: this.editingcommune.valeur,
  //     correspondance: this.editingcommune.correspondance,
  //     ville:this.editingcommune.ville?.code
  //   });
  //   this.isUserAddingMoalVisible = true;
  // }
  // handleCancelUserModal(): void {
  //   this.editingcommune = {
  //     id: '',
  //     code: '',
  //     valeur: '',
  //     correspondance: '',
  //     ville: null,
  //   };
  //   this.isUserAddingMoalVisible = false;
  // }

  // get Filter(): string {
  //   return this._filter;
  // }

  // set Filter(value: string) {
  //   this._filter = value;
  //   this.getIntermediairesFromName();
  // }

  // getIntermediairesFromName() {
  //   this.listOfData = this.listOfDataInit.filter(
  //     (commune: CommuneItem) =>
  //       commune.code.toLowerCase().indexOf(this.Filter.toLowerCase()) != -1 ||
  //       (commune.code != null &&
  //         commune.code.toLowerCase().indexOf(this.Filter.toLowerCase()) !=
  //           -1) ||
  //       (commune.valeur != null &&
  //         commune.valeur.toLowerCase().indexOf(this.Filter.toLowerCase()) != -1)
  //   );
  // }
}
