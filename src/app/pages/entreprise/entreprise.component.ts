import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectSizeType } from 'ng-zorro-antd/select';
import {
  CreateEntreprisePayload,
  EditEntreprisePayload,
  EntrepriseItem,
} from 'src/app/dto/EntrepriseItem';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { EntrepriseService } from 'src/app/services/entreprise.service';

@Component({
  selector: 'app-entreprise',
  templateUrl: './entreprise.component.html',
  styleUrls: ['./entreprise.component.scss'],
})
export class EntrepriseComponent implements OnInit {
  validateForm!: FormGroup;
  listOfData: EntrepriseItem[] = [];
  listOfDataInit: EntrepriseItem[] = [];

  loading = true;
  isLoadingOne = false;
  isUserAddingMoalVisible = false;
  isEditing = false;
  size: NzSelectSizeType = 'default';
  editingEntreprise?: EntrepriseItem;
  private _filter = '';

  constructor(
    private fb: FormBuilder,
    private entrepriseService: EntrepriseService,
    private message: MessageDialogService,
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      code: [null, [Validators.required]],
      nif: [null, [Validators.required]],
      nom: [null, [Validators.required]],
    });

    this.getAll();
  }

  get Filter(): string {
    return this._filter;
  }

  set Filter(value: string) {
    this._filter = value;
    this.applyFilter();
  }

  refreshData(): void {
    this.getAll();
  }

  getAll(): void {
    this.loading = true;
    this.listOfData = [];
    this.listOfDataInit = [];

    this.entrepriseService.getAll().subscribe(
      (response: EntrepriseItem[]) => {
        this.loading = false;
        this.listOfDataInit = response || [];
        this.applyFilter();
      },
      () => {
        this.loading = false;
      }
    );
  }

  showUserModal(): void {
    this.validateForm.reset({
      code: null,
      nif: null,
      nom: null,
    });
    this.isEditing = false;
    this.editingEntreprise = undefined;
    this.isUserAddingMoalVisible = true;
  }

  showEditingModal(item: EntrepriseItem): void {
    this.isEditing = true;
    this.editingEntreprise = { ...item };
    this.validateForm.patchValue({
      code: this.editingEntreprise.code,
      nif: this.editingEntreprise.nif,
      nom: this.editingEntreprise.nom,
    });
    this.isUserAddingMoalVisible = true;
  }

  handleCancelUserModal(): void {
    this.isUserAddingMoalVisible = false;
    this.isEditing = false;
    this.editingEntreprise = undefined;
  }

  saveOrUpdate(): void {
    this.isEditing ? this.update() : this.add();
  }

  delete(item: EntrepriseItem): void {
    this.modalService.confirm({
      nzTitle: 'Supprimer cette entreprise ?',
      nzContent: `L'entreprise ${item.nom} sera supprimée définitivement.`,
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () => {
        this.entrepriseService.delete(item.id).subscribe(
          () => {
            this.message.success(
              "L'entreprise a été supprimée avec succès.",
              'Suppression'
            );
            this.getAll();
          },
          (error) => {
            this.message.error(
              error?.error?.message || "La suppression de l'entreprise a échoué.",
              'Suppression'
            );
          }
        );
      },
    });
  }

  private add(): void {
    const isValid = this.submitForm();
    if (!isValid) {
      return;
    }

    this.isLoadingOne = true;
    const payload: CreateEntreprisePayload = this.buildCreatePayload();

    this.entrepriseService.add(payload).subscribe(
      () => {
        this.isLoadingOne = false;
        this.isUserAddingMoalVisible = false;
        this.message.success(
          "L'entreprise a été créée avec succès.",
          'Info enregistrement'
        );
        this.getAll();
      },
      (error) => {
        this.isLoadingOne = false;
        this.message.error(
          error?.error?.message || "L'enregistrement de l'entreprise a échoué.",
          'Info enregistrement'
        );
      }
    );
  }

  private update(): void {
    const isValid = this.submitForm();
    if (!isValid || !this.editingEntreprise?.id) {
      return;
    }

    this.isLoadingOne = true;
    const payload: EditEntreprisePayload = {
      id: this.editingEntreprise.id,
      ...this.buildCreatePayload(),
    };

    this.entrepriseService.update(this.editingEntreprise.id, payload).subscribe(
      () => {
        this.isLoadingOne = false;
        this.isUserAddingMoalVisible = false;
        this.message.success(
          "L'entreprise a été mise à jour avec succès.",
          'Info enregistrement'
        );
        this.getAll();
      },
      (error) => {
        this.isLoadingOne = false;
        this.message.error(
          error?.error?.message || "La mise à jour de l'entreprise a échoué.",
          'Info enregistrement'
        );
      }
    );
  }

  private applyFilter(): void {
    const query = (this.Filter || '').trim().toLowerCase();
    if (!query) {
      this.listOfData = [...this.listOfDataInit];
      return;
    }

    this.listOfData = this.listOfDataInit.filter((item) => {
      const code = `${item.code || ''}`.toLowerCase();
      const nif = `${item.nif || ''}`.toLowerCase();
      const nom = `${item.nom || ''}`.toLowerCase();
      return code.includes(query) || nif.includes(query) || nom.includes(query);
    });
  }

  private submitForm(): boolean {
    let isValid = true;
    if (this.validateForm.valid) {
      return true;
    }

    Object.values(this.validateForm.controls).forEach((control) => {
      if (control.invalid) {
        isValid = false;
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
    return isValid;
  }

  private buildCreatePayload(): CreateEntreprisePayload {
    return {
      code: `${this.validateForm?.get('code')?.value || ''}`.trim(),
      nif: `${this.validateForm?.get('nif')?.value || ''}`.trim(),
      nom: `${this.validateForm?.get('nom')?.value || ''}`.trim(),
    };
  }
}
