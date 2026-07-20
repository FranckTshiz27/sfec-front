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
import { NzModalService } from 'ng-zorro-antd/modal';
import 'jspdf-autotable';
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
import { Transaction } from 'src/app/dto/Transaction';
import { UtilService } from 'src/app/utils/utils.service';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './rapport.component.html',
  styleUrls: ['./rapport.component.scss'],
})
export class RapportComponent implements OnInit {
  loading = true;
  validateForm_search!: FormGroup;
  validateForm!: FormGroup;
  responses!: Response[];
  periodeDto: any;
  periodeAndRiskDto: any;
  visible_view = false;
  date_search: string = '';
  certificates: any = { content: [] };
  completeCertificates: CompleteCertificate[] = [];
  listOfData: any[] = [];
  dateArray = [];
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
  selectedTransaction?: Transaction;
  types?: String[]

  size: 'large' | 'small' | 'default' = 'default';
  transactions?: Transaction[];

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
    private router: Router,
    public authService: AuthService,
    private policyService: PolicyService,
    private riskService: RiskService,
    private invoiceService: InvoiceService,
    private message: MessageDialogService,
    private utilService: UtilService
  ) { }

  ngOnInit(): void {
    this.types = ['Z-RAPPORT', 'X-RAPPORT', 'A-RAPPORT'];
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
    this.getTransactionsByPeriod();
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
  getTransactionsByPeriod() {
    this.loading = true;
    this.invoiceService.getTransactions(this.periodeDto).subscribe(
      (response) => {
        this.transactions = [...response];
        this.loading = false;
      },
      (error) => {
        console.log(error);
        this.loading = false;
      }
    );
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

    this.message.success(
      'La facture  a été téléchargée avec succes.',
      'Info téléchargement'
    );
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
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
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
    const file: Blob = new Blob([byteArray], { type: 'application/pdf' });
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
  printDGIInvoice(transaction: Transaction) {
    this.loading = true;

    let amount = this.utilService.trans(Number(transaction.prime));

    this.invoiceService.printerDGIInvoice(transaction.cle, amount).subscribe(
      (response) => {
        if (response != null) {
          this.file(response, transaction.cle);
          this.loading = false;
        }
      },
      (error) => {
        console.log(error);
        this.loading = false;
        this.loading = false;
        this.message.error(error.error.errorMessage, 'Info état de sortie');
      }
    );
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
