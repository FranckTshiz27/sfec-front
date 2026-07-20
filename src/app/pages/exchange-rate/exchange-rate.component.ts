import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSelectSizeType } from 'ng-zorro-antd/select';
import {
  CreateExchangeRatePayload,
  EditExchangeRatePayload,
  ExchangeRateItem,
} from 'src/app/dto/ExchangeRateItem';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { ExchangeRateService } from 'src/app/services/exchange-rate.service';

@Component({
  selector: 'app-exchange-rate',
  templateUrl: './exchange-rate.component.html',
  styleUrls: ['./exchange-rate.component.scss'],
})
export class ExchangeRateComponent implements OnInit {
  validateForm!: FormGroup;
  listOfData: ExchangeRateItem[] = [];
  listOfDataInit: ExchangeRateItem[] = [];

  loading = true;
  isLoadingOne = false;
  isUserAddingMoalVisible = false;
  isEditing = false;
  showOnlyActive = false;
  size: NzSelectSizeType = 'default';
  editingRate?: ExchangeRateItem;
  private _filter = '';

  constructor(
    private fb: FormBuilder,
    private exchangeRateService: ExchangeRateService,
    private message: MessageDialogService,
    private modalService: NzModalService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      rate: [null, [Validators.required, Validators.min(0.0000001)]],
      effectiveDate: [null, [Validators.required]],
      source: ['DGI', [Validators.maxLength(100)]],
      active: [true, [Validators.required]],
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
    this.showOnlyActive ? this.getActive() : this.getAll();
  }

  getAll(): void {
    this.showOnlyActive = false;
    this.fetchRates(this.exchangeRateService.getAll());
  }

  getActive(): void {
    this.showOnlyActive = true;
    this.fetchRates(this.exchangeRateService.getActive());
  }

  showUserModal(): void {
    this.validateForm.reset({
      rate: null,
      effectiveDate: null,
      source: 'DGI',
      active: true,
    });
    this.isEditing = false;
    this.editingRate = undefined;
    this.isUserAddingMoalVisible = true;
  }

  showEditingModal(item: ExchangeRateItem): void {
    this.isEditing = true;
    this.editingRate = { ...item };
    this.validateForm.patchValue({
      rate: this.editingRate.rate,
      effectiveDate: this.toDateInputValue(this.editingRate.effectiveDate),
      source: this.editingRate.source || 'DGI',
      active: this.editingRate.active,
    });
    this.isUserAddingMoalVisible = true;
  }

  handleCancelUserModal(): void {
    this.isUserAddingMoalVisible = false;
    this.isEditing = false;
    this.editingRate = undefined;
  }

  saveOrUpdate(): void {
    this.isEditing ? this.update() : this.add();
  }

  delete(item: ExchangeRateItem): void {
    this.modalService.confirm({
      nzTitle: 'Supprimer ce taux ?',
      nzContent: `Le taux du ${this.formatDate(item.effectiveDate)} sera supprimé définitivement.`,
      nzOkText: 'Supprimer',
      nzOkDanger: true,
      nzCancelText: 'Annuler',
      nzOnOk: () => {
        this.exchangeRateService.delete(item.id).subscribe(
          () => {
            this.message.success('Le taux a été supprimé avec succès.', 'Suppression');
            this.refreshData();
          },
          (error) => {
            this.message.error(
              error?.error?.message || 'La suppression du taux a échoué.',
              'Suppression'
            );
          }
        );
      },
    });
  }

  formatDate(value: string): string {
    if (!value) {
      return '-';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private add(): void {
    const isValid = this.submitForm();
    if (!isValid) {
      return;
    }

    this.isLoadingOne = true;
    const payload: CreateExchangeRatePayload = this.buildCreatePayload();

    this.exchangeRateService.add(payload).subscribe(
      () => {
        this.isLoadingOne = false;
        this.isUserAddingMoalVisible = false;
        this.message.success('Le taux a été créé avec succès.', 'Info enregistrement');
        this.refreshData();
      },
      (error) => {
        this.isLoadingOne = false;
        this.message.error(
          error?.error?.message || "L'enregistrement du taux a échoué.",
          'Info enregistrement'
        );
      }
    );
  }

  private update(): void {
    const isValid = this.submitForm();
    if (!isValid || !this.editingRate?.id) {
      return;
    }

    this.isLoadingOne = true;
    const payload: EditExchangeRatePayload = {
      id: this.editingRate.id,
      ...this.buildCreatePayload(),
    };

    this.exchangeRateService.update(this.editingRate.id, payload).subscribe(
      () => {
        this.isLoadingOne = false;
        this.isUserAddingMoalVisible = false;
        this.message.success('Le taux a été mis à jour avec succès.', 'Info enregistrement');
        this.refreshData();
      },
      (error) => {
        this.isLoadingOne = false;
        this.message.error(
          error?.error?.message || 'La mise à jour du taux a échoué.',
          'Info enregistrement'
        );
      }
    );
  }

  private fetchRates(request$: any): void {
    this.loading = true;
    this.listOfData = [];
    this.listOfDataInit = [];

    request$.subscribe(
      (response: ExchangeRateItem[]) => {
        this.loading = false;
        this.listOfDataInit = response || [];
        this.applyFilter();
      },
      () => {
        this.loading = false;
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
      const source = `${item.source || ''}`.toLowerCase();
      const rate = `${item.rate || ''}`.toLowerCase();
      const date = `${item.effectiveDate || ''}`.toLowerCase();
      const active = item.active ? 'actif' : 'inactif';

      return (
        source.includes(query) ||
        rate.includes(query) ||
        date.includes(query) ||
        active.includes(query)
      );
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

  private buildCreatePayload(): CreateExchangeRatePayload {
    const source = `${this.validateForm?.get('source')?.value || ''}`.trim();
    const effectiveDate = this.normalizeDateTimeForApi(
      this.validateForm?.get('effectiveDate')?.value
    );
    return {
      rate: Number(this.validateForm?.get('rate')?.value),
      effectiveDate,
      source: source || 'DGI',
      active: !!this.validateForm?.get('active')?.value,
    };
  }

  private toDateInputValue(value: string): string {
    if (!value) {
      return '';
    }
    const normalized = `${value}`.replace(' ', 'T');
    if (normalized.length >= 16) {
      return normalized.substring(0, 16);
    }
    return normalized;
  }

  private normalizeDateTimeForApi(value: string): string {
    const normalized = `${value || ''}`.trim();
    if (!normalized) {
      return normalized;
    }

    if (normalized.length === 16) {
      return `${normalized}:00`;
    }

    return normalized;
  }
}
