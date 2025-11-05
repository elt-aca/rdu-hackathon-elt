import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EmployeeMatches } from '../shared/types';
import { MatCardActions, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from "@angular/material/card";
import { UpperCasePipe, DecimalPipe, NgClass } from "@angular/common";

@Component({
  selector: 'app-employee-card',
  standalone: true,
  template: `
    <mat-card [ngClass]="'risk-' + matches.risk_level" (click)="detail()">
      <mat-card-header>
        <mat-card-title>{{matches.employee.full_name}}</mat-card-title>
        <mat-card-subtitle>{{matches.employee.title}}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        @if (matches.matches.length > 0) {
            <div>
            Matched Contributions: <b>{{matches.matches.length}}</b><br>
            Highest Confidence: <b>{{(matches.matches[0]?.confidence_score ?? 0 )*100 | number:'1.1-1'}}%</b>
            </div>
        }
        <div>
          <span class="risk-label">Risk: <b>{{matches.risk_level | uppercase}}</b></span>
        </div>
        <div>
          <i>{{matches.risk_reason}}</i>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-stroked-button color="primary" (click)="detail($event)">Details</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    mat-card { width: 370px; cursor: pointer; }
    .risk-high { border-left: 6px solid #e53935; background: #ffebee;}
    .risk-medium { border-left: 6px solid #fbc02d; background: #fffde7;}
    .risk-low { border-left: 6px solid #43a047; background: #e8f5e9;}
    .risk-label { font-size: 1.1em; }
    button { margin-top: 1em; }
  `],
  imports: [MatCardActions, MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, UpperCasePipe, DecimalPipe, NgClass]
})
export class EmployeeCardComponent {
  @Input() matches!: EmployeeMatches;
  @Output() showDetail = new EventEmitter<void>();
  detail(ev?: Event) {
    if (ev) ev.stopPropagation();
    this.showDetail.emit();
  }
}