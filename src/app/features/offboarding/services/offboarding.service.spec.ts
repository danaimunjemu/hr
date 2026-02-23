import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OffboardingService } from './offboarding.service';
import { OffboardingCreateRequest, OffboardingUpsertRequest } from '../models/offboarding.model';

describe('OffboardingService', () => {
  let service: OffboardingService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8090/api/offboarding';
  const createPayload: OffboardingCreateRequest = {
    offboardingType: 'RESIGNATION',
    exitDate: '2026-03-31',
    reason: 'Personal reasons',
    comments: 'Knowledge transfer in progress'
  };

  const payload: OffboardingUpsertRequest = {
    employeeId: 12,
    offboardingType: 'RESIGNATION',
    reason: 'Personal reasons',
    lastWorkingDay: '2026-03-31',
    notes: 'Knowledge transfer in progress'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(OffboardingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should load all records', () => {
    service.getAll().subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0].lastWorkingDay).toBe('2026-03-31');
    });

    const request = httpMock.expectOne(baseUrl);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 1,
        employeeId: 12,
        reason: 'Personal reasons',
        exitDate: '2026-03-31',
        status: 'PENDING_HOD'
      }
    ]);
  });

  it('should create a record with primary endpoint', () => {
    service.create(createPayload).subscribe(record => {
      expect(record.id).toBe(22);
      expect(record.notes).toBe('Knowledge transfer in progress');
    });

    const request = httpMock.expectOne(baseUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.employeeId).toBeUndefined();
    expect(request.request.body.exitDate).toBe('2026-03-31');
    expect(request.request.body.comments).toBe('Knowledge transfer in progress');
    request.flush({
      id: 22,
      employeeId: 12,
      reason: 'Personal reasons',
      lastWorkingDay: '2026-03-31',
      notes: 'Knowledge transfer in progress',
      status: 'PENDING_HR'
    });
  });

  it('should fallback to alternative create endpoint when primary is unavailable', () => {
    service.create(createPayload).subscribe(record => {
      expect(record.id).toBe(23);
    });

    const request = httpMock.expectOne(baseUrl);
    request.flush({}, { status: 405, statusText: 'Method Not Allowed' });

    const fallbackRequest = httpMock.expectOne(`${baseUrl}/create`);
    expect(fallbackRequest.request.method).toBe('POST');
    fallbackRequest.flush({
      id: 23,
      employeeId: 12,
      reason: 'Personal reasons',
      lastWorkingDay: '2026-03-31',
      status: 'PENDING_HR'
    });
  });

  it('should update a record', () => {
    service.update(5, payload).subscribe(record => {
      expect(record.id).toBe(5);
      expect(record.status).toBe('PENDING_HR');
    });

    const request = httpMock.expectOne(`${baseUrl}/5`);
    expect(request.request.method).toBe('PUT');
    request.flush({
      id: 5,
      employeeId: 12,
      reason: 'Personal reasons',
      lastWorkingDay: '2026-03-31',
      status: 'PENDING_HR'
    });
  });

  it('should delete a record', () => {
    service.delete(9).subscribe();
    const request = httpMock.expectOne(`${baseUrl}/9`);
    expect(request.request.method).toBe('DELETE');
    request.flush({});
  });

  it('should approve by HR and HOD', () => {
    service.approveHr(8, 'APPROVED', 'Approved by HR').subscribe(record => {
      expect(record.hrApproved).toBe(true);
    });
    const hrRequest = httpMock.expectOne(`${baseUrl}/8/approve/hr`);
    expect(hrRequest.request.method).toBe('PUT');
    expect(hrRequest.request.body).toEqual({
      offboardingId: 8,
      approvalStatus: 'APPROVED',
      comment: 'Approved by HR'
    });
    hrRequest.flush({
      id: 8,
      employeeId: 12,
      reason: 'Resignation',
      lastWorkingDay: '2026-03-31',
      status: 'PENDING_HR',
      hrApproved: true
    });

    service.approveHod(8, 'REJECTED', 'Rejected by HOD').subscribe(record => {
      expect(record.hodApproved).toBe(true);
    });
    const hodRequest = httpMock.expectOne(`${baseUrl}/8/approve/hod`);
    expect(hodRequest.request.method).toBe('PUT');
    expect(hodRequest.request.body).toEqual({
      offboardingId: 8,
      approvalStatus: 'REJECTED',
      comment: 'Rejected by HOD'
    });
    hodRequest.flush({
      id: 8,
      employeeId: 12,
      reason: 'Resignation',
      lastWorkingDay: '2026-03-31',
      status: 'PENDING_HR',
      hodApproved: true
    });
  });

  it('should load records by employee id', () => {
    service.getByEmployeeId(12).subscribe(records => {
      expect(records.length).toBe(1);
      expect(records[0].employeeId).toBe(12);
    });

    const request = httpMock.expectOne(`${baseUrl}/employee/12`);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 1,
        employeeId: 12,
        reason: 'Resignation',
        lastWorkingDay: '2026-03-31',
        status: 'PENDING_HR'
      }
    ]);
  });
});
