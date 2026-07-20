import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyRiskComponent } from './policy-risk.component';

describe('PolicyRiskComponent', () => {
  let component: PolicyRiskComponent;
  let fixture: ComponentFixture<PolicyRiskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PolicyRiskComponent]
    });
    fixture = TestBed.createComponent(PolicyRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
