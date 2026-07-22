import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  faPrint,
  faInfoCircle,
  faEye,
  faSearch,
  faPlay,
  faArrowCircleUp,
} from '@fortawesome/free-solid-svg-icons';
import { Localstore } from 'src/app/services/store/local.store';
import { IntermediaireService } from 'src/app/services/intermediaire.service';
import { IntermediaireItem } from 'src/app/dto/IntermediaireItem';
import { AuthService } from 'src/app/services/auth.service';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { Invoice } from 'src/app/dto/Invoice';
import { SfecCertificationResponse } from 'src/app/dto/SfecCertificationResponse';
import { InvoiceService } from 'src/app/services/invoice.service';
import { PeriodeDto } from 'src/app/dto/PeriodeDto';
import { FrappeSalesInvoiceRequestService } from 'src/app/services/frappe-sales-invoice-request.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { finalize } from 'rxjs/operators';
import { UtilService } from 'src/app/utils/utils.service';
import {
  decodeQrPayloadUrlFromDataUrl,
  downloadDataUrl,
  extractQrCodeUrl,
  isOpenableHttpUrl,
  normalizeQrCodeRaw,
  QR_CODE_PREVIEW_WIDTH,
  QR_CODE_TABLE_WIDTH,
  renderQrCodeImage,
  toEmbeddedImageDataUrl,
} from 'src/app/utils/qr-code.util';


@Component({
  selector: 'app-Invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
})
export class InvoiceListComponent implements OnInit {
  loading = false;
  isInvoiceRequestLoading = false;
  invoices?: Invoice[];
  policySearchText = '';
  dateArray = [];
  pageSize = 10;
  pageIndex = 1;
  listOfColumns: Invoice[] = [];
  private _numInvoice: string = '';
  validateForm_search!: FormGroup;
  visible_view = false;
  visible_print_preview = false;
  selectedInvoice?: any = {};
  printPreviewData: any = null;
  previewPdfUrl: SafeResourceUrl | null = null;
  previewPdfBlobUrl: string | null = null;
  previewPdfFileName = '';
  previewZoom = 60;
  isInit = false;
  previousUrl?: string;
  size: 'large' | 'small' | 'default' = 'default';
  canClose?: boolean;
  faPrint = faPrint;
  faInfo = faInfoCircle;
  faEye = faEye;
  faSearch = faSearch;
  selectedInterm: any;
  faPlay = faPlay;
  faArrow = faArrowCircleUp;
  userIntermediairies?: any[];
  validateForm!: FormGroup;
  intermediairies: IntermediaireItem[] = [];
  periodeDto: any;
  qrCodeImages: Record<string, string> = {};
  qrCodePreviewImages: Record<string, string> = {};
  qrCodeDisplayTexts: Record<string, string> = {};
  qrInvoicePdfUrls: Record<string, string> = {};
  isOpeningQrPdf = false;
  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private frappeSalesInvoiceRequestService: FrappeSalesInvoiceRequestService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private messageService: MessageDialogService,
    private intermediaryService: IntermediaireService, // private authService: AuthService
    private utilService: UtilService
  ) { }

  ngOnInit(): void {
    this.invoiceService.invoiceFilterText = '';
    this.initPeriodes();

    this.userIntermediairies = JSON.parse(
      Localstore.get('USER')
    )?.intermediairies?.map((uinterm: any) => uinterm.interm);

    this.validateForm_search = this.fb.group({
      word_search: [null, [Validators.required]],
      code_interm: [null, [Validators.required]],
      numero_avenant: [null, [Validators.required]],
    });
    this.validateForm = this.fb.group({
      date_search: [null],
      date: [null],
    });
    this.getIntermediaires();
    this.getAll()
  }
  onChange(value: any) {



    if (value && value.length > 0) {
      this.periodeDto.dateDebut = value[0];
      this.periodeDto.dateFin = value[1];
    } else {
      this.initPeriodes();
    }
  }
  getAll() {

    console.log(this.periodeDto);

    this.getInvoices(this.periodeDto);
  }

  applyPolicySearch(): void {
    this.policySearchText = (this.policySearchText || '').trim();

    if (!this.policySearchText) {
      this.getAll();
      return;
    }

    this.loading = true;
    this.invoiceService
      .searchInvoicesByReference(this.policySearchText)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (response) => {
          this.invoices = [...(response || [])];
          this.refreshQrCodeImages(this.invoices);
        },
        (error) => {
          this.invoices = [];
          this.messageService.error(
            error?.error?.errorMessage || 'Erreur lors de la recherche des polices.',
            'Recherche de polices'
          );
        }
      );
  }

  resetSearch(): void {
    this.policySearchText = '';
    this.dateArray = [];
    this.validateForm.patchValue({ date: null });
    this.initPeriodes();
    this.getAll();
  }

  get filteredInvoices(): Invoice[] {
    const source = this.invoices ?? [];
    const query = (this.policySearchText || '').trim().toLowerCase();

    if (!query) {
      return source;
    }

    return source.filter((invoice) => {
      const intermediaire = `${invoice.codeInte ?? ''}`.toLowerCase();
      const police = `${invoice.numePoli ?? ''}`.toLowerCase();
      const avenant = `${invoice.numeAven ?? ''}`.toLowerCase();
      const combined = `${intermediaire}-${police}-${avenant}`;

      return (
        intermediaire.includes(query) ||
        police.includes(query) ||
        avenant.includes(query) ||
        combined.includes(query)
      );
    });
  }

  moreClient(value: string) {
    this.router.navigate(['home/certificat-client/certificats', value]);
  }
  checkForm() {
    let isValid: boolean = true;
    if (this.validateForm_search.valid) {
      return true;
    } else {
      Object.values(this.validateForm_search.controls).forEach((control) => {
        if (control.invalid) {
          isValid = false;
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return isValid;
    }
  }
  getPoliciesByNumInvoice() {
    let codeint = parseInt(
      this.validateForm_search.value.code_interm.toString().trim()
    );
    let numeave = parseInt(
      this.validateForm_search.value.numero_avenant.toString().trim()
    );

    this.loading = true;
    this.invoiceService.invoiceFilterText =
      this.validateForm_search.value.word_search;
    let InvoiceNumber = this.validateForm_search.value.word_search;

    if (
      numeave != null &&
      codeint != null &&
      this.invoiceService.invoiceFilterText.toString() != ''
    ) {
      this.getPoliciesForAdminByNumInvoice(codeint, numeave, InvoiceNumber);
    } else {
      this.loading = false;
      this.messageService.warning(
        'Veuillez renseigner toutes les informtions',
        'Avertissement Info !'
      );
    }
  }

  refresh() {
    this.NumInvoice = '';
    this.invoiceService.pageIndex = 0;
    this.invoiceService.pageSize = 0;
    this.pageIndex = 1;
    this.pageSize = 10;
    this.invoiceService.invoiceFilterText = '';
  }

  open(cle: string) {
    this.visible_view = true;
    this.selectedInvoice = this.invoices?.filter(
      (Invoice: Invoice) => Invoice.cle === cle
    )[0];
  }

  closeDrawer(): void {
    this.visible_view = false;
  }

  moreInformations(invoice: Invoice) {
    this.invoiceService.pageIndex = this.pageIndex;
    this.invoiceService.pageSize = this.pageSize;
    this.selectedInvoice = { ...invoice };
    this.visible_view = true;
    this.ensureDrawerQrImage(invoice);
  }

  isClicked() {
    if (!this.isInit) this.isInit = true;
  }
  setUpTextFilter() {
    this.invoiceService.invoiceFilterText = this.NumInvoice;
  }

  public get NumInvoice(): string {
    if (this._numInvoice == 'undefined') this._numInvoice = '';
    return this._numInvoice.trim();
  }
  public set NumInvoice(filter: string) {
    this._numInvoice = filter;
    this.canClose = this._numInvoice !== '';
    this.invoiceService.invoiceFilterText = this.NumInvoice;
  }

  initFilter() {
    this.NumInvoice = '';
  }

  getInvoices(periodeDto: PeriodeDto) {
    this.loading = true;
    this.invoices = [];
    console.log(periodeDto);

    this.invoiceService
      .getAll(periodeDto)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (reponse) => {
          console.log(reponse);
          this.invoices = Array.isArray(reponse) ? [...reponse] : [];
          this.refreshQrCodeImages(this.invoices);
        },
        (error: any) => {
          this.invoices = [];
          console.log(error);
        }
      );
    this.invoiceService.pageIndex = 0;
  }

  getPoliciesForAdminByNumInvoice(
    codeint: number,
    numeave: number,
    Invoicenumber: string
  ) {
    this.loading = true;
    this.invoiceService
      .getPoliciesByNumPolcy(codeint, numeave, Invoicenumber)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe(
        (reponse) => {
          console.log(reponse);
          this.invoices = Array.isArray(reponse) ? [...reponse] : [];
          this.refreshQrCodeImages(this.invoices);
        },
        (error) => {
          this.invoices = [];
          console.log(error);
        }
      );
  }

  getIntermediaires() {
    this.intermediaryService.getAll().subscribe(
      (response) => {
        this.intermediairies = [...response];
      },
      (error) => {
        console.log(error);
      }
    );
  }

  printDGIInvoice(invoice: Invoice) {
    this.openQrInvoicePdf(invoice);
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
        const rendered = await renderQrCodeImage(qrCodeValue, 512);
        const qrCodeDataUrl = rendered?.dataUrl;
        if (qrCodeDataUrl) {
          doc.addImage(qrCodeDataUrl, 'PNG', qrX + 0.8, qrY + 0.8, qrSize - 1.6, qrSize - 1.6);
        }
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
    this.messageService.success(
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

  isNormalized(invoice: Invoice): boolean {
    if (!invoice) {
      return false;
    }

    if (invoice.status === '1' || invoice.status === 'CERTIFIED') {
      return true;
    }

    return !!this.getQrCodeValue(invoice);
  }

  getQrCodeRaw(invoice: Invoice): string {
    return normalizeQrCodeRaw(invoice?.sfec_response?.qr_code);
  }

  getQrCodeValue(invoice: Invoice): string {
    if (invoice?.cle && this.qrCodeDisplayTexts[invoice.cle]) {
      return this.qrCodeDisplayTexts[invoice.cle];
    }

    return this.getQrCodeRaw(invoice);
  }

  hasQrCodeImage(invoice: Invoice): boolean {
    return !!invoice?.cle && !!this.qrCodeImages[invoice.cle];
  }

  getQrCodeDisplayState(invoice: Invoice): 'ready' | 'not_certified' | 'unavailable' | 'failed' {
    if (invoice?.status === 'FAILED') {
      return 'failed';
    }

    if (this.hasQrCodeImage(invoice)) {
      return 'ready';
    }

    if (this.isNormalized(invoice)) {
      return 'unavailable';
    }

    return 'not_certified';
  }

  getNormalizationStatusLabel(invoice: Invoice): string {
    if (invoice?.status === 'FAILED') {
      return 'Échec SFEC';
    }

    if (this.isNormalized(invoice)) {
      return 'Normalisée';
    }

    return 'Non normalisée';
  }

  getNormalizationTagColor(invoice: Invoice): string {
    if (invoice?.status === 'FAILED') {
      return 'error';
    }

    if (this.isNormalized(invoice)) {
      return 'success';
    }

    return 'default';
  }

  getNormalizationIcon(invoice: Invoice): string {
    if (invoice?.status === 'FAILED') {
      return 'close-circle';
    }

    if (this.isNormalized(invoice)) {
      return 'check-circle';
    }

    return 'clock-circle';
  }

  getDrawerQrImage(invoice: Invoice): string | null {
    if (!invoice?.cle) {
      return null;
    }

    return this.qrCodePreviewImages[invoice.cle] || this.qrCodeImages[invoice.cle] || null;
  }

  downloadDrawerQr(invoice: Invoice): void {
    const image = this.getDrawerQrImage(invoice);
    if (!image || !invoice?.cle) {
      return;
    }

    downloadDataUrl(image, `QR_${invoice.cle}.png`);
  }

  getQrInvoicePdfUrl(invoice: Invoice): string | null {
    if (invoice?.cle && this.qrInvoicePdfUrls[invoice.cle]) {
      return this.qrInvoicePdfUrls[invoice.cle];
    }

    return extractQrCodeUrl(this.getQrCodeRaw(invoice));
  }

  canOpenQrInvoicePdf(invoice: Invoice): boolean {
    return !!this.getQrCodeRaw(invoice) || !!this.getDrawerQrImage(invoice);
  }

  async openQrInvoicePdf(invoice: Invoice): Promise<void> {
    if (this.isOpeningQrPdf) {
      return;
    }

    // Ouvrir l'onglet synchrone au clic (évite le bloqueur de popups après await).
    const openedTab = window.open('about:blank', '_blank');
    if (!openedTab) {
      this.messageService.warning(
        "Le navigateur a bloqué l'ouverture de l'onglet. Veuillez autoriser les popups.",
        'Facture PDF'
      );
      return;
    }

    this.isOpeningQrPdf = true;
    try {
      openedTab.document.write(
        '<p style="font-family:sans-serif;padding:24px;color:#334155;">Chargement de la facture PDF...</p>'
      );

      let url = this.getQrInvoicePdfUrl(invoice);

      if (!isOpenableHttpUrl(url)) {
        const raw = this.getQrCodeRaw(invoice);
        let image = this.getDrawerQrImage(invoice);

        if (!image && raw) {
          const embedded = toEmbeddedImageDataUrl(raw);
          if (embedded) {
            image = embedded;
          } else {
            const rendered = await renderQrCodeImage(raw, QR_CODE_PREVIEW_WIDTH);
            image = rendered?.dataUrl || null;
            if (rendered?.payloadUrl && isOpenableHttpUrl(rendered.payloadUrl)) {
              url = rendered.payloadUrl;
            }
          }
        }

        if (!isOpenableHttpUrl(url) && image) {
          const decoded = await decodeQrPayloadUrlFromDataUrl(image);
          if (invoice?.cle && decoded) {
            if (isOpenableHttpUrl(decoded)) {
              url = decoded;
              this.qrInvoicePdfUrls = {
                ...this.qrInvoicePdfUrls,
                [invoice.cle]: decoded,
              };
            } else {
              url = extractQrCodeUrl(decoded);
            }
          }
        }
      }

      if (!isOpenableHttpUrl(url)) {
        openedTab.close();
        this.messageService.warning(
          "Impossible d'extraire le lien PDF depuis le QR code SFEC.",
          'Facture PDF'
        );
        return;
      }

      openedTab.location.href = url!;
    } catch (error) {
      openedTab.close();
      console.log('Erreur ouverture facture PDF:', error);
      this.messageService.error(
        "Impossible d'ouvrir la facture PDF.",
        'Facture PDF'
      );
    } finally {
      this.isOpeningQrPdf = false;
    }
  }

  private async ensureDrawerQrImage(invoice: Invoice): Promise<void> {
    const raw = this.getQrCodeRaw(invoice);
    if (!raw || !invoice?.cle) {
      return;
    }

    if (this.qrCodePreviewImages[invoice.cle] && this.qrInvoicePdfUrls[invoice.cle]) {
      return;
    }

    try {
      const rendered = await renderQrCodeImage(raw, QR_CODE_PREVIEW_WIDTH);
      if (rendered?.dataUrl) {
        this.qrCodePreviewImages = {
          ...this.qrCodePreviewImages,
          [invoice.cle]: rendered.dataUrl,
        };
      }
      if (rendered?.payloadUrl && isOpenableHttpUrl(rendered.payloadUrl)) {
        this.qrInvoicePdfUrls = {
          ...this.qrInvoicePdfUrls,
          [invoice.cle]: rendered.payloadUrl,
        };
      }
      if (rendered?.displayText) {
        this.qrCodeDisplayTexts = {
          ...this.qrCodeDisplayTexts,
          [invoice.cle]: rendered.displayText,
        };
      }
    } catch (error) {
      console.log('Erreur de génération du QR code drawer:', error);
    }
  }

  getQrCodeTooltip(invoice: Invoice): string {
    switch (this.getQrCodeDisplayState(invoice)) {
      case 'not_certified':
        return 'Normalisez cet encaissement pour obtenir le QR code SFEC';
      case 'unavailable':
        return 'Facture certifiée, mais le QR code n\'est pas disponible';
      case 'failed':
        return 'La certification SFEC a échoué pour cet encaissement';
      default:
        return 'Facture normalisée — ouvrez les détails pour voir le QR code';
    }
  }

  getQrCodeStatusLabel(invoice: Invoice): string {
    switch (this.getQrCodeDisplayState(invoice)) {
      case 'ready':
        return 'Certifié';
      case 'unavailable':
        return 'QR indisponible';
      case 'failed':
        return 'Échec SFEC';
      default:
        return 'Non certifié';
    }
  }

  getQrCodeTagColor(invoice: Invoice): string {
    switch (this.getQrCodeDisplayState(invoice)) {
      case 'ready':
        return 'success';
      case 'unavailable':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  }

  private async refreshQrCodeImages(invoices: Invoice[] = []): Promise<void> {
    const nextImages: Record<string, string> = { ...this.qrCodeImages };
    const nextTexts: Record<string, string> = { ...this.qrCodeDisplayTexts };
    const nextPdfUrls: Record<string, string> = { ...this.qrInvoicePdfUrls };

    for (const invoice of invoices) {
      const qrCodeValue = this.getQrCodeRaw(invoice);
      if (!qrCodeValue || !invoice.cle) {
        continue;
      }

      try {
        const rendered = await renderQrCodeImage(qrCodeValue, QR_CODE_TABLE_WIDTH);
        if (rendered?.dataUrl) {
          nextImages[invoice.cle] = rendered.dataUrl;
          nextTexts[invoice.cle] = rendered.displayText;
        }
        if (rendered?.payloadUrl && isOpenableHttpUrl(rendered.payloadUrl)) {
          nextPdfUrls[invoice.cle] = rendered.payloadUrl;
        }
      } catch (error) {
        console.log('Erreur de génération du QR code:', error);
      }
    }

    this.qrCodeImages = nextImages;
    this.qrCodeDisplayTexts = nextTexts;
    this.qrInvoicePdfUrls = nextPdfUrls;
  }

  private buildSfecResponseFromCreateResponse(response: any): SfecCertificationResponse | undefined {
    if (!response) {
      return undefined;
    }

    const qrCode = `${response.qr_code || response.qrCode || ''}`.trim();
    if (!qrCode && !response.certification_number && !response.certificationNumber) {
      return undefined;
    }

    return {
      invoice_id: response.invoice_id || response.invoiceId,
      certification_number: response.certification_number || response.certificationNumber,
      signature: response.signature,
      short_signature: response.short_signature || response.shortSignature,
      invoice_number: response.invoice_number || response.invoiceNumber,
      certification_date: response.certification_date || response.certificationDate,
      identifier: response.identifier,
      qr_code: qrCode || undefined,
    };
  }

  createInvoice(invoice: Invoice) {
    if (this.isInvoiceRequestLoading) {
      return;
    }

    this.isInvoiceRequestLoading = true;
    this.invoiceService
      .createDGIInvoice(invoice)
      .pipe(
        finalize(() => {
          this.isInvoiceRequestLoading = false;
        })
      )
      .subscribe(
        async (response: any) => {
          const sfecResponse = this.buildSfecResponseFromCreateResponse(response);
          const normalizedStatus = response?.status || 'CERTIFIED';

          this.invoices = this.invoices?.map((inv) => {
            if (inv.cle === invoice.cle) {
              return {
                ...inv,
                status: normalizedStatus,
                sfec_response: sfecResponse || inv.sfec_response,
              };
            }
            return inv;
          });
          invoice.status = normalizedStatus;
          invoice.sfec_response = sfecResponse || invoice.sfec_response;

          if (this.invoices) {
            await this.refreshQrCodeImages(this.invoices);
          }

          this.messageService.success(
            'La création de la facture normalisée a été effectuée avec succès.',
            'INFO CREATION'
          );
        },
        (error) => {
          this.messageService.errorHtml(
            error.error.errorMessage,
            'ERREUR LORS DE LA DEMANDE DE LA FACTURE'
          );
        }
      );
  }
  initPeriodes() {
    const dateDebut = new Date();
    const dateFin = new Date();
    this.periodeDto = { dateDebut, dateFin };
  }
}
