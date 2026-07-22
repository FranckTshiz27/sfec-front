import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NzModalService } from 'ng-zorro-antd/modal';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as QRCode from 'qrcode';
import {
  faPrint,
  faInfoCircle,
  faEye,
  faPaperPlane,
  faTimes,
  faArrowCircleUp,
} from '@fortawesome/free-solid-svg-icons';
('src/app/services/date-service.service');
import { CertificatService } from 'src/app/services/certificat.service';
import { KeycloakService } from 'keycloak-angular';
import { PDFDocument } from 'pdf-lib';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import { HistoryService } from 'src/app/services/history.service';
import { PolicyService } from 'src/app/services/policy.service';
import { RiskService } from 'src/app/services/risk';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { CompleteCertificate } from '../interface/CompleteCertificat';
import { Attestation } from '../interface/attestation';
import { Demande } from '../interface/Demande';
import { TypeAttestation } from 'src/app/enum/typeAttestation';
import { InvoiceService } from 'src/app/services/invoice.service';
import { Invoice } from 'src/app/dto/Invoice';
import { Transaction } from 'src/app/dto/Transaction';
import { UtilService } from 'src/app/utils/utils.service';
import { FrappeSalesInvoiceRequestService } from 'src/app/services/frappe-sales-invoice-request.service';
import { FrappeSalesInvoiceRequest } from 'src/app/dto/frappe-sales-invoice-request.model';
import { SfecInvoiceResponse } from 'src/app/dto/SfecInvoiceResponse';
import {
  decodeQrPayloadUrlFromDataUrl,
  extractQrCodeUrl,
  isOpenableHttpUrl,
  normalizeQrCodeRaw,
  renderQrCodeImage,
  toEmbeddedImageDataUrl,
} from 'src/app/utils/qr-code.util';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list-done.component.html',
  styleUrls: ['./transaction-list-done.component.scss'],
})
export class TransactionListDoneComponent implements OnInit {
  loading = true;
  validateForm_search!: FormGroup;
  validateForm!: FormGroup;
  // permission: PermissionItem[] = [];
  // iResponses!: IResponseArca[];
  responses!: Response[];
  periodeDto: any;
  periodeAndRiskDto: any;
  visible_view = false;
  visible_print_preview = false;
  date_search: string = '';
  // certificat_value?: CompleteCertificate;
  certificates: any = { content: [] };
  completeCertificates: CompleteCertificate[] = [];
  listOfData: any[] = [];
  dateArray: Date[] = [];
  ref: string = '';
  pageSize = 10;
  pageIndex = 0;
  faPrint = faPrint;
  faInfo = faInfoCircle;
  faEye = faEye;
  faPaper = faPaperPlane;
  _checkAll: boolean = false;
  _isPeriodeChecked: boolean = false;
  _isRiskReferenceChecked: boolean = false;
  _immatriculationFilter: any;
  selectedPolicy: any;
  selectedRisk: any;
  faTimes = faTimes;
  envid: string = '';
  dialogCancelCertificatIsOpened = false;
  selectedDemande?: Demande;
  public type?: TypeAttestation;
  attestationBrune?: Attestation;
  attestationJaune?: Attestation;
  faArrow = faArrowCircleUp;
  selectedTransaction?: any;

  printPreviewData: any = null;
  previewPdfUrl: SafeResourceUrl | null = null;
  previewPdfBlobUrl: string | null = null;
  previewPdfFileName = '';
  previewZoom = 60;
  isInit = false;
  previousUrl?: string;
  size: 'large' | 'small' | 'default' = 'default';
  transactions?: any[];
  globalSearch = '';
  filterFrom: Date | null = null;
  filterTo: Date | null = null;
  statusFilters = {
    success: true,
    error: true,
    pending: true,
  };

  @Output() changeCertficat = new EventEmitter<boolean>();
  dayjs: any;

  @ViewChild('inputElement_assurance', { static: false })
  inputElement_assurance?: ElementRef;

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex } = params;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
  }

  constructor(
    private fb: FormBuilder,
    private servHttp: CertificatService,
    private modal: NzModalService,
    private servkeycloak: KeycloakService,
    public authService: AuthService,
    private policyService: PolicyService,
    private riskService: RiskService,
    private invoiceService: InvoiceService,
    private frappeSalesInvoiceRequestService: FrappeSalesInvoiceRequestService,
    private message: MessageDialogService,
    private sanitizer: DomSanitizer,
    private utilService: UtilService
  ) {}

  ngOnInit(): void {
    this.envid = '';
    this.initPeriodes();
    this.validateForm_search = this.fb.group({
      word_search: [null, [Validators.required]],
    });
    this.validateForm = this.fb.group({
      date_search: [null],
      date: [null],
    });
    this.loading = true;
    this.getTransactions();
  }
  onChange(value: any) {
    if (value && value.length > 0) {
      this.periodeDto.dateDebut = value[0];
      this.periodeDto.dateFin = value[1];
      this.periodeAndRiskDto.dateDebut = value[0];
      this.periodeAndRiskDto.dateFin = value[1];
    } else {
      this.initPeriodes();
    }
  }
  getTransactions() {
    this.loading = true;
    this.invoiceService.getTransactions(this.periodeDto).subscribe(
      (response) => {
        this.transactions = (response || []).map((invoice) =>
          this.mapSfecInvoiceToTransaction(invoice)
        );
        this.loading = false;
      },
      (error) => {
        console.log(error);
        this.transactions = [];
        this.loading = false;
        this.message.error(
          error?.error?.errorMessage || "Erreur lors du chargement de l'historique SFEC.",
          'Historique'
        );
      }
    );
  }

  resetTransactionFilters(): void {
    this.globalSearch = '';
    this.filterFrom = null;
    this.filterTo = null;
    this.statusFilters = {
      success: true,
      error: true,
      pending: true,
    };
    this.dateArray = [];
    this.validateForm.patchValue({ date: null });
    this.initPeriodes();
    this.getTransactions();
  }
  getCertificatesResponses() {
    this.servHttp.getResponses().subscribe(
      (response) => {
        // this.getComputedCertificates(this.completeCertificates, response);
        // this.completeCertificates = [...response];
        console.log(this.transactions);

        this.loading = false;
      },
      (error) => {
        this.loading = false;
      }
    );
  }
  getCertificatesResponsesByPeriode(param: any) {
    // this.servHttp.getResponsesByPeriode(param).subscribe(
    //   (response) => {
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.completeCertificates = { ...response };
    //     this.loading = false;
    //   },
    //   (error) => {
    //     this.loading = false;
    //   }
    // );
  }
  getCertificatesResponsesByPeriodeAndRiskReference(param: any) {
    // if (!this.Immatriculation) {
    //   param.immatriculation = '';
    // } else {
    //   param.immatriculation = this.Immatriculation;
    // }
    // this.loading = true;
    // this.servHttp.getResponsesByPeriodeAndRiskReference(param).subscribe(
    //   (response) => {
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.completeCertificates = [...response];
    //     console.log(this.completeCertificates);
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //     this.loading = false;
    //   }
    // );
  }
  getCertificateByCertificateReference(reference: string) {
    // this.loading = true;
    // this.servHttp.getResponseByCertificateReference(reference).subscribe(
    //   (response) => {
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.completeCertificates = { ...response };
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //     this.loading = false;
    //   }
    // );
  }
  getCertificateByImmatriculation(immatriculation: string) {
    // this.loading = true;
    // this.servHttp.getResponsesByImmatriculation(immatriculation).subscribe(
    //   (response) => {
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.completeCertificates = { ...response };
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //     this.loading = false;
    //   }
    // );
  }
  changeStatus(value: boolean) {
    this.changeCertficat.emit(value);
  }
  logout(): void {
    // Localstore.deleteCompte();
    // this.servkeycloak.getKeycloakInstance().logout();
    // this.router.navigate(['/']);
  }
  get filteredTransactions(): any[] {
    const source = this.transactions ?? [];
    const query = this.normalizeSearchValue(this.globalSearch);
    const from = this.filterFrom ? new Date(this.filterFrom) : null;
    const to = this.filterTo ? new Date(this.filterTo) : null;

    if (from) {
      from.setHours(0, 0, 0, 0);
    }
    if (to) {
      to.setHours(23, 59, 59, 999);
    }

    return source.filter((transaction) => {
      const statusKey = this.getStatusKey(transaction.status);
      if (!this.statusFilters[statusKey]) {
        return false;
      }

      const createdAt = transaction.createdAt ? new Date(transaction.createdAt) : null;
      if (from && createdAt && createdAt < from) {
        return false;
      }
      if (to && createdAt && createdAt > to) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        transaction.rn,
        transaction.cle,
        transaction.type,
        transaction.status,
        transaction.client?.name,
        transaction.client?.nif,
        transaction.certificationNumber,
        transaction.invoiceNumber,
        transaction.intermediaryCode,
        transaction.exchangeRate,
        transaction.exchangeRateEffectiveDate,
      ]
        .map((value) => this.normalizeSearchValue(value))
        .join(' ');

      return haystack.includes(query);
    });
  }

  get totalOperations(): number {
    return (this.transactions ?? []).length;
  }

  get successCount(): number {
    return (this.transactions ?? []).filter((t) => this.getStatusKey(t.status) === 'success').length;
  }

  get errorCount(): number {
    return (this.transactions ?? []).filter((t) => this.getStatusKey(t.status) === 'error').length;
  }

  get successRate(): number {
    if (!this.totalOperations) {
      return 0;
    }
    return Math.round((this.successCount / this.totalOperations) * 1000) / 10;
  }

  get errorRate(): number {
    if (!this.totalOperations) {
      return 0;
    }
    return Math.round((this.errorCount / this.totalOperations) * 1000) / 10;
  }

  getStatusKey(status?: string): 'success' | 'error' | 'pending' {
    switch (`${status || ''}`.toUpperCase()) {
      case '1':
      case 'CERTIFIED':
        return 'success';
      case '-1':
      case 'FAILED':
        return 'error';
      case '0':
      case 'SUBMITTED':
      case 'DRAFT':
        return 'pending';
      default:
        return 'pending';
    }
  }

  getStatusLabel(status?: string): string {
    switch (`${status || ''}`.toUpperCase()) {
      case '1':
      case 'CERTIFIED':
        return 'Certifiée';
      case '-1':
      case 'FAILED':
        return 'Échec';
      case '0':
      case 'SUBMITTED':
        return 'Soumise';
      case 'DRAFT':
        return 'Brouillon';
      default:
        return status || 'Non validé';
    }
  }

  isPrintable(transaction: any): boolean {
    return this.getStatusKey(transaction?.status) === 'success' || !!normalizeQrCodeRaw(transaction?.qrCode);
  }

  private mapSfecInvoiceToTransaction(invoice: SfecInvoiceResponse): any {
    const items = (invoice.items || []).map((item, index) => ({
      id: `${index}`,
      code: `${item.classification_code ?? ''}`,
      type: `${item.type ?? ''}`,
      name: `${item.designation ?? ''}`,
      price: Number(item.unit_price ?? 0),
      quantity: Number(item.quantity ?? 0),
      taxGroup: `${item.tax_rate ?? ''}`,
      taxSpecificValue: '',
      taxSpecificAmount: Number(item.tax_amount ?? 0),
      originalPrice: Number(item.unit_price ?? 0),
      priceModification: `${item.discount_type ?? ''}`,
      subtotal: Number(item.subtotal ?? 0),
      totalAmount: Number(item.total_amount ?? 0),
    }));

    return {
      id: `${invoice.id ?? ''}`,
      nif: `${invoice.taxpayer_niu ?? invoice.recipient_niu ?? ''}`,
      cle: `${invoice.invoice_id ?? ''}`,
      rn: `${invoice.invoice_number ?? invoice.invoice_id ?? ''}`,
      mode: `${invoice.payment_method ?? ''}`,
      isf: `${invoice.sciet ?? ''}`,
      type: `${invoice.invoice_type ?? ''}`,
      items,
      client: {
        id: '',
        nif: `${invoice.recipient_niu ?? ''}`,
        name: `${invoice.recipient_name ?? ''}`,
        address: `${invoice.recipient_address ?? ''}`,
        contact: `${invoice.recipient_phone ?? ''}`,
        email: `${invoice.recipient_email ?? ''}`,
        type: `${invoice.recipient_type ?? ''}`,
        rccm: `${invoice.recipient_rccm ?? ''}`,
      },
      shop: null,
      operator: null,
      payments: invoice.payment_method
        ? [
            {
              mode: invoice.payment_method,
              reference: invoice.payment_reference,
              date: invoice.payment_date,
              amount: invoice.amount_due ?? invoice.total_amount,
            },
          ]
        : [],
      reference: `${invoice.invoice_id ?? ''}`,
      referenceType: `${invoice.invoice_type ?? ''}`,
      referenceDesc: `${invoice.invoice_subject ?? ''}`,
      currencyCode: `${invoice.currency ?? 'XAF'}`,
      currencyDate: invoice.payment_date || invoice.created_at,
      currencyRate: null,
      exchangeRate: invoice.currency || 'XAF',
      exchangeRateEffectiveDate: invoice.payment_date || invoice.created_at,
      prime: Number(invoice.total_amount ?? invoice.amount_due ?? 0),
      createdAt: invoice.created_at || invoice.certification_date,
      updatedAt: invoice.certification_date || invoice.created_at,
      status: `${invoice.status ?? '0'}`,
      intermediaryCode: invoice.intermediary_code,
      certificationNumber: invoice.certification_number,
      invoiceNumber: invoice.invoice_number,
      signature: invoice.signature,
      shortSignature: invoice.short_signature,
      qrCode: invoice.qr_code,
      certificationDate: invoice.certification_date,
      identifier: invoice.identifier,
      subtotal: invoice.subtotal,
      totalTaxAmount: invoice.total_tax_amount,
      totalTaxTAmount: invoice.total_tax_t_amount,
      amountDue: invoice.amount_due,
      notes: invoice.notes,
      sfecResponse: invoice,
      messageContent: {
        codeDEFDGI: invoice.certification_number,
        counters: invoice.identifier,
        nim: invoice.short_signature,
        dateTime: invoice.certification_date,
        qrCode: invoice.qr_code,
      },
    };
  }

  private toLocalDateParam(value: Date | string): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      const now = new Date();
      return `${now.getFullYear()}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}`;
    }

    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
  }

  private mapFrappeRequestToTransaction(
    request: FrappeSalesInvoiceRequest
  ): any {
    const req = request as any;
    const payload = req?.dgiInvoicePayload || {};
    const responseInvoice = req?.frappeResponseSalesInvoice || {};
    const shop = req?.shop || {};
    const status = `${req?.requestStatus ?? req?.status ?? '-2'}`;

    return {
      id: `${req?.id ?? ''}`,
      nif: `${payload?.nif ?? ''}`,
      cle: `${req?.cle ?? ''}`,
      rn: `${responseInvoice?.name ?? payload?.rn ?? payload?.reference ?? ''}`,
      mode: `${payload?.mode ?? ''}`,
      isf: `${payload?.isf ?? ''}`,
      type: `${
        req?.custom_edef_type_facture ??
        req?.customEdefTypeFacture ??
        payload?.type ??
        responseInvoice?.customEdefTypeFacture ??
        ''
      }`,
      items: (payload?.items || []).map((item: any) => ({
        id: `${item?.id ?? ''}`,
        code: `${item?.code ?? ''}`,
        type: `${item?.type ?? ''}`,
        name: `${item?.name ?? ''}`,
        price: Number(item?.price ?? 0),
        quantity: Number(item?.quantity ?? 0),
        taxGroup: `${item?.taxGroup ?? ''}`,
        taxSpecificValue: `${item?.taxSpecificValue ?? ''}`,
        taxSpecificAmount: Number(item?.taxSpecificAmount ?? 0),
        originalPrice: Number(item?.originalPrice ?? 0),
        priceModification: `${item?.priceModification ?? ''}`,
      })),
      client: {
        id: `${payload?.client?.id ?? ''}`,
        nif: `${payload?.client?.nif ?? ''}`,
        name: `${payload?.client?.name ?? req?.customer ?? ''}`,
        contact: `${payload?.client?.contact ?? ''}`,
        address: `${payload?.client?.address ?? ''}`,
        type: `${payload?.client?.type ?? ''}`,
        typeDesc: `${payload?.client?.typeDesc ?? ''}`,
        createdAt: `${req?.createdAt ?? ''}`,
        updatedAt: `${req?.updatedAt ?? ''}`,
      },
      shop: {
        id: `${shop?.id ?? ''}`,
        nim: `${shop?.nim ?? req?.branch ?? ''}`,
        shopName: `${shop?.shopName ?? req?.branch ?? ''}`,
        adress1: `${shop?.adress1 ?? ''}`,
        adress2: `${shop?.adress2 ?? ''}`,
        adress3: `${shop?.adress3 ?? ''}`,
        contact1: `${shop?.contact1 ?? ''}`,
        contact2: `${shop?.contact2 ?? ''}`,
        token: `${shop?.token ?? ''}`,
        belongsTo: Boolean(shop?.belongsTo),
      },
      operator: {
        id: `${payload?.operator?.id ?? ''}`,
        operatorId: `${payload?.operator?.operatorId ?? ''}`,
        name: `${payload?.operator?.name ?? ''}`,
        createdAt: `${req?.createdAt ?? ''}`,
        updatedAt: `${req?.updatedAt ?? ''}`,
      },
      payments: (payload?.payments || []).map((payment: any) => ({
        id: `${payment?.id ?? ''}`,
        name: `${payment?.name ?? ''}`,
        amount: Number(payment?.amount ?? 0),
        currencyCode: `${payment?.curCode ?? payload?.curCode ?? ''}`,
        currencyRate: Number(payment?.curRate ?? payload?.curRate ?? 0),
        createdAt: `${req?.createdAt ?? ''}`,
      })),
      reference: `${payload?.reference ?? ''}`,
      referenceType: `${payload?.referenceType ?? ''}`,
      referenceDesc: `${payload?.referenceDesc ?? ''}`,
      cmtaCmth: `${payload?.cmta ?? ''}/${payload?.cmth ?? ''}`,
      currencyCode: `${payload?.curCode ?? ''}`,
      currencyDate: `${payload?.curDate ?? req?.createdAt ?? ''}`,
      currencyRate: Number(payload?.curRate ?? 0),
      exchangeRate: this.resolveExchangeRate(req, payload),
      exchangeRateEffectiveDate: this.resolveExchangeRateEffectiveDate(req, payload),
      prime: Number(
        responseInvoice?.grandTotal ??
          responseInvoice?.total ??
          payload?.totals?.total ??
          0
      ),
      createdAt: `${req?.createdAt ?? ''}`,
      updatedAt: `${req?.updatedAt ?? ''}`,
      invoiceResponseData: this.parseInvoiceResponseData(
        payload?.dgiEstimatedResponse,
        req?.invoiceResponseData
      ),
      finalizeInvoiceResponseData:
        req?.messageContent ?? req?.finalizeInvoiceResponseData,
      status,
      sourceRequest: req,
      requestStatus: `${req?.requestStatus ?? ''}`,
      customer: `${req?.customer ?? ''}`,
      branch: `${req?.branch ?? ''}`,
      company: `${req?.company ?? ''}`,
      typeFacture: `${
        req?.custom_edef_type_facture ??
        req?.customEdefTypeFacture ??
        payload?.type ??
        ''
      }`,
      frappeFinalizedSalesInvoice: req?.frappeFinalizedSalesInvoice,
      frappeResponseSalesInvoice: req?.frappeResponseSalesInvoice,
      dgiInvoicePayload: payload,
      messageContent: req?.messageContent,
      customEdefTypeFacture:
        req?.custom_edef_type_facture ?? req?.customEdefTypeFacture ?? '',
    };
  }

  private parseInvoiceResponseData(
    dgiEstimatedResponse?: string,
    fallbackData?: any
  ): any {
    if (fallbackData) {
      return fallbackData;
    }

    if (!dgiEstimatedResponse) {
      return undefined;
    }

    try {
      return JSON.parse(dgiEstimatedResponse);
    } catch {
      return undefined;
    }
  }

  private resolveExchangeRate(req: any, payload: any): number {
    const candidates = [
      req?.exchangeRate?.rate,
      payload?.exchangeRate?.rate,
      payload?.curRate,
      req?.payments?.[0]?.curRate,
      req?.payments?.[0]?.currencyRate,
      req?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.curRate,
      req?.frappeFinalizedSalesInvoice?.payments?.[0]?.curRate,
    ];

    for (const candidate of candidates) {
      const numeric = Number(candidate);
      if (!Number.isNaN(numeric) && numeric > 0) {
        return numeric;
      }
    }

    return 0;
  }

  private resolveExchangeRateEffectiveDate(req: any, payload: any): string {
    const candidates = [
      req?.exchangeRate?.effectiveDate,
      req?.exchangeRateEffectiveDate,
      payload?.exchangeRate?.effectiveDate,
      req?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.exchangeRate?.effectiveDate,
      req?.frappeFinalizedSalesInvoice?.exchangeRate?.effectiveDate,
      payload?.exchangeRate?.createdAt,
    ];

    for (const candidate of candidates) {
      if (candidate) {
        return `${candidate}`;
      }
    }

    return '';
  }

  private normalizeSearchValue(value: unknown): string {
    return `${value ?? ''}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }
  getAllByPeriodeAndCodeAssure() {
    // this.loading = true;
    // const user = JSON.parse(Localstore.get('USER'));
    // const dto = {
    //   dateDebut: this.periodeDto.dateDebut,
    //   dateFin: this.periodeDto.dateFin,
    //   code: user.code,
    // };
    // this.servHttp.getResponsesByPeriodeAndCodeAssure(dto).subscribe(
    //   (response) => {
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.completeCertificates = [...response];
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //     this.loading = false;
    //   }
    // );
  }
  getAllByPeriodeAndIntermediaires() {
    // this.loading = true;
    // let codes: any[] = [];
    // const perm = JSON.parse(Localstore.get('PERMISSION'));
    // let intermediairies = perm.interms;
    // codes = intermediairies.map((intermediaire: any) => {
    //   return intermediaire.code;
    // });
    // const dto = {
    //   dateDebut: this.periodeDto.dateDebut,
    //   dateFin: this.periodeDto.dateFin,
    //   codes: codes,
    // };
    // this.servHttp.getAllByPeriodeAndIntermediaires(dto).subscribe(
    //   (response) => {
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.completeCertificates = [...response];
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //     this.loading = false;
    //   }
    // );
  }
  getAllByPeriodeAndPartnerCodes() {
    // let codes: any[] = [];
    // this.loading = true;
    // const partnerCodes = JSON.parse(Localstore.get('CODES'));
    // codes = partnerCodes.map((codeP: any) => {
    //   return codeP.code;
    // });
    // const dto = {
    //   dateDebut: this.periodeDto.dateDebut,
    //   dateFin: this.periodeDto.dateFin,
    //   codes: codes,
    // };
    // this.servHttp.getAllByPeriodeAndCodes(dto).subscribe(
    //   (response) => {
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.completeCertificates = [...response];
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //     this.loading = false;
    //   }
    // );
  }
  getByImmatriculation(immatriculation: string) {
    // this.loading = true;
    // this.servHttp.getResponsesByImmatriculation(immatriculation).subscribe(
    //   (response) => {
    //     this.completeCertificates = [...response];
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //     this.loading = false;
    //   }
    // );
  }
  getByImmatriculationAndIntermediaires(immatriculation: string) {
    // this.loading = true;
    // let codes: any[] = [];
    // const perm = JSON.parse(Localstore.get('PERMISSION'));
    // let intermediairies = perm.interms;
    // codes = intermediairies.map((intermediaire: any) => {
    //   return intermediaire.code;
    // });
    // const dto = {
    //   immatriculation,
    //   codes,
    // };
    // this.servHttp.getResponsesByImmatriculationAndIntermediaires(dto).subscribe(
    //   (response) => {
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.completeCertificates = [...response];
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //     this.loading = false;
    //   }
    // );
  }
  getByImmatriculationAndPartnerCodes(immatriculation: string) {
    // let codes: any[] = [];
    // const partnerCodes = JSON.parse(Localstore.get('CODES'));
    // codes = partnerCodes.map((codeP: any) => {
    //   return codeP.code;
    // });
    // const dto = {
    //   immatriculation,
    //   codes,
    // };
    // this.servHttp.getResponsesByImmatriculationAndCodes(dto).subscribe(
    //   (response) => {
    //     this.getComputedCertificates(this.completeCertificates, response);
    //     this.completeCertificates = [...response];
    //     this.loading = false;
    //   },
    //   (error) => {
    //     console.log(error);
    //     this.loading = false;
    //   }
    // );
  }

  printForMultipleSelection(demande: Demande, type: string) {
    this.loading = true;

    let attestation = demande?.attestations?.find(
      (attestation) =>
        attestation.nature_attestation.trim().toUpperCase() ==
        type.trim().toUpperCase()
    );

    if (attestation != null) {
      this.downloadCertificatesPdf(attestation);
    } else {
      this.message.error('Aucune attestation trouvée!', 'Erreur');
    }
  }

  printMultipleCertificatesFromNas(references: any) {
    this.loading = true;
    if (references && references.length > 0)
      this.servHttp
        .getResponsesByCertificateReferencesFromNas(references)
        .subscribe(
          (response) => {
            if (response) {
              this.loading = false;
              this.downloadCertificatesPdfFromNas(response);
            } else {
              this.loading = false;
            }
          },
          (error: HttpErrorResponse) => {
            this.loading = false;
            const status: number = error.status;
            if (
              status == 409 ||
              status == 404 ||
              status == 400 ||
              status == 406 ||
              status == 503
            ) {
              // this.message.error(error.error.errorMessage, 'Info enregistrement');
            } else if (status == 401) {
              this.logout();
            } else {
              // this.message.error(
              //   "L'enregistrement du certificat a échoué. Veuillez contacter l'administrateur.",
              //   'Info enregistrement'
              // );
            }
          }
        );
  }
  printCertificat(reference: string, status: string) {
    if (!!reference && status != 'ERREUR') {
      const selectedCertificate = [];

      for (let certificate of this.completeCertificates) {
        if (
          certificate &&
          certificate.certificateReference &&
          certificate.certificateReference.indexOf(reference) != -1
        ) {
          certificate.isSelected = true;
          selectedCertificate.push(certificate);
        }
      }
      if (selectedCertificate && selectedCertificate.length > 0) {
        // this.printMultipleCertificates(this.getReferences(selectedCertificate));
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Certificat non trouvé!',
      });
    }
  }

  open(request: Demande) {
    this.selectedDemande = { ...request };

    this.attestationBrune = this.selectedDemande?.attestations.find(
      (a) => a.nature_attestation.trim().toUpperCase() == 'BRUN'
    );

    this.attestationJaune = this.selectedDemande?.attestations.find(
      (a) => a.nature_attestation.trim().toUpperCase() == 'JAUN'
    );

    this.visible_view = true;
  }
  closeView(): void {
    this.visible_view = false;
  }
  async downloadCertificatesPdf(attestation: Attestation): Promise<void> {
    this.loading = true;

    console.log('Lien PDF:', attestation.lien_pdf);

    // Ouvrir directement dans un nouvel onglet
    window.open(attestation.lien_pdf, '_blank');

    this.loading = false;
  }

  private downloadPdfFromNas(pdfBytes: Uint8Array, fileName: string): void {
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async downloadCertificatesPdfFromNas(certificates: any[]): Promise<void> {
    this.loading = true;

    if (certificates && certificates.length > 0) {
      // Création d'un nouveau PDF vide
      const mergedPdf = await PDFDocument.create();

      for (const certificate of certificates) {
        if (certificate) {
          // Décoder la chaîne Base64 en Uint8Array
          const byteArray = this.base64ToUint8Array(certificate.base64);

          // Charger le PDF à partir des bytes
          const pdf = await PDFDocument.load(byteArray);

          // Copier les pages du PDF existant dans le PDF fusionné
          const copiedPages = await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
          );
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
      }

      // Générer le fichier PDF final
      const mergedPdfBytes = await mergedPdf.save();

      // Convertir le PDF fusionné en Base64 pour le téléchargement
      const mergedBase64 = this.uint8ArrayToBase64(mergedPdfBytes);

      // Télécharger le fichier PDF fusionné
      this.downloadPdfFromNas(mergedPdfBytes, 'certificats_fusionnes.pdf');

      console.log('📄 PDF Fusionné en Base64 :', mergedBase64); // (Optionnel)
      this.loading = false;
    }
  }

  // Convertir une chaîne Base64 en Uint8Array
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    return new Uint8Array([...binaryString].map((char) => char.charCodeAt(0)));
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 8192; // On traite par blocs de 8192 octets pour éviter un dépassement de mémoire

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return window.btoa(binary);
  }

  async createPdfs(pdfs: PDFDocument[]): Promise<void> {
    // Create a new PDFDocument
    const pdfDoc = await PDFDocument.create();
    let pages = [];
    for (const pdf of pdfs) {
      const page = await pdfDoc.copyPages(pdf, pdf.getPageIndices());
      pages.push(page);
    }

    for (const page of pages) {
      pdfDoc.addPage(page[0]);
    }

    //Serialize the PDFDocument to bytes (a Uint8Array)
    const pdfBytes: Uint8Array = await pdfDoc.save();
    const pdfName: string = new Date().getTime() + '';
    this.saveByteArray(pdfName, pdfBytes);
  }
  saveByteArray(fileName: string, byteArray: Uint8Array): void {
    const file: Blob = new Blob([byteArray.buffer as ArrayBuffer], { type: 'application/pdf' });
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = window.URL.createObjectURL(file);

    const fileURL: string = URL.createObjectURL(file);

    window.open(fileURL);

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
  }
  isClient(): boolean {
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('Client');
  }
  isSuperviseur(): boolean {
    return this.servkeycloak
      .getKeycloakInstance()
      .hasResourceRole('Superviseur');
  }
  isProducteur(): boolean {
    return this.servkeycloak
      .getKeycloakInstance()
      .hasResourceRole('Producteur');
  }
  isCourtier(): boolean {
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('Courtier');
  }
  isControleur(): boolean {
    return this.servkeycloak
      .getKeycloakInstance()
      .hasResourceRole('Controleur');
  }
  isAdmin(): boolean {
    return this.servkeycloak.getKeycloakInstance().hasResourceRole('Admin');
  }
  public get Checkall(): boolean {
    return this._checkAll;
  }
  public set Checkall(value: boolean) {
    this._checkAll = value;
    // this.checkCertificates();
  }
  public get IsRiskReferenceChecked(): boolean {
    return this._isRiskReferenceChecked;
  }
  public set IsRiskReferenceChecked(value: boolean) {
    this._isRiskReferenceChecked = value;
    this.periodeAndRiskDto.riskReference = this.Immatriculation;
    if (this._isRiskReferenceChecked) {
      if (this.authService.isAdmin()) {
        this.getByImmatriculationAndIntermediaires(this.Immatriculation);
      } else if (this.authService.isProducteur()) {
        this.getByImmatriculationAndIntermediaires(this.Immatriculation);
      } else if (this.authService.isClient()) {
        // this.getByImmatriculationAndCodeAssure(this.Immatriculation);
      } else if (this.authService.isPartner()) {
        this.getByImmatriculationAndPartnerCodes(this.Immatriculation);
      }
    }
  }

  public get Immatriculation(): string {
    return this._immatriculationFilter;
  }
  public set Immatriculation(value: string) {
    this._immatriculationFilter = value;
  }

  openMsg(message: string): void {
    if (message) {
      this.modal.error({ nzTitle: "Message d'érreur", nzContent: message });
    }
  }
  initPeriodes() {
    const dateDebut = new Date();
    const dateFin = new Date();
    this.dateArray = [dateDebut, dateFin];
    this.periodeDto = { dateDebut, dateFin };
    this.periodeAndRiskDto = {
      dateDebut,
      dateFin,
      riskReference: this.Immatriculation,
    };
  }

  hasError(message: string) {
    return message == 'ERREUR';
  }
  hasErrorForPrint(message: string) {
    return message !== 'ERREUR' || 'ATTENTE';
  }
  hasNotError(message: string) {
    // return (message != 'ERREUR') || (message == 'ATTENTE')
    return ['OK', 'ATTENTE'].includes(message);
  }

  resendArcaRequest(
    numPolicy: string,
    immatriculation: string,
    codeInt: string,
    envid: string,
    numeave: number
  ) {
    this.authService.isAsking = true;
    this.envid = envid;
    const policy_number = this.extractPolicyNumber(numPolicy);
    this.getPolicyByNumPolicyAndNomAssure(
      policy_number,
      immatriculation,
      codeInt,
      numeave
    );
  }
  getPolicyByNumPolicyAndNomAssure(
    numPolicy: string,
    immatriculation: string,
    codeInt: string,
    numeave: number
  ) {
    this.policyService
      .getPolicyByNumPolcyAndCodeIntAndNumAve(numPolicy, codeInt, numeave)
      .subscribe(
        (response) => {
          this.selectedPolicy = response;
          this.getRiskByImmatriculation(immatriculation);
        },
        (error) => {
          console.log(error);
          this.authService.isAsking = false;
          this.message.error(
            "Désolé ! La police n'a pas pu être récupérée.",
            'Info demande de certificat'
          );
        }
      );
  }
  getRiskByImmatriculation(immatriculation: string) {
    this.riskService.getRiskByImmatriculation(immatriculation).subscribe(
      (response) => {
        this.selectedRisk = { ...response };
        if (this.selectedPolicy && this.selectedRisk) {
          const certificateRequestDto = {
            envid: this.envid,
            risks: [this.selectedRisk],
            policy: this.selectedPolicy,
          };
          // this.sendCertificateRequest(certificateRequestDto);
        } else {
          this.authService.isAsking = false;
          this.message.error(
            'Désolé ! Les données liées à cette demande ne sont pas disponibles.',
            'Info enregistrement'
          );
        }
      },
      (error) => {
        this.authService.isAsking = false;
        this.message.error(
          'Désolé ! Les données liées à cette demande ne sont pas disponibles.',
          'Info enregistrement'
        );
      }
    );
  }
  extractPolicyNumber(numPolicy: string) {
    const index = numPolicy.indexOf('-');
    return numPolicy.substring(index + 1);
  }
  printDGIInvoice(transaction: any) {
    this.openSfecInvoicePdf(transaction);
  }

  async openSfecInvoicePdf(transaction: any): Promise<void> {
    const openedTab = window.open('about:blank', '_blank');
    if (!openedTab) {
      this.message.warning(
        "Le navigateur a bloqué l'ouverture de l'onglet. Veuillez autoriser les popups.",
        'Facture PDF'
      );
      return;
    }

    try {
      openedTab.document.write(
        '<p style="font-family:sans-serif;padding:24px;color:#334155;">Chargement de la facture PDF...</p>'
      );

      let url = extractQrCodeUrl(transaction?.qrCode);

      if (!isOpenableHttpUrl(url) && transaction?.qrCode) {
        const embedded = toEmbeddedImageDataUrl(normalizeQrCodeRaw(transaction.qrCode));
        if (embedded) {
          const decoded = await decodeQrPayloadUrlFromDataUrl(embedded);
          url = isOpenableHttpUrl(decoded) ? decoded : extractQrCodeUrl(decoded);
        } else {
          const rendered = await renderQrCodeImage(transaction.qrCode, 256);
          url = rendered?.payloadUrl || null;
        }
      }

      if (!isOpenableHttpUrl(url)) {
        openedTab.close();
        this.message.warning(
          "Impossible d'extraire le lien PDF depuis le QR code SFEC.",
          'Facture PDF'
        );
        return;
      }

      openedTab.location.href = url!;
    } catch (error) {
      openedTab.close();
      console.log(error);
      this.message.error("Impossible d'ouvrir la facture PDF.", 'Facture PDF');
    }
  }


  private buildFrontendInvoiceData(invoice: Invoice, request: any): any {
    const now = new Date();

    const unitPrice = request?.items?.[0]?.rate + (request?.frappeFinalizedSalesInvoice?.payment_schedule?.[0]?.discount_amount || 0);

    const remise = request?.frappeFinalizedSalesInvoice?.payment_schedule?.[0]?.discount_amount || 0;
    const ts = Number(request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.items?.[0]?.taxSpecificAmount).toFixed(2);;
    const totalHt = Number(request?.frappeFinalizedSalesInvoice?.base_net_total).toFixed(2);
    const totalTva = Number(request?.frappeFinalizedSalesInvoice?.taxes[0]?.tax_amount || 0).toFixed(2);
    const totalTtc = Number(request?.frappeFinalizedSalesInvoice?.base_net_total + request?.frappeFinalizedSalesInvoice?.taxes[0]?.tax_amount || 0);
    const exchangeRate = this.resolveExchangeRateFromRequest(request);
    const amountUsd = exchangeRate > 0 ? totalTtc / exchangeRate : 0;
    const montantEnLettres = this.capitalizeFirstChar(
      this.utilService.numberToFrenchWords(totalTtc)
    );



    // const unitPrice=2000

    return {
      typeFactureLabel:
        request?.customEdefTypeFacture || request?.frappeResponseSalesInvoice?.customEdefTypeFacture || 'FACTURE DE VENTE',
      versionLabel: 'ORIGINAL',
      numeroFacture: request?.frappeFinalizedSalesInvoice?.name,
      dateFacture: invoice?.dateEncaissement || now,
      isfSfe: request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.isf,
      company: request?.company,
      pointVente: request.branch,
      nifCompany: request?.frappeFinalizedSalesInvoice.dgiInvoicePayload?.nif,
      operator: request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.operator?.name,
      clientType: request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.client?.typeDesc,
      clientName: request?.customer,
      clientNif: request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.client?.nif || '-',
      clientAddress: request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.client?.address || '-',
      article: request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.items?.[0]?.name,
      qty: request?.totalQty,
      unite: request?.stockUom,
      pu: unitPrice,
      remise: remise,
      ts: ts,
      totalHt,
      totalTtc,
      totalTva,
      codeDefDgi:
        request?.messageContent?.codeDEFDGI,
      defNid:
        request?.messageContent?.nim,
      compteurDef:
        request?.messageContent?.counters,
      heureDef: request?.messageContent?.dateTime || now,
      qrCodeValue: request?.messageContent?.qrCode || '',
      // isfSfe: request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.isf,
      taxRows: [
        {
          groupe: request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.items?.[0]?.taxGroup,
          libelle: request?.frappeFinalizedSalesInvoice?.items?.[0]?.item_tax_template,
          base: totalHt,
          montant: request?.frappeFinalizedSalesInvoice?.taxes[0]?.tax_amount || 0,
        },
      ],
      paymentRows: [
        {
          mode: request?.frappeFinalizedSalesInvoice?.payment_schedule?.[0]?.custom_edef_mode_of_payment,
          echeance: now,
          montant: totalTtc,
        },
      ],
      remarque: 'Aucune Remarque',
      montantEnLettres,
      exchangeRate,
      amountUsd,
    };
  }

  private async generateInvoicePdfBlob(data: any): Promise<Blob> {
    console.log('---------------data-----------');
    console.log(data);
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const left = 16;
    const right = pageW - 16;
    let y = 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(data.typeFactureLabel, 20, y);
    doc.text(data.versionLabel, right, y, { align: 'right' });
    doc.setDrawColor(70, 70, 70);
    doc.line(left, y + 3, right, y + 3);
    y += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.7);
    doc.text(`Numéro de facture — ${data.numeroFacture}`, 20, y);
    doc.text(`Date — ${this.formatDate(data.dateFacture)}`, 102, y);
    doc.text(`ISF/SFE — ${data.isfSfe}`, 150, y);
    doc.setDrawColor(210, 210, 210);
    doc.line(left, y + 3, right, y + 3);
    y += 9;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text((data.company).toUpperCase(), 20, y);
    doc.text('CLIENT', 102, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.3);
    y += 4;
    doc.text(`Point de vente : ${data.pointVente}`, 20, y);
    doc.text(`Type: ${data.clientType}`, 102, y);
    y += 4;
    doc.text(`NIF : ${data.nifCompany}`, 20, y);
    doc.text(`Nom: ${data.clientName}`, 102, y);
    y += 4;
    doc.text(`Opérateur : ${data.operator}`, 20, y);
    doc.text(`NIF: ${data.clientNif}`, 102, y);
    y += 4;
    doc.text(`Adresse: -`, 20, y);
    doc.text(`Adresse: ${data.clientAddress}`, 102, y);
    doc.setDrawColor(210, 210, 210);
    doc.line(left, y + 3, right, y + 3);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.2);
    doc.text('DÉTAILS DES ARTICLES', 20, y);
    y += 2;

    const itemTotal = Number(data.totalHt || data.totalTtc || 0);
    autoTable(doc, {
      startY: y + 1,
      margin: { left, right: left },
      theme: 'grid',
      head: [['#', 'Désignation', 'Qté', 'Unité', 'PU (HT)', 'Remise (PU)', 'Montant T.S.', 'Total (HT) CDF']],
      body: [[
        '1',
        data.article,
        `${data.qty || 1}`,
        data.unite || 'Nos',
        this.formatMoney(data.pu),
        this.formatMoney(data.remise || 0),
        this.formatMoney(data.ts || 0),
        this.formatMoney(itemTotal),
      ]],
      foot: [['', '', '', '', '', '', 'TOTAL HT EN CDF :', this.formatMoney(itemTotal)]],
      styles: { fontSize: 8, cellPadding: 1.8, lineColor: [215, 215, 215], lineWidth: 0.18 },
      headStyles: { fillColor: [245, 245, 245], textColor: [17, 24, 39], fontStyle: 'bold' },
      footStyles: { fillColor: [255, 255, 255], textColor: [17, 24, 39], fontStyle: 'bold' },
      columnStyles: { 2: { halign: 'center' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' } },
      didParseCell: (hookData: any) => this.alignNumericCellsRight(hookData),
    });

    y = ((doc as any).lastAutoTable?.finalY || y + 20) + 8;
    const securityTitleY = y;
    const leftColX = left;
    const leftColW = 84;
    const rightColX = leftColX + leftColW + 6;
    const rightColW = right - rightColX;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.7);
    doc.text('--- ÉLÉMENTS DE SÉCURITÉ DE LA FACTURE NORMALISÉE ---', leftColX, securityTitleY);
    doc.text('VENTILATION DES TAXES PAR GROUPE', rightColX, securityTitleY);

    const securityContentY = securityTitleY + 5.5;
    const qrSize = 24;
    const qrX = leftColX;
    const qrY = securityContentY + 1;
    const infoX = qrX + qrSize + 4;
    const infoMaxW = leftColW - (infoX - leftColX);

    const qrCodeValue = `${data?.qrCodeValue || ''}`.trim();

    if (qrCodeValue) {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeValue, {
          errorCorrectionLevel: 'M',
          margin: 0,
          width: 256,
        });
        doc.addImage(qrCodeDataUrl, 'PNG', qrX + 0.8, qrY + 0.8, qrSize - 1.6, qrSize - 1.6);
      } catch (qrError) {
        console.log('Erreur de génération du QR code:', qrError);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.text('QR', qrX + qrSize / 2, qrY + qrSize / 2 + 1.5, { align: 'center' });
      }
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.8);
      doc.text('QR indisponible', qrX + qrSize / 2, qrY + qrSize / 2 + 1.2, { align: 'center' });
    }

    let infoY = securityContentY + 2.8;
    doc.setFontSize(6.8);

    // Valeur du Code DEF/DGI volontairement sur la ligne du dessous.
    doc.setFont('helvetica', 'bold');
    doc.text('Code DEF/DGI:', infoX, infoY);
    infoY += 3.2;
    doc.setFont('helvetica', 'normal');
    const codeDefLines = doc.splitTextToSize(`${data.codeDefDgi || '-'}`, infoMaxW);
    doc.text(codeDefLines, infoX, infoY);
    infoY += codeDefLines.length * 2.9 + 0.8;

    const securityRows = [
      `DEF NID: ${data.defNid || '-'}`,
      `Compteurs DEF: ${data.compteurDef || '-'}`,
      `Heure DEF: ${this.formatDateTime(data.heureDef)}`,
    ];
    securityRows.forEach((line) => {
      const chunks = doc.splitTextToSize(line, infoMaxW);
      doc.text(chunks, infoX, infoY);
      infoY += chunks.length * 2.9;
    });

    autoTable(doc, {
      startY: securityContentY,
      margin: { left: rightColX, right: left },
      tableWidth: rightColW,
      theme: 'grid',
      head: [['Groupe', 'Libellé', 'Base', 'Montant Tax']],
      body: (data.taxRows || []).map((r: any) => [r.groupe, r.libelle, this.formatMoney(r.base), this.formatMoney(r.montant)]),
      foot: [['', 'TOTAL TAXES', '', this.formatMoney(data.totalTva || 0)]],
      styles: { fontSize: 6.8, cellPadding: 1.4, lineColor: [215, 215, 215], lineWidth: 0.18 },
      headStyles: { fillColor: [245, 245, 245], textColor: [17, 24, 39], fontStyle: 'bold', fontSize: 6.8 },
      footStyles: { fillColor: [255, 255, 255], textColor: [17, 24, 39], fontStyle: 'bold', fontSize: 6.9 },
      columnStyles: {
        0: { cellWidth: 14 },
        1: { cellWidth: 24 },
        2: { cellWidth: 20, halign: 'right' },
        3: { cellWidth: 22, halign: 'right' },
      },
      didParseCell: (hookData: any) => this.alignNumericCellsRight(hookData),
    });

    const taxTableEndY = (doc as any).lastAutoTable?.finalY || securityContentY + 24;
    const leftBlockEndY = Math.max(qrY + qrSize, infoY + 1);
    y = Math.max(taxTableEndY, leftBlockEndY) + 8;
    doc.setDrawColor(220, 220, 220);
    doc.line(left, y - 4, right, y - 4);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total TTC:`, 20, y);
    doc.text(`${this.formatMoney(data.totalTtc)} CDF`, right, y, { align: 'right' });
    y += 4;
    doc.text(`Ajustement d'arrondi:`, 20, y);
    doc.text(`0.0 CDF`, right, y, { align: 'right' });
    y += 6;
    doc.text(`TOTAL TVA : ${this.formatMoney(data.totalTva)} CDF`, right, y, { align: 'right' });
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL TTC : ${this.formatMoney(data.totalTtc)} CDF`, right, y, { align: 'right' });
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`Arrêté la présente facture à la somme de :`, 20, y);
    y += 4;
    doc.setFont('helvetica', 'normal');
    doc.text(data.montantEnLettres, 20, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(
      `Banque Centrale du Congo : 1 USD = ${this.formatExchangeRate(data.exchangeRate)} CDF`,
      20,
      y
    );
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text(`Montant en USD : ${this.formatUsdAmount(data.amountUsd)}`, 20, y);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text('MODES DE PAIEMENT', left, y);
    autoTable(doc, {
      startY: y + 2,
      margin: { left: left, right: left },
      theme: 'grid',
      head: [['Mode de paiement', "Date d'échéance", 'Montant (CDF)']],
      body: (data.paymentRows || []).map((p: any) => [p.mode, this.formatDate(p.echeance), this.formatMoney(p.montant)]),
      styles: { fontSize: 8, cellPadding: 2, lineColor: [215, 215, 215], lineWidth: 0.18 },
      headStyles: { fillColor: [245, 245, 245], textColor: [17, 24, 39], fontStyle: 'bold' },
      columnStyles: { 2: { halign: 'right' } },
      didParseCell: (hookData: any) => this.alignNumericCellsRight(hookData),
    });

    const paymentTableEndY = (doc as any).lastAutoTable?.finalY || y + 20;
    y = paymentTableEndY + 8;

    doc.setDrawColor(190, 190, 190);
    doc.rect(left, y, right - left, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(data.remarque || 'Aucune Remarque', left + 4, y + 11);

    return doc.output('blob');
  }

  private formatMoney(value: number): string {
    const formatted = Number(value || 0).toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    // jsPDF peut mal rendre les espaces insécables (NBSP/NNBSP) en caractères inattendus.
    return formatted.replace(/[\u00A0\u202F]/g, ' ');
  }

  private capitalizeFirstChar(value: string): string {
    if (!value) {
      return '';
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private resolveExchangeRateFromRequest(request: any): number {
    const candidates = [
      request?.exchangeRate?.rate,
      request?.dgiInvoicePayload?.exchangeRate?.rate,
      request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.exchangeRate?.rate,
      request?.frappeFinalizedSalesInvoice?.dgiInvoicePayload?.curRate,
      request?.dgiInvoicePayload?.curRate,
      request?.payments?.[0]?.curRate,
    ];

    for (const candidate of candidates) {
      const numeric = Number(candidate);
      if (!Number.isNaN(numeric) && numeric > 0) {
        return numeric;
      }
    }

    return 0;
  }

  private formatDate(value: any): string {
    const date = new Date(value);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('fr-FR');
  }

  private formatDateTime(value: any): string {
    if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(value.trim())) {
      return value;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? '-' : date.toLocaleString('fr-FR');
  }

  private formatExchangeRate(value: number): string {
    if (!value || !Number.isFinite(value)) {
      return '-';
    }

    const formatted = value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    });

    return formatted.replace(/[\u00A0\u202F]/g, ' ');
  }

  private formatUsdAmount(value: number): string {
    if (!Number.isFinite(value)) {
      return '-';
    }

    const formatted = value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    });

    return formatted.replace(/[\u00A0\u202F]/g, ' ');
  }

  private alignNumericCellsRight(hookData: any): void {
    if (!hookData || hookData.section === 'head') {
      return;
    }

    const cellText = `${hookData.cell?.raw ?? hookData.cell?.text?.join('') ?? ''}`.trim();
    if (!cellText) {
      return;
    }

    // Keep all numeric values visually aligned in the same direction.
    if (this.isNumericLike(cellText)) {
      hookData.cell.styles.halign = 'right';
    }
  }

  private isNumericLike(value: string): boolean {
    const normalized = value
      .replace(/[ \u00A0\u202F]/g, '')
      .replace(/,/g, '.');

    return /^-?\d+(\.\d+)?$/.test(normalized);
  }

  closePrintPreview(): void {
    this.visible_print_preview = false;
    this.revokePreviewPdfUrl();
  }

  zoomInPreview(): void {
    if (!this.previewPdfBlobUrl) {
      return;
    }
    this.previewZoom = Math.min(200, this.previewZoom + 10);
  }

  zoomOutPreview(): void {
    if (!this.previewPdfBlobUrl) {
      return;
    }
    this.previewZoom = Math.max(40, this.previewZoom - 10);
  }

  resetPreviewZoom(): void {
    if (!this.previewPdfBlobUrl) {
      return;
    }
    this.previewZoom = 60;
  }

  downloadPreviewPdf(): void {
    if (!this.previewPdfBlobUrl) {
      return;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = this.previewPdfBlobUrl;
    downloadLink.download = this.previewPdfFileName || 'facture.pdf';
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  private revokePreviewPdfUrl(): void {
    if (this.previewPdfBlobUrl) {
      window.URL.revokeObjectURL(this.previewPdfBlobUrl);
      this.previewPdfBlobUrl = null;
      this.previewPdfUrl = null;
    }
  }

  private updatePreviewPdfUrl(): void {
    if (!this.previewPdfBlobUrl) {
      this.previewPdfUrl = null;
      return;
    }
    const iframePdfUrl = `${this.previewPdfBlobUrl}#toolbar=0&navpanes=0&scrollbar=0&view=Fit&zoom=100`;
    this.previewPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(iframePdfUrl);
  }

  file(data: any, cle: string) {
    let blob = new Blob([data], { type: 'application/pdf' });
    let pdfUrl = window.URL.createObjectURL(blob);

    var PDF_link = document.createElement('a');
    PDF_link.href = pdfUrl;
    // TO OPEN PDF ON BROWSER IN NEW TAB
    const pwa = window.open(pdfUrl, '_blank');
    // TO DOWNLOAD PDF TO YOUR COMPUTER

    const file_name = `FACTURE_${cle}.pdf`;
    PDF_link.download = file_name;
    PDF_link.click();

    console.log(pwa);

    // if (!pwa || pwa.closed || typeof pwa.closed === 'undefined') {
    //   this.messageService.error(
    //     "Le téléchargement de la facture n'a pas abouti. Veuillez vérifier si votre navigateur l'autorise.",
    //     'Info téléchargement'
    //   );
    // } else {
    this.message.success(
      'La facture  a été téléchargée avec succes.',
      'Info téléchargement'
    );
    // }
  }
  // Méthode utilitaire pour télécharger le PDF
  private downloadPdf(pdfUrl: string, cle: string): void {
    const downloadLink = document.createElement('a');
    downloadLink.href = pdfUrl;
    downloadLink.download = `FACTURE_${cle}.pdf`;
    downloadLink.style.display = 'none';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Nettoyer l'URL après téléchargement
    setTimeout(() => {
      window.URL.revokeObjectURL(pdfUrl);
    }, 1000);
  }

  // Méthode pour valider le Base64
  private isValidBase64(str: string): boolean {
    try {
      // Vérifier le format Base64
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
      if (!base64Regex.test(str)) {
        return false;
      }

      // Essayer de décoder
      window.atob(str);
      return true;
    } catch (e) {
      return false;
    }
  }
  extractBeforeDash(input: string): string {
    const index = input.indexOf('-');
    return index !== -1 ? input.substring(0, index) : input;
  }

  moreInformations(transaction: Transaction) {
    this.selectedTransaction = { ...transaction };
    console.log(this.selectedTransaction);

    this.visible_view = true;
  }
}
