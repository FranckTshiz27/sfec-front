import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Risk } from '../interface/Risk';
import {
  faArrowAltCircleUp,
  faCertificate,
  faEye,
  faInfoCircle,
  faPrint,
} from '@fortawesome/free-solid-svg-icons';
import { HttpErrorResponse } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from 'src/app/services/auth.service';
import { PolicyService } from 'src/app/services/policy.service';
import { Localstore } from 'src/app/services/store/local.store';
import { Province } from '../interface/Province';
import { Ville } from '../interface/Ville';
import { RiskService } from 'src/app/services/risk';
import { CertificatService } from 'src/app/services/certificat.service';
import { MessageDialogService } from 'src/app/services/MessageDialog.service';
import { HistoryService } from 'src/app/services/history.service';
import Swal from 'sweetalert2';
import { PDFDocument } from 'pdf-lib';
import { Demande } from '../interface/Demande';
import { Attestation } from '../interface/attestation';

@Component({
  selector: 'app-risk-list',
  templateUrl: './risk-list.component.html',
  styleUrls: ['./risk-list.component.scss'],
})
export class RiskListComponent implements OnInit, OnDestroy {
  loading = true;
  risks: Risk[] = [];
  numpolicy: string = '';
  validateForm_search!: FormGroup;
  validateForm!: FormGroup;
  visible_view = false;
  neverChecked = false;
  selectedRisk?: any = {};
  _riskFilterText: string = '';
  filteredRisks: Risk[] = [];
  invalidRisks: any[] = [];
  canClose?: boolean;
  _checkAll: boolean = false;
  _checkAllForPrint: boolean = false;
  certificateRequestDto: any;
  _canAsking: boolean = true;
  faIcon = faArrowAltCircleUp;
  faPrint = faPrint;
  faInfo = faInfoCircle;
  faEye = faEye;
  faCertificate = faCertificate;
  canShowInvalidRisks = false;
  provinces: Province[] = [];
  villes: Ville[] = [];
  selectedProvince: Province = {
    libelle: '',
    code: '',
    createdat: new Date(),
    updatedat: new Date(),
    villes: [],
  };

  selectedVille!: Ville;
  size: 'large' | 'small' | 'default' = 'default';
  permission: any[] = [];
  constructor(
    private fb: FormBuilder,
    private servHttp: RiskService,
    private servHttpCertificate: CertificatService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private policyService: PolicyService,
    private certificateService: CertificatService,
    private modal: NzModalService,
    public authService: AuthService,
    private message: MessageDialogService,
    private historyService: HistoryService,
    private servkeycloak: KeycloakService,
    // private provinceService: ProvinceService,
    // private villeService: VilleService,
    private certificatService: CertificatService
  ) {}
  ngOnDestroy(): void {
    this.policyService.selectedPolicy = null;
  }

  ngOnInit(): void {
    this.validateForm_search = this.fb.group({
      word_search: [null, [Validators.required]],
    });
    this.loading = true;
    this.numpolicy = this.activatedRoute.snapshot.params['id'];
    this.getRisksByNumPolicy(
      this.policyService.selectedPolicy.numpoli,
      this.policyService.selectedPolicy.codeint,
      this.policyService.selectedPolicy.numeave
    );

    this.validateForm = this.fb.group({
      ville: [null, [Validators.required]],
      telephone: [
        null,
        [
          Validators.required,
          Validators.pattern(/^(\+\d{1,3}[- ]?)?\d{9,12}$/),
        ],
      ],
      province: [null],
    });

    // this.getProvinces();
    // this.getVilles();
  }

  async moreClient(value: string) {
    await this.router.navigate(['home/certificat-client/certificats', value]);
  }

  getRisksByNumPolicy(numpolicy: string, codeint: number, numeave: number) {
    console.log(this.risks);

    this.loading = true;
    this.servHttp.getRisksByNumPolcy(numpolicy, codeint, numeave).subscribe(
      (reponse) => {
        this.loading = false;
        if (reponse) {
          this.risks = [...reponse];
          this.filteredRisks = [...this.risks];

          console.log(this.filteredRisks);
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  refresh() {
    const numpoli = this.policyService.selectedPolicy.numpoli;
    const numeave = this.policyService.selectedPolicy.numeave;
    const condeint = this.policyService.selectedPolicy.codeint;

    this.getRisksByNumPolicy(numpoli, condeint, numeave);
  }

  open(id: number) {
    this.visible_view = true;
    this.selectedRisk = this.risks.find((risk) => risk.id === id);
  }

  closeDrawer(): void {
    console.log(this.selectedRisk.certificate);

    this.visible_view = false;
  }

  public get RiskFilterText(): string {
    return this._riskFilterText.trim();
  }
  public get Checkall(): boolean {
    return this._checkAll;
  }
  public set Checkall(value: boolean) {
    this._checkAll = value;
    this.checkAllRisks();
  }
  public get CheckallForPrint(): boolean {
    return this._checkAllForPrint;
  }
  public set CheckallForPrint(value: boolean) {
    this._checkAllForPrint = value;
    this.checkAllRisksForPrint();
  }
  public get CanAsking(): boolean {
    return this._canAsking;
  }
  public set CanAsking(value: boolean) {
    this._canAsking = value;
  }
  public set RiskFilterText(filter: string) {
    this._riskFilterText = filter;
    this.canClose = this._riskFilterText !== '';
    this.filteredRisks = this.risks.filter(
      (risk) =>
        risk.numeroImmatriculation
          .trim()
          .toLowerCase()
          .indexOf(this.RiskFilterText.trim().toLowerCase()) != -1
    );
  }

  initFilter() {
    this.RiskFilterText = '';
  }

  checkAllRisks() {
    this.risks = this.risks.map((risk) => {
      if (
        (risk.demande != null && risk.demande.request.statut == '0') ||
        risk.numeroImmatriculation == 'VIDE'
      ) {
        risk.isChecked = false;
      } else {
        risk.isChecked = this.Checkall;
      }

      return risk;
    });
  }

  checkAllRisksForPrint() {
    this.risks = this.risks.map((risk) => {
      if (!risk.hasCertificate || risk.numeroImmatriculation == 'VIDE') {
        risk.isCheckedForPrint = false;
      } else {
        risk.isCheckedForPrint = this.CheckallForPrint;
      }

      return risk;
    });
  }

  isListValid() {
    let inValidRisks = this.risks.filter(
      (risk) => risk.numeroImmatriculation === 'VIDE' || risk.waiting
    );
    const isValid = inValidRisks.length == 0;

    return isValid;
  }
  showInvalidListErrorMessage(e: any) {
    e.target.checked = false;
    this.modal.error({
      nzTitle: "Message d'érreur",
      nzContent:
        'Des véhicules sans immatriculation trouvés dans cette liste !',
    });
  }

  showInvaliRiskErrorMessage(e: any, risk: any) {
    if (risk.immatriculation == 'VIDE') {
      this.modal.error({
        nzTitle: "Message d'érreur",
        nzContent: "Aucune demande n'est possible avec ce véhicule ! ",
      });
      e.target.checked = false;
      risk.isChecked = false;
    }
    return risk.immatriculation == 'VIDE';
  }
  sendCertificateRequest() {
    let policy: any = {};
    this.CanAsking = false;
    policy = { ...this.policyService.selectedPolicy };

    let risks: any[] = [];
    risks = this.risks
      .filter((risk: Risk) => risk.isChecked)
      .map((risk) => {
        const { isChecked, ...newRisk } = risk;
        newRisk.numeroImmatriculation = newRisk.numeroImmatriculation;
        return newRisk;
      });

    if (risks.length > 0) {
      this.certificateRequestDto = {
        inteArca: policy.inteArca,
        envid: null,
        policy,
        risks,
      };

      this.pushCertificateRequestData(this.certificateRequestDto);
    } else {
      this.CanAsking = true;
      this.message.warning(
        'Veuillez séléctionner au moins un véhicule',
        'Avertissement'
      );
    }
  }

  pushCertificateRequestData(certificateRequestData: any) {
    this.loading = true;
    this.certificateService.sendRequestArca(certificateRequestData).subscribe(
      (reponse) => {
        console.log(' response response ');
        console.log(reponse);

        if (reponse) {
          this.message.success(
            "La demande de l'attestation effectuée",
            'Info demande'
          );
        }
        this.CanAsking = true;
        this.authService.isAsking = false;

        let demandes: Demande[] = [...reponse];

        this.risks = this.risks.map((risk) => {
          let foundDemande: Demande | null = null;

          foundDemande =
            demandes.find(
              (d) =>
                d.numero_chassis.trim().includes(risk.numeroChassis.trim()) &&
                d.numero_immatriculation
                  .trim()
                  .includes(risk.numeroImmatriculation.trim())
            ) || null;

          if (foundDemande) {
            risk.demande = { ...foundDemande };
          }

          console.log('demandes');
          console.log(foundDemande);

          return risk;
        });
      },
      (error) => {
        console.log(error);

        this.message.error(error.error.errorMessage, 'Erreur');
        this.CanAsking = true;
        this.authService.isAsking = false;
      }
    );
    // }

    this.loading = false;
  }

  public checkRiskValidity() {
    this.risks = this.risks.map((risk) => {
      if (risk.numeroImmatriculation == 'VIDE') {
        risk.isChecked = false;
      }
      return risk;
    });
  }

  showMessage(risk: any) {
    if (risk.immatriculation == 'VIDE') {
      this.message.error(
        "Ce véhicule n'a pas d'immatriculation!.",
        'Demande de certificat'
      );
    }
  }

  getNumberCertificatesToPrint(risks: Risk[]) {
    return risks
      .filter((risk) => risk.isCheckedForPrint)
      .map((risk) => {
        if (risk.pdfSaved) {
          return {
            certificateName: risk.numeroCertificatToPrint,
            pdfSaved: risk.pdfSaved,
          };
        } else {
          return {
            certificateName: risk.certificateReference,
            pdfSaved: risk.pdfSaved,
          };
        }
      });
  }

  getReferences(filteredRisks: any) {
    return filteredRisks
      .filter((risk: any) => risk.isCheckedForPrint)
      .map((risk: any) => risk.certificateReference);
  }

  async downloadCertificatesPdf(attestation: Attestation): Promise<void> {
    this.loading = true;

    console.log('Lien PDF:', attestation.lien_pdf);

    // Ouvrir directement dans un nouvel onglet
    window.open(attestation.lien_pdf, '_blank');

    this.loading = false;
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

  logout(): void {
    Localstore.deleteCompte();
    this.servkeycloak.getKeycloakInstance().logout();
    this.router.navigate(['/']);
  }

  handleOk() {
    this.canShowInvalidRisks = false;
  }

  handleCancel() {
    this.canShowInvalidRisks = false;
  }

  showInvalidRisks() {
    this.canShowInvalidRisks = true;
  }

  submitFormOne(): boolean {
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

  // Convertir un Uint8Array en Base64
  // private uint8ArrayToBase64(bytes: Uint8Array): string {
  //   return window.btoa(String.fromCharCode(...bytes));
  // }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 8192; // On traite par blocs de 8192 octets pour éviter un dépassement de mémoire

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return window.btoa(binary);
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

  printMultipleCertificatesFromNas(references: any) {
    this.loading = true;
    if (references && references.length > 0)
      this.certificatService
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
      this.loading = false;
      this.message.warning('Aucune attestation trouvée!', 'Avertissement');
    }
  }
}
