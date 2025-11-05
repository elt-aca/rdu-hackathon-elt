import { Component, OnInit } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeMatches, Contribution, Employee } from '../shared/types';
import { matchEmployeeContributions } from '../matching/matcher';
import { EmployeeModalComponent } from '../employee-modal/employee-modal.component';
import { EmployeeCardComponent } from "../employee-card/employee-card.component";

@Component({
  selector: 'app-results-page',
  standalone: true,
  template: `
    <div class="page-wrap">
      <h1>Employee-Political Contribution Overview</h1>

      <div *ngIf="employeeMatches.length === 0" class="empty">No matched employees.</div>

      <div class="card-grid" role="list">
        <ng-container *ngFor="let result of employeeMatches; let i = index">
          <div role="listitem" class="grid-item">
            <app-employee-card
              [matches]="result"
              (showDetail)="openModal(result)"
            ></app-employee-card>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }
    .page-wrap { padding: 1rem 1.25rem 2rem; max-width: 1200px; margin: 0 auto; }

    h1 {
      text-align: center;
      margin: 1.5rem 0 1rem 0;
      font-size: 1.4rem;
      color: rgba(0,0,0,0.85);
    }

    .empty { text-align:center; color: rgba(0,0,0,0.6); padding: 2rem 0; }

    /* Grid that keeps items same height regardless of content. */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
      grid-auto-rows: 380px; /* fixed row height for consistent card sizing */
      align-items: start;
      margin-top: 1rem;
    }

    /* Each grid item is a flex container so the inner card can stretch.
       The child component (.employee-card) is expected to make its mat-card 100% height. */
    .grid-item {
      display: flex;
      align-items: stretch;
    }

    /* Small screens: make rows taller to accomodate stacked content */
    @media (max-width: 480px) {
      .card-grid { grid-auto-rows: 420px; grid-template-columns: 1fr; }
    }
  `],
  imports: [EmployeeCardComponent, NgForOf, NgIf]
})
export class ResultsPageComponent implements OnInit {
  employeeMatches: EmployeeMatches[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    const contribData = JSON.parse(sessionStorage.getItem('contribData') || '[]');
    const employeeData = JSON.parse(sessionStorage.getItem('employeeData') || '[]');
    const matches = matchEmployeeContributions(employeeData, contribData);
    this.employeeMatches = matches.sort((a, b) => {
      const bMaxScore = Math.max(...b.matches.map(x => x.confidence_score));
      const aMaxScore = Math.max(...a.matches.map(x => x.confidence_score));

      // First sort by highest confidence score
      if (bMaxScore !== aMaxScore) {
        return bMaxScore - aMaxScore;
      }

      // Then sort by number of matches
      return b.matches.length - a.matches.length;
    });
  }

  openModal(employee: EmployeeMatches) {
    this.dialog.open(EmployeeModalComponent, {
      width: '750px',
      maxWidth: 'none',
      data: employee
    });
  }
}