import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { finalize } from 'rxjs';
import { Employee, EmployeesService } from '../../services/employees.service';

@Component({
  selector: 'app-all-employees',
  standalone: false,
  templateUrl: './all-employees.html',
  styleUrl: './all-employees.scss',
})
export class AllEmployees implements OnInit {
  employeesSignal: WritableSignal<Employee[]> = signal([]);
  loadingSignal: WritableSignal<boolean> = signal(false);
  errorSignal: WritableSignal<string | null> = signal(null);

  constructor(private employeesService: EmployeesService) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    
    this.employeesService.getEmployees()
      .pipe(finalize(() => this.loadingSignal.set(false)))
      .subscribe({
        next: (data) => {
          this.employeesSignal.set(data);
          console.log(data);
        },
        error: (err) => {
          this.errorSignal.set(err.message);
        }
      });
  }
}
