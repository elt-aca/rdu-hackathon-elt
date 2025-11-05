import { Component, Inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { EmployeeMatches } from '../shared/types';

@Component({
  selector: 'app-employee-modal',
  standalone: true,
  template: `
    <h2 mat-dialog-title>Employee Details: {{data.employee.full_name}}</h2>
    <mat-dialog-content>
      <div>
        <b>Title:</b> {{data.employee.title}}<br>
        <b>Home Address:</b> {{data.employee.home_address}}, {{data.employee.home_city}}, {{data.employee.home_state}}, {{data.employee.home_zip}}<br>
        <b>Spouse:</b> {{data.employee.spouse_name || '—'}}<br>
        <b>Covered Associate:</b> {{data.employee.is_covered_associate ? 'Yes' : 'No'}}<br>
        <b>Solicitor:</b> {{data.employee.is_solicitor ? 'Yes' : 'No'}}<br>
      </div>
      <hr>
      <b>Matched Contributions:</b>
      @if (data.matches.length > 0) {
        <table style="width:100%;margin-top:1em;">
            <tr>
            <th>Contributor Name</th>
            <th>Recipient</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Type</th>
            <th>Confidence</th>
            </tr>
            @for (m of data.matches; track $index) {
              <tr>
                  <td>{{m.contribution.contributor_name}}</td>
                  <td>{{m.contribution.recipient_name}}</td>
                  <td>\${{m.contribution.contribution_amount}}</td>
                  <td>{{m.contribution.contribution_date}}</td>
                  <td>{{m.match_type}}</td>
                  <td>{{m.confidence_score*100 | number:'1.1-1'}}%</td>
              </tr>
            }
        </table>
        }
      @if (data.matches.length === 0) { <div>No contributions matched for this employee.</div> }
      @for (m of data.matches; track $index) {
        <div style="margin-top:1.2em;padding:0.5em;border-left:2px solid #888;">
          <b>Contribution {{m.contribution_id}}: {{m.contribution.contributor_name}} ➔ {{m.contribution.recipient_name}}</b><br>
          <i>Amount: \${{m.contribution.contribution_amount}}, Date: {{m.contribution.contribution_date}}</i><br>
          <b>Matching Confidence:</b> {{m.confidence_score*100 | number:'1.1-1'}}%<br>
          <b>Why this is a match:</b>
          <ul>
            @for (reason of m.match_explanation; track $index) {
              <li>{{reason}}</li>
            }
          </ul>
          <b>Compliance Flags:</b> {{m.compliance_flags.join(', ') || '—'}}<br>
          <b>Insights:</b>
          <ul>
            @for (note of m.actionable_insights; track $index) {
              <li>{{note}}</li>
            }
          </ul>
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button (click)="close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 { margin-top: 0; }
    mat-dialog-content { max-height: 65vh; overflow: auto; }
    table { border-collapse: collapse; }
    th, td { border: 1px solid #999; padding: 0.15em 0.6em; font-size: 0.98em;}
    hr { margin: 1em 0; }
  `],
  imports: [MatDialogContent, MatDialogActions, DecimalPipe]
})
export class EmployeeModalComponent {
  constructor(
    public dialogRef: MatDialogRef<EmployeeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmployeeMatches
  ) {}
  close() { this.dialogRef.close(); }
}