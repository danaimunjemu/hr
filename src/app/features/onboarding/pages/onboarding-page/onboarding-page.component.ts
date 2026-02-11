import { Component, OnInit, signal, computed, effect, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { OnboardingService, EmployeeDto, UserDto } from '../../services/onboarding.service';
import { EmployeesService } from '../../../employees/services/employees.service';

// Services for Dropdowns
import { CompaniesService } from '../../../settings/services/companies.service';
import { PositionsService } from '../../../settings/services/positions.service';
import { JobDescriptionsService } from '../../../settings/services/job-descriptions.service';
import { OrganizationalUnitsService } from '../../../settings/services/organizational-units.service';
import { PersonnelAreasService } from '../../../settings/services/personnel-areas.service';
import { PersonnelSubAreasService } from '../../../settings/services/personnel-sub-areas.service';
import { WorkContractsService } from '../../../settings/services/work-contracts.service';
import { WorkScheduleRulesService } from '../../../settings/services/work-schedule-rules.service';
import { CostCentersService } from '../../../settings/services/cost-centers.service';
import { EmployeeGroupsService } from '../../../settings/services/employee-groups.service';
import { EmployeeSubGroupsService } from '../../../settings/services/employee-sub-groups.service';
import { PsGroupsService } from '../../../settings/services/ps-groups.service';
import { EthnicGroupsService } from '../../../settings/services/ethnic-groups.service';

@Component({
  selector: 'app-onboarding-page',
  standalone: false,
  templateUrl: './onboarding-page.component.html',
  styleUrls: ['./onboarding-page.component.scss']
})
export class OnboardingPageComponent implements OnInit {
  // Signals for state
  currentStep = signal(0);
  isLoading = signal(false);
  createdEmployeeId = signal<number | null>(null);
  createdUsername = signal<string | null>(null);
  createdPhoneNumber = signal<string | null>(null);
  otpSent = signal(false);
  otpCooldown = signal(0);
  isComplete = signal(false);

  // Forms
  employeeForm!: FormGroup;
  userForm!: FormGroup;

  // Dropdown Signals (using toSignal for async data)
  companies = toSignal(inject(CompaniesService).getCompanies(), { initialValue: [] });
  positions = toSignal(inject(PositionsService).getAll(), { initialValue: [] });
  jobDescriptions = toSignal(inject(JobDescriptionsService).getAll(), { initialValue: [] });
  orgUnits = toSignal(inject(OrganizationalUnitsService).getAll(), { initialValue: [] });
  personnelAreas = toSignal(inject(PersonnelAreasService).getAll(), { initialValue: [] });
  personnelSubAreas = toSignal(inject(PersonnelSubAreasService).getAll(), { initialValue: [] });
  workContracts = toSignal(inject(WorkContractsService).getAll(), { initialValue: [] });
  workScheduleRules = toSignal(inject(WorkScheduleRulesService).getAll(), { initialValue: [] });
  costCenters = toSignal(inject(CostCentersService).getCostCenters(), { initialValue: [] });
  groups = toSignal(inject(EmployeeGroupsService).getEmployeeGroups(), { initialValue: [] });
  subGroups = toSignal(inject(EmployeeSubGroupsService).getEmployeeSubGroups(), { initialValue: [] });
  psGroups = toSignal(inject(PsGroupsService).getAll(), { initialValue: [] });
  ethnicGroups = toSignal(inject(EthnicGroupsService).getAll(), { initialValue: [] });

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private employeesService: EmployeesService,
    private message: NzMessageService,
    private route: ActivatedRoute
  ) {
    // Effect to log step changes (example usage of effect)
    effect(() => {
      console.log(`Current step changed to: ${this.currentStep()}`);
    });
  }

  ngOnInit(): void {
    this.initForms();
    this.checkResume();
  }

  private checkResume(): void {
    const employeeId = this.route.snapshot.queryParamMap.get('employeeId');
    if (employeeId) {
      this.isLoading.set(true);
      this.employeesService.getById(Number(employeeId)).subscribe({
        next: (emp) => {
          this.isLoading.set(false);
          this.createdEmployeeId.set(emp.id);
          
          this.employeeForm.patchValue({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            mobilePhone: emp.mobilePhone,
            employeeNumber: emp.employeeNumber
          });
          this.employeeForm.disable();

          if (!emp.user) {
            this.currentStep.set(1);
          } else if (!emp.user.enabled) {
            this.currentStep.set(2);
            this.createdUsername.set(emp.user.username);
            this.createdPhoneNumber.set(emp.mobilePhone); 
          } else {
            this.isComplete.set(true);
            this.currentStep.set(2);
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.message.error('Failed to load employee for onboarding resume.');
        }
      });
    }
  }

  private initForms(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      gender: [null, [Validators.required]],
      dateOfBirth: [null, [Validators.required]],
      nationalId: ['', [Validators.required]],
      employeeNumber: ['', [Validators.required]],
      dateJoined: [null, [Validators.required]],
      companyId: [null, [Validators.required]],
      positionId: [null, [Validators.required]],
      jobDescriptionId: [null, [Validators.required]],
      workContractId: [null, [Validators.required]],
      workScheduleRuleId: [null, [Validators.required]],
      groupId: [null, [Validators.required]],
      subGroupId: [null, [Validators.required]],
      psGroupId: [null, [Validators.required]],
      organizationalUnitId: [null, [Validators.required]],
      personnelAreaId: [null, [Validators.required]],
      personnelSubAreaId: [null, [Validators.required]],
      costCenterId: [null, [Validators.required]],
      ethnicGroupId: [null, [Validators.required]]
    });

    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      roleId: [null, [Validators.required]]
    });
  }

  pre(): void {
    this.currentStep.update(step => step - 1);
  }

  next(): void {
    this.currentStep.update(step => step + 1);
  }

  submitEmployee(): void {
    if (this.employeeForm.invalid) {
      this.updateValidity(this.employeeForm);
      this.message.error('Please fill in all required fields.');
      return;
    }

    this.isLoading.set(true);
    const formVal = this.employeeForm.value;
    
    const employeePayload: EmployeeDto = {
      firstName: formVal.firstName,
      lastName: formVal.lastName,
      gender: formVal.gender,
      dateOfBirth: this.formatDate(formVal.dateOfBirth),
      nationalId: formVal.nationalId,
      employeeNumber: formVal.employeeNumber,
      dateJoined: this.formatDate(formVal.dateJoined),
      company: { id: formVal.companyId },
      position: { id: formVal.positionId },
      jobDescription: { id: formVal.jobDescriptionId },
      organizationalUnit: { id: formVal.organizationalUnitId },
      personnelArea: { id: formVal.personnelAreaId },
      personnelSubArea: { id: formVal.personnelSubAreaId },
      workContract: { id: formVal.workContractId },
      workScheduleRule: { id: formVal.workScheduleRuleId },
      costCenter: { id: formVal.costCenterId },
      group: { id: formVal.groupId },
      subGroup: { id: formVal.subGroupId },
      psGroup: { id: formVal.psGroupId },
      ethnicGroup: { id: formVal.ethnicGroupId }
    };

    this.onboardingService.createEmployee(employeePayload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.createdEmployeeId.set(res.id!);
        this.message.success('Employee created successfully!');
        this.next();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
        this.message.error('Failed to create employee. Please check the details or try again.');
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  submitUser(): void {
    if (this.userForm.invalid) {
      this.updateValidity(this.userForm);
      return;
    }

    if (!this.createdEmployeeId()) {
      this.message.error('Missing employee ID. Please restart the process.');
      return;
    }

    this.isLoading.set(true);
    const formVal = this.userForm.value;
    const employeeFormVal = this.employeeForm.getRawValue();
    
    const userPayload: UserDto = {
      username: formVal.username,
      email: employeeFormVal.email || '', 
      phoneNumber: formVal.phoneNumber,
      employee: { id: this.createdEmployeeId()! },
      roles: [{ id: formVal.roleId }]
    };

    this.onboardingService.registerUser(userPayload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.createdUsername.set(formVal.username);
        this.createdPhoneNumber.set(formVal.phoneNumber);
        this.message.success('User account created successfully!');
        this.next();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
        this.message.error('Failed to create user account.');
      }
    });
  }

  sendOtp(): void {
    const target = this.createdPhoneNumber() || this.createdUsername();
    if (!target) return;

    this.isLoading.set(true);
    this.onboardingService.activateAccount({ username: target }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.otpSent.set(true);
        this.isComplete.set(true);
        this.message.success('OTP sent successfully to ' + target);
        this.next();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error(err);
        this.message.error('Failed to send OTP.');
      }
    });
  }

  resetOnboarding(): void {
    this.currentStep.set(0);
    this.createdEmployeeId.set(null);
    this.createdUsername.set(null);
    this.otpSent.set(false);
    this.isComplete.set(false);
    this.employeeForm.reset();
    this.userForm.reset();
  }

  private updateValidity(form: FormGroup): void {
    Object.values(form.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}
