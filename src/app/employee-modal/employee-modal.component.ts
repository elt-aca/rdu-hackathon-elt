import { Component, Inject } from '@angular/core';
import { DecimalPipe, NgForOf, NgIf, NgClass, UpperCasePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { EmployeeMatches } from '../shared/types';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  template: `
    <h2 mat-dialog-title>Employee Details: {{ data.employee.full_name }}</h2>
    <mat-dialog-content>
      <section class="employee-summary">
        <div class="summary-left">
          <div class="field"><strong>Title</strong><div class="value">{{ data.employee.title }}</div></div>
          <div class="field"><strong>Address</strong><div class="value">{{ data.employee.home_address }}, {{ data.employee.home_city }}, {{ data.employee.home_state }} {{ data.employee.home_zip }}</div></div>
          <div class="field small"><strong>Spouse</strong> <span class="value">{{ data.employee.spouse_name || '—' }}</span></div>
        </div>
        <div class="summary-right">
          <div class="badges">
            <span class="badge">Matches: <strong>{{ data.matches.length }}</strong></span>
            <span class="badge" [ngClass]="{
                'conf-high': highestConfidence >= 0.75,
                'conf-med': highestConfidence >= 0.4 && highestConfidence < 0.75,
                'conf-low': highestConfidence < 0.4
              }">Top Confidence: <strong>{{ highestConfidence*100 | number:'1.1-1' }}%</strong></span>
            <span class="badge risk" [ngClass]="'risk-' + (data.risk_level || 'low')">Risk: <strong>{{ data.risk_level | uppercase }}</strong></span>
          </div>
          <div class="quick-flags">
            <div><strong>Covered Associate:</strong> {{ data.employee.is_covered_associate ? 'Yes' : 'No' }}</div>
            <div><strong>Solicitor:</strong> {{ data.employee.is_solicitor ? 'Yes' : 'No' }}</div>
          </div>
        </div>
      </section>

      <hr>

      <section class="matches">
        <h3>Matched Contributions</h3>
        <div *ngIf="!data.matches || data.matches.length === 0" class="empty">No contributions matched for this employee.</div>

        <div class="match-list">
          <ng-container *ngFor="let m of data.matches; let i = index">
            <details class="match-item">
              <summary class="match-summary">
                <div class="summary-left">
                  <div class="contrib">{{ m.contribution.contributor_name }} ➔ {{ m.contribution.recipient_name }}</div>
                  <div class="meta">{{ m.contribution.contribution_date }} • \${{ m.contribution.contribution_amount | number:'1.0-0' }} • {{ m.match_type }}</div>
                </div>
                <div class="summary-right">
                  <span class="conf-pill" [ngClass]="{
                      'conf-high': m.confidence_score >= 0.75,
                      'conf-med': m.confidence_score >= 0.4 && m.confidence_score < 0.75,
                      'conf-low': m.confidence_score < 0.4
                    }">{{ (m.confidence_score*100) | number:'1.1-1' }}%</span>
                  <span class="type-pill">{{ m.match_type }}</span>
                </div>
              </summary>

              <div class="match-details">
                <div class="row"><strong>Contribution ID:</strong> {{ m.contribution_id || '—' }}</div>
                <div class="row"><strong>Why this matched:</strong>
                  <ul>
                    <li *ngFor="let reason of m.match_explanation">{{ reason }}</li>
                  </ul>
                </div>
                <div class="row"><strong>Compliance Flags:</strong> {{ (m.compliance_flags && m.compliance_flags.length) ? m.compliance_flags.join(', ') : '—' }}</div>
                <div class="row"><strong>Insights:</strong>
                  <ul>
                    <li *ngFor="let note of m.actionable_insights">{{ note }}</li>
                  </ul>
                </div>
              </div>
            </details>
          </ng-container>
        </div>
      </section>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host { display:block; }
    h2 { margin-top: 1.25rem; margin-bottom: 0.25rem; text-align: center; }
    mat-dialog-content { max-height: 70vh; overflow: auto; padding: 0 0 0.5rem 0; }

    .employee-summary { display:flex; gap:1rem; align-items:flex-start; justify-content:space-between; padding: 0.5rem 0; }
    .summary-left { flex: 1 1 60%; }
    .summary-right { flex: 0 0 36%; text-align:right; }
    .field { margin-bottom: 0.5rem; }
    .field .value { color: rgba(0,0,0,0.75); }

    .badges { display:flex; gap:0.5rem; justify-content:flex-end; align-items:center; flex-wrap:wrap; }
    .badge { background:#f3f4f6; padding:0.25rem 0.5rem; border-radius:999px; font-size:0.9rem; color:rgba(0,0,0,0.75); }
    .badge strong { margin-left:0.25rem; }

    .conf-high { background: linear-gradient(90deg,#66bb6a,#43a047); color: #fff !important; }
    .conf-med { background: linear-gradient(90deg,#ffb74d,#f9a825); color: #000 !important; }
    .conf-low { background: linear-gradient(90deg,#ef9a9a,#e57373); color: #fff !important; }

    .badge.risk { text-transform:uppercase; font-weight:600; }
    .risk-high { background:#fdecea; color:#b71c1c; }
    .risk-medium { background:#fff8e1; color:#ff8f00; }
    .risk-low { background:#e8f5e9; color:#1b5e20; }

    .matches h3 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
    .empty { color: rgba(0,0,0,0.6); padding: 1rem 0; }

    .match-list { display:flex; flex-direction:column; gap:0.5rem; }
    details.match-item { border: 1px solid rgba(0,0,0,0.08); padding: 0.4rem; border-radius:6px; background: #fff; }
    summary.match-summary { list-style:none; display:flex; align-items:center; justify-content:space-between; cursor:pointer; padding:0 0.25rem; }
    summary.match-summary::-webkit-details-marker { display:none; }

    .summary-left .contrib { font-weight:600; }
    .meta { font-size:0.85rem; color: rgba(0,0,0,0.6); }

    .summary-right { display:flex; gap:0.5rem; align-items:center; }
    .conf-pill { padding:0.2rem 0.5rem; border-radius:999px; font-weight:600; font-size:0.95rem; }
    .type-pill { padding:0.15rem 0.45rem; border-radius:6px; background:#eef2ff; color:#1e3a8a; font-size:0.8rem; }

    .match-details { margin-top:0.5rem; padding:0 0.25rem 0.5rem 0.25rem; border-top:1px dashed rgba(0,0,0,0.06); }
    .match-details .row { margin:0.35rem 0; }
    .match-details ul { margin:0.25rem 0 0.25rem 1.1rem; }

    /* responsive tweaks */
    @media (max-width: 640px) {
      .employee-summary { flex-direction: column; align-items:stretch; }
      .summary-right { text-align:left; }
    }
  `],
  imports: [MatDialogContent, MatDialogActions, DecimalPipe, NgForOf, NgIf, NgClass, UpperCasePipe]
})
export class EmployeeModalComponent {
  constructor(
    public dialogRef: MatDialogRef<EmployeeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeeMatches
  ) {}
  close() { this.dialogRef.close(); }

  get highestConfidence(): number {
    if (!this.data || !this.data.matches || this.data.matches.length === 0) return 0;
    return Math.max(...this.data.matches.map(m => m.confidence_score || 0));
  }

}
