import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { KeycloakService } from 'keycloak-angular';

import { NzSelectSizeType } from 'ng-zorro-antd/select';
import { IntermediaireItem } from '../interface/IntermediaireItem';
import { ColumnIntermediaireItem } from '../interface/ColumnIntermediaireItem';
import { StatusItem } from 'src/app/dto/StatusItem';
import { StatusService } from 'src/app/services/status.service';


@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
})
export class StatusComponent implements OnInit {
  // sizeSearch: 'large' | 'small' | 'default' = 'default';
  // validateForm!: FormGroup;
  // validateFormUpdate!: FormGroup;
  // validateForm_search!: FormGroup;
  // listOfData: StatusItem[] = [];
  // listOfDataInit: StatusItem[] = [];
  // listOfIntermediairePrimary: IntermediaireItem[] = [];
  // types: string[] = [];
  // itemIntermediare?: IntermediaireItem;
  // loading = true;
  // visible: boolean = false;
  // activeAction: boolean = true;
  // isVisibleSelectIntermediairesParents: boolean = false;
  // isVisibleCodeArca: boolean = false;
  // isPrimary: boolean = false;
  // isLoadingOne_update: boolean = false;
  // isUserAddingMoalVisible: boolean = false;
  // name_update?: string = '';
  // type_update?: string = '';
  // primaire_update?: boolean = false;
  // code_update?: string = '';
  // codeArcaUpdate?: string = '';
  // type_interm_value: string = '';
  // editingStatus?: StatusItem;
  // // isUserAddingMoalVisible = true;
  // multipleValue = [];
  // size: NzSelectSizeType = 'default';
  // isEditing: boolean = false;
  // _filter: string = '';

  // constructor(
  //   private fb: FormBuilder,
  //   private servHttp: StatusService,
  //   private modalService: NzModalService,
  //   private message: MessageDialogService,
  //   private servkeycloak: KeycloakService
  // ) {}

  // isLoadingOne = false;

  // radioValue: string = '';

  // loadOne(): void {
  //   this.isLoadingOne = true;
  // }
  ngOnInit() {
    // this.validateForm = this.fb.group({
    //   code: [null, [Validators.required]],
    //   description: [null, [Validators.required]],
    //   statut: [null],
    //   type: [null, [Validators.required]]
    // });

  //   if (this.isAdmin()) {
  //     this.activeAction = false;
  //   } else {
  //     this.activeAction = true;
  //   }

  //   this.getAll();
  //   this.loadTypeIntermediaire();
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
  //     description: this.validateForm.value.description,
  //     statut: this.validateForm.value.statut,
  //     type: this.validateForm.value.type
  //   };

  //   console.log(obj);

  //   this.servHttp.add(obj).subscribe(
  //     (reponse:any) => {
  //       if (reponse != null) {
  //         //reussie

  //         // Save in local storage
  //         this.resetForm(); // Reset form
  //         this.isLoadingOne = false;
  //         this.message.success(
  //           'La status a été créée avec succès.',
  //           'Info enregistrement'
  //         );

  //         this.isVisibleSelectIntermediairesParents = false;

  //         this.getAll();
  //       } else {
  //         this.isLoadingOne = false;
  //         this.message.error(
  //           "L'enregistrement de la status a échoué. Veuillez contacter l'administrateur.",
  //           'Info enregistrement'
  //         );
  //         if (reponse.result.code === 201 || reponse.result.code === 202) {
  //         } else if (reponse.result.code === 204) {
  //         }
  //       }
  //     },
  //     (error) => {
  //       this.message.error(
  //         "L'enregistrement de la status a échoué. Veuillez contacter l'administrateur.",
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
  //     id: this.editingStatus?.id,
  //     description: this.validateForm?.get('description')?.value,
  //     code: this.validateForm?.get('code')?.value,
  //     type: this.validateForm?.get('type')?.value,
  //     etat: this.validateForm?.get('etat')?.value
  //   };

  //   console.log(obj);

  //   this.servHttp.update(obj).subscribe(
  //     (reponse:any) => {
  //       if (reponse != null) {
  //         this.message.success(
  //           "La status a été mise à jour avec succès.",
  //           'Info enregistrement'
  //         );

  //         this.getAll();
  //         this.isLoadingOne = false;
  //         this.visible = false;
  //       } else {
  //         this.isLoadingOne = false;
  //         this.message.error(
  //           "La mise à jour de la status a échoué. Veuillez contacter l'administrateur.",
  //           'Info enregistrement'
  //         );
  //         if (reponse.result.code === 201 || reponse.result.code === 202) {
  //         } else if (reponse.result.code === 204) {
  //         }
  //       }
  //     },
  //     (error:any) => {
  //       this.message.error(
  //         "La mise à jour de la status n'a pas abouti. Veuillez contacter l'administrateur.",
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

  // // getAll() {
  // //   this.listOfData = [];
  // //   this.listOfDataInit = [];
  // //   this.servHttp.getAll().subscribe(
  // //     (reponse:any) => {
  // //       if (reponse != null) {
  // //         //reussie
  // //         this.listOfData = reponse;
  // //         this.listOfDataInit = reponse;
  // //         // this.listOfIntermediairePrimary = this.listOfData.filter(
  // //         //   (item) => item.primaire
  // //         // ); // renvoie les intermédaires
  // //         // Save in local storage
  // //         this.loading = false;
  // //       } else {
  // //         this.loading = false;
  // //         if (reponse.result.code === 201 || reponse.result.code === 202) {
  // //         } else if (reponse.result.code === 204) {
  // //         }
  // //       }
  // //     },
  // //     (error:any) => {
  // //       this.loading = false;
  // //     }
  // //   );
  // // }

  // showUserModal(): void {
  //   this.validateForm.reset();
  //   this.isEditing = false;
  //   this.isUserAddingMoalVisible = true;
  // }
  // showEdtingModal(status: StatusItem): void {
  //   this.isEditing = true;
  //   this.editingStatus = { ...status };
  //   this.validateForm.patchValue({
  //     code: this.editingStatus.code,
  //     type: this.editingStatus.type,
  //     description: this.editingStatus.description,
  //     etat: this.editingStatus.etat,
  //   });
  //   this.isUserAddingMoalVisible = true;
  // }
  // handleCancelUserModal(): void {
  //   this.editingStatus = {
  //     code: '',
  //     id: '',
  //     description: '',
  //     etat: '',
  //     type: '',
  //   };
  //   this.isUserAddingMoalVisible = false;
  // }

  // listOfColumns: ColumnIntermediaireItem[] = [
  //   {
  //     name: 'Intermédiaire',
  //     sortOrder: null,
  //     sortDirections: ['ascend', 'descend', null],
  //     sortFn: null,
  //     filterMultiple: false,
  //     listOfFilter: [],
  //     filterFn: null,
  //   },
  //   {
  //     name: 'Code',
  //     sortOrder: null,
  //     sortDirections: ['ascend', 'descend', null],
  //     sortFn: null,
  //     filterMultiple: false,
  //     listOfFilter: [],
  //     filterFn: null,
  //   },

  //   {
  //     name: 'Catégorie',
  //     sortOrder: null,
  //     sortDirections: ['ascend', 'descend', null],
  //     sortFn: null,
  //     filterMultiple: false,
  //     listOfFilter: [],
  //     filterFn: null,
  //   },

  //   {
  //     name: 'Action',
  //     sortOrder: null,
  //     sortDirections: ['ascend', 'descend', null],
  //     sortFn: null,
  //     filterMultiple: false,
  //     listOfFilter: [],
  //     filterFn: null,
  //   },
  // ];

  // get Filter(): string {
  //   return this._filter;
  // }

  // set Filter(value: string) {
  //   this._filter = value;
  //   this.getIntermediairesFromName();
  // }

  // getIntermediairesFromName() {
  //   this.listOfData = this.listOfDataInit.filter(
  //     (status: StatusItem) =>
  //       status.code.toLowerCase().indexOf(this.Filter.toLowerCase()) !=
  //         -1 ||
  //       (status.type != null &&
  //         status.type
  //           .toLowerCase()
  //           .indexOf(this.Filter.toLowerCase()) != -1)
  //   );
  // }
}
