import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Contribution, Employee } from '../shared/types';
import { FileUploadComponent } from "../file-upload/file-upload.component";

@Component({
  selector: 'app-landing-page',
  standalone: true,
  template: `
    <div class="landing-layout">
      <div class="column">
        <h2>Step 1: Upload Contributor JSON</h2>
        <app-file-upload (fileParsed)="onContribData($event)" label="'Upload Contributions JSON'"></app-file-upload>
        @if (contribMeta) {
            <div>
            Records: {{contribMeta.record_count}}<br>
            Last Updated: {{contribMeta.last_updated}}
            </div>
        }
      </div>
      <div class="column">
        <h2>Step 2: Upload Employee JSON</h2>
        <app-file-upload (fileParsed)="onEmployeeData($event)" label="'Upload Employees JSON'"></app-file-upload>
        @if (empMeta) {
            <div>
            Employees: {{empMeta.employee_count}}<br>
            Last Updated: {{empMeta.last_updated}}
            </div>
        }
      </div>
    </div>
    <div class="next-button">
      <button mat-raised-button color="accent" [disabled]="!ready()" (click)="submit()">Submit</button>
    </div>
  `,
  styles: [`
    .landing-layout { display: flex; justify-content: space-between; }
    .column { flex: 1; margin: 2em; }
    .next-button { text-align: center; margin-top: 2em; }
  `],
  imports: [FileUploadComponent]
})
export class LandingPageComponent {
  contribData: Contribution[] = [];
  contribMeta: any = null;
  employeeData: Employee[] = [];
  empMeta: any = null;

  constructor(private router: Router) {}

  onContribData(json: any) {
    this.contribData = json.contributions || [];
    this.contribMeta = json.metadata;
    sessionStorage.setItem('contribData', JSON.stringify(this.contribData));
    sessionStorage.setItem('contribMeta', JSON.stringify(this.contribMeta));
  }

  onEmployeeData(json: any) {
    this.employeeData = json.employees || [];
    this.empMeta = json.metadata;
    sessionStorage.setItem('employeeData', JSON.stringify(this.employeeData));
    sessionStorage.setItem('empMeta', JSON.stringify(this.empMeta));
  }

  ready() {
    return this.contribData.length > 0 && this.employeeData.length > 0;
  }

  submit() {
    this.router.navigate(['/results']);
  }
}