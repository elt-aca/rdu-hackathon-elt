import { Component, Input, Output, EventEmitter } from '@angular/core';
import { EmployeeMatches } from '../shared/types';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent } from "@angular/material/card";
import { UpperCasePipe, DecimalPipe, NgClass, NgIf } from "@angular/common";

@Component({
  selector: 'app-employee-card',
  standalone: true,
  template: `
  <mat-card class="employee-card" [ngClass]="'risk-' + (matches.risk_level || 'low')" (click)="detail()" tabindex="0" (keydown.enter)="detail()">
      <mat-card-header>
        <div class="avatar" mat-card-avatar aria-hidden="true">{{ initials }}</div>
  <mat-card-title>{{ matches.employee.full_name }}</mat-card-title>
  <mat-card-subtitle>{{ matches.employee.title }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div *ngIf="matches && matches.matches && matches.matches.length > 0" class="match-info" aria-live="polite">
          <div>Matched Contributions: <b>{{ matches.matches.length }}</b></div>
          <div>Highest Confidence: <b>{{ (matches.matches[0]?.confidence_score ?? 0) * 100 | number:'1.1-1' }}%</b></div>
        </div>

        <div class="risk-row">
          <span class="risk-label">Risk: <b>{{ matches.risk_level | uppercase }}</b></span>
          <span class="spacer"></span>
          <em class="reason" *ngIf="matches.risk_reason">{{ matches.risk_reason }}</em>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
  :host { display: block; height: 100%; }
    mat-card.employee-card {
      height: 100%;
      width: 100%;
      max-width: 420px;
      min-width: 260px;
      cursor: pointer;
      transition: transform 160ms ease, box-shadow 160ms ease;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    mat-card.employee-card:focus {
      outline: 3px solid rgba(21,156,228,0.18);
      outline-offset: 2px;
    }
    mat-card.employee-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    }

    mat-card-header { display: flex; align-items: center; gap: 12px; }
    .avatar[mat-card-avatar] {
      width: 56px; height: 56px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-weight: 600; color: #fff; background: linear-gradient(135deg,#4a90e2,#50c9c3);
      flex-shrink: 0; font-size: 1rem;
    }

    .match-info { margin: 8px 0; color: rgba(0,0,0,0.85); font-size: 0.95rem; }

    .risk-row { display:flex; align-items:center; gap:8px; margin-top:8px; width:100%; }
    .spacer { flex:1 1 auto; }
    .reason { color: rgba(0,0,0,0.6); font-size:0.88rem; }

    /* Risk color accents */
    .risk-high { border-left: 6px solid #c62828; background: linear-gradient(180deg,#ffebee, #fff8f8); }
    .risk-medium { border-left: 6px solid #f9a825; background: linear-gradient(180deg,#fffde7,#fffefa); }
    .risk-low { border-left: 6px solid #2e7d32; background: linear-gradient(180deg,#e8f5e9,#f7fff8); }

    .risk-label { font-size: 0.95rem; color: rgba(0,0,0,0.87); }

    mat-card-actions { display:flex; justify-content:flex-end; padding: 12px 16px 16px; }
    button[mat-stroked-button] { margin: 0; }

    @media (max-width: 480px) {
      mat-card.employee-card { max-width: 100%; margin: 0 auto; }
      .avatar[mat-card-avatar] { width:48px; height:48px; font-size:0.95rem; }
    }
  `],
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, UpperCasePipe, DecimalPipe, NgClass, NgIf]
})
export class EmployeeCardComponent {
  @Input() matches!: EmployeeMatches;
  @Output() showDetail = new EventEmitter<void>();
  get initials(): string {
    const name = this.matches?.employee?.full_name || '';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  detail(ev?: Event) {
    if (ev) ev.stopPropagation();
    this.showDetail.emit();
  }
}