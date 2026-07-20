import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { PolicyService } from 'src/app/services/policy.service';

@Component({
  selector: 'app-policy-risk',
  templateUrl: './policy-risk.component.html',
  styleUrls: ['./policy-risk.component.scss'],
})
export class PolicyRiskComponent implements OnInit {
  sub_menu: string = 'certificat';

  constructor(
    public policyService: PolicyService,
    private modal: NzModalService
  ) {}
  link: string = 'home/certificat-client/certificat';
  ngOnInit() {
    this.policyService.isPolicySelected = true;
  }

  isPolicySelected: boolean = true;
  isRiskSelected: boolean = false;
  selectPage: string = 'policy';
  selectedLink = '';
  changeFocus(event: any) {
    if (
      event.srcElement.innerText.indexOf('Police') == -1 &&
      !this.policyService.selectedPolicy
    ) {
      this.modal.error({
        nzTitle: "Message d'érreur",
        nzContent: 'Veuillez séléctionner une police !',
      });
    } else {
      this.policyService.isPolicySelected =
        event.srcElement.innerText.indexOf('Police') != -1;
    }
  }
}
