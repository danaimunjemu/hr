import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable } from 'rxjs';
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
  currentStep = 0;
  isLoading = false;
  createdEmployeeId: number | null = null;
  createdUsername: string | null = null;
  createdPhoneNumber: string | null = null;

  // Forms
  employeeForm!: FormGroup;
  userForm!: FormGroup;
  // otpForm removed
  // passwordForm removed

  // Dropdown Observables
  companies$!: Observable<any[]>;
  positions$!: Observable<any[]>;
  jobDescriptions$!: Observable<any[]>;
  orgUnits$!: Observable<any[]>;
  personnelAreas$!: Observable<any[]>;
  personnelSubAreas$!: Observable<any[]>;
  workContracts$!: Observable<any[]>;
  workScheduleRules$!: Observable<any[]>;
  costCenters$!: Observable<any[]>;
  groups$!: Observable<any[]>;
  subGroups$!: Observable<any[]>;
  psGroups$!: Observable<any[]>;
  ethnicGroups$!: Observable<any[]>;

  // UI State
  otpSent = false;
  otpCooldown = 0;
  isComplete = false;

  constructor(
    private fb: FormBuilder,
    private onboardingService: OnboardingService,
    private employeesService: EmployeesService,
    private message: NzMessageService,
    private route: ActivatedRoute,
    // Inject Settings Services
    private companiesService: CompaniesService,
    private positionsService: PositionsService,
    private jobDescriptionsService: JobDescriptionsService,
    private orgUnitsService: OrganizationalUnitsService,
    private personnelAreasService: PersonnelAreasService,
    private personnelSubAreasService: PersonnelSubAreasService,
    private workContractsService: WorkContractsService,
    private workScheduleRulesService: WorkScheduleRulesService,
    private costCentersService: CostCentersService,
    private employeeGroupsService: EmployeeGroupsService,
    private employeeSubGroupsService: EmployeeSubGroupsService,
    private psGroupsService: PsGroupsService,
    private ethnicGroupsService: EthnicGroupsService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadDropdownData();
    this.checkResume();
  }

  private checkResume(): void {
    const employeeId = this.route.snapshot.queryParamMap.get('employeeId');
    if (employeeId) {
      this.isLoading = true;
      this.employeesService.getById(Number(employeeId)).subscribe({
        next: (emp) => {
          this.isLoading = false;
          this.createdEmployeeId = emp.id;
          
          // Populate Step 1 (Employee Form) partially for context
          this.employeeForm.patchValue({
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            mobilePhone: emp.mobilePhone,
            employeeNumber: emp.employeeNumber
            // Add other fields if necessary
          });
          this.employeeForm.disable(); // Lock Step 1

          // Determine Step
          if (!emp.user) {
            this.currentStep = 1; // Go to Create User
          } else if (!emp.user.enabled) {
            this.currentStep = 2; // Go to Activate (OTP)
            this.createdUsername = emp.user.username;
            this.createdPhoneNumber = emp.mobilePhone; 
          } else {
            this.isComplete = true; // Already done
            this.currentStep = 2; // Last step visual
          }
        },
        error: () => {
          this.isLoading = false;
          this.message.error('Failed to load employee for onboarding resume.');
        }
      });
    }
  }

  private initForms(): void {
    // Step 1: Employee Details (Expanded per prompt requirements)
    this.employeeForm = this.fb.group({
      // Personal
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      gender: [null, [Validators.required]],
      dateOfBirth: [null, [Validators.required]],
      nationalId: ['', [Validators.required]],

      // Employment
      employeeNumber: ['', [Validators.required]],
      dateJoined: [null, [Validators.required]],
      
      // Relations (IDs)
      companyId: [null, [Validators.required]],
      positionId: [null, [Validators.required]],
      jobDescriptionId: [null, [Validators.required]],
      workContractId: [null, [Validators.required]],
      workScheduleRuleId: [null, [Validators.required]],
      
      // Groups
      groupId: [null, [Validators.required]],
      subGroupId: [null, [Validators.required]],
      psGroupId: [null, [Validators.required]],
      
      // Org Structure
      organizationalUnitId: [null, [Validators.required]],
      personnelAreaId: [null, [Validators.required]],
      personnelSubAreaId: [null, [Validators.required]],
      costCenterId: [null, [Validators.required]],
      
      // Demographics
      ethnicGroupId: [null, [Validators.required]]
    });

    // Step 2: User Account Setup
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,15}$/)]], // Added phone number
      roleId: [null, [Validators.required]]
    });
  }

  private loadDropdownData(): void {
    this.companies$ = this.companiesService.getCompanies();
    this.positions$ = this.positionsService.getAll();
    this.jobDescriptions$ = this.jobDescriptionsService.getAll();
    this.orgUnits$ = this.orgUnitsService.getAll();
    this.personnelAreas$ = this.personnelAreasService.getAll();
    this.personnelSubAreas$ = this.personnelSubAreasService.getAll();
    this.workContracts$ = this.workContractsService.getAll();
    this.workScheduleRules$ = this.workScheduleRulesService.getAll();
    this.costCenters$ = this.costCentersService.getCostCenters();
    this.groups$ = this.employeeGroupsService.getEmployeeGroups();
    this.subGroups$ = this.employeeSubGroupsService.getEmployeeSubGroups();
    this.psGroups$ = this.psGroupsService.getAll();
    this.ethnicGroups$ = this.ethnicGroupsService.getAll();
  }

  // --- Steps Logic ---

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    this.currentStep += 1;
  }

  // --- Step 1: Create Employee ---

  submitEmployee(): void {
    if (this.employeeForm.invalid) {
      this.updateValidity(this.employeeForm);
      this.message.error('Please fill in all required fields.');
      return;
    }

    this.isLoading = true;
    const formVal = this.employeeForm.value;
    
    // Transform flat form to nested DTO matching prompt exactly
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
        this.isLoading = false;
        this.createdEmployeeId = res.id!;
        this.message.success('Employee created successfully!');
        this.next();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.message.error('Failed to create employee. Please check the details or try again.');
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  // --- Step 2: Create User ---

  submitUser(): void {
    if (this.userForm.invalid) {
      this.updateValidity(this.userForm);
      return;
    }

    if (!this.createdEmployeeId) {
      this.message.error('Missing employee ID. Please restart the process.');
      return;
    }

    this.isLoading = true;
    const formVal = this.userForm.value;
    const employeeFormVal = this.employeeForm.getRawValue();
    
    const userPayload: UserDto = {
      username: formVal.username,
      email: employeeFormVal.email || '', 
      phoneNumber: formVal.phoneNumber,
      employee: { id: this.createdEmployeeId },
      roles: [{ id: formVal.roleId }]
    };

    this.onboardingService.registerUser(userPayload).subscribe({
      next: () => {
        this.isLoading = false;
        this.createdUsername = formVal.username;
        this.createdPhoneNumber = formVal.phoneNumber;
        this.message.success('User account created successfully!');
        this.next();
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.message.error('Failed to create user account.');
      }
    });
  }

  // --- Step 3: Send OTP (Final Step for HR) ---

  sendOtp(): void {
    const target = this.createdPhoneNumber || this.createdUsername;
    if (!target) return;

    this.isLoading = true;
    this.onboardingService.activateAccount({ username: target }).subscribe({
      next: () => {
        this.isLoading = false;
        this.otpSent = true;
        this.isComplete = true; // Mark as complete
        this.message.success('OTP sent successfully to ' + target);
        // this.startCooldown(); // No cooldown needed here if flow ends
        // this.next(); // Stay on success view or just show success content
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.message.error('Failed to send OTP.');
      }
    });
  }

  resetOnboarding(): void {
    this.currentStep = 0;
    this.createdEmployeeId = null;
    this.createdUsername = null;
    this.otpSent = false;
    this.isComplete = false;
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
