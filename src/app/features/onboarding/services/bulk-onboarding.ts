import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export type BatchStatus = 'PENDING' | 'AUTHORIZED' | 'FAILED' | 'PROCESSING';

export interface Batch {
  id: number;
  createdOn: string;
  updatedOn: string;
  deletedOn: string | null;
  name: string;
  originalName: string;
  type: string;
  url: string;
  checkSum: string;
  error: string | null;
  inputter: string;
  authorizer: string | null;
  authorizeDateTime: string | null;
  inputDateTime: string;
  attempts: number;
  status: BatchStatus;
  employees: any[]; 
}

export interface BatchException {
  id: number;
  employeeNumber: string;
  exceptionMessage: string;
  stage: string;
  createdOn?: string;
  updatedOn?: string;
  sheetData?: unknown;
  sheetDataText?: string;
}

@Injectable({ providedIn: 'root' })
export class BatchService {
  private readonly baseUrl = 'http://localhost:8090/api/batch';
  private readonly exceptionUrl = 'http://localhost:8090/api/exception-log';

  constructor(private http: HttpClient) {}

  getById(id: number): Observable<Batch> {
    return this.http.get<Batch>(`${this.baseUrl}/${id}`);
  }

  update(id: number, payload: Partial<Batch>): Observable<Batch> {
    return this.http.put<Batch>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getList(params?: { page?: number; size?: number }): Observable<Batch[]> {
    let httpParams = new HttpParams();
    if (params?.page != null) httpParams = httpParams.set('page', params.page);
    if (params?.size != null) httpParams = httpParams.set('size', params.size);
    return this.http.get<Batch[]>(`${this.baseUrl}`, { params: httpParams });
  }

  create(payload: Partial<Batch>): Observable<Batch> {
    return this.http.post<Batch>(`${this.baseUrl}`, payload);
  }

  upload(formData: FormData): Observable<Batch> {
    return this.http.post<Batch>(`${this.baseUrl}/upload`, formData);
  }

  authorize(id: number): Observable<Batch> {
    return this.http.patch<Batch>(`${this.baseUrl}/${id}/authorize`, {});
  }

  list(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.baseUrl}/list`);
  }

  findByStatus(status: BatchStatus): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.baseUrl}/findByStatus/${status}`);
  }

  getExceptionsByBatch(batchId: number): Observable<BatchException[]> {
    return this.http
      .get<unknown[]>(`${this.exceptionUrl}/batch/${batchId}`)
      .pipe(map(items => items.map(item => this.toBatchException(item))));
  }

  private toBatchException(item: unknown): BatchException {
    const raw = item as Record<string, unknown>;
    const employee = (raw['employee'] as Record<string, unknown> | undefined) || {};
    const batchRecord = (raw['batchRecord'] as Record<string, unknown> | undefined) || {};
    const employeeNumber =
      String(raw['employeeNumber'] ?? '').trim() ||
      String(employee['employeeNumber'] ?? '').trim() ||
      String(batchRecord['employeeNumber'] ?? '').trim() ||
      'N/A';

    const exceptionMessage =
      this.normalizeExceptionMessage(raw['exceptions']) ||
      String(raw['message'] ?? '').trim() ||
      String(raw['description'] ?? '').trim() ||
      String(raw['exceptionDescription'] ?? '').trim() ||
      String(raw['error'] ?? '').trim() ||
      'N/A';

    const stage =
      String(raw['stage'] ?? '').trim() ||
      String(raw['exceptionStage'] ?? '').trim() ||
      String(raw['sourceStage'] ?? '').trim() ||
      'N/A';

    const sheetData = raw['sheetData'];
    const sheetDataText = this.toCompactText(sheetData);

    return {
      id: Number(raw['id'] ?? 0),
      employeeNumber,
      exceptionMessage,
      stage,
      createdOn: (raw['createdOn'] as string | undefined) || (raw['timestamp'] as string | undefined),
      updatedOn: raw['updatedOn'] as string | undefined,
      sheetData,
      sheetDataText
    };
  }

  private normalizeExceptionMessage(value: unknown): string {
    if (Array.isArray(value)) {
      return value.map(item => this.toCompactText(item)).filter(Boolean).join(' | ');
    }
    return this.toCompactText(value);
  }

  private toCompactText(value: unknown): string {
    if (value == null) {
      return '';
    }
    if (typeof value === 'string') {
      return value.trim();
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
}
