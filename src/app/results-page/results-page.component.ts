import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeMatches, Contribution, Employee } from '../shared/types';
import { matchEmployeeContributions } from '../matching/matcher';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';
import { EmployeeCardComponent } from "../employee-card/employee-card.component";

@Component({
  selector: 'app-results-page',
  standalone: true,
  template: `
    <h1>Employee-Political Contribution Overview</h1>
    @if (employeeMatches.length === 0) {
        <div>No matched employees.</div>
    }
    @else {
      <div>{{employeeMatches.length}} matched employees.</div>
    }
    <div class="card-grid">
      @for (result of employeeMatches; track $index) {
        <app-employee-card
          [matches]="result"
          (showDetail)="openModal(result)" 
          />
      }

    </div>
  `,
  styles: [`
    .card-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5em;
      justify-content: flex-start;
    }
    h1 {
      text-align: center;
      margin: 2em 0 1em 0;
    }
  `],
  imports: [EmployeeCardComponent]
})
export class ResultsPageComponent implements OnInit {
  employeeMatches: EmployeeMatches[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    const contribData = JSON.parse(sessionStorage.getItem('contribData') || '[]');
    const employeeData = JSON.parse(sessionStorage.getItem('employeeData') || '[]');
    this.employeeMatches = matchEmployeeContributions(employeeData, contribData);

    console.log("Matched Employees:", employeeData, contribData, this.employeeMatches);
  }

  openModal(employee: EmployeeMatches) {
    this.dialog.open(EmployeeModalComponent, {
      width: '750px',
      data: employee
    });
  }
}