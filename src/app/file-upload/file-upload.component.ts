import { Component, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  template: `
    <label class="file-upload-label">
      <input #fileInput type="file" accept="application/json" (change)="onFileChange($event)" hidden>
      <button mat-raised-button color="primary" type="button" (click)="openFileDialog()">
        {{label || 'Open File'}}
      </button>
      @if (filename) { <span>✔ {{filename}}</span> }
      @if (error) { <span class="error">{{error}}</span> }
    </label>
  `,
  styles: [`.error { color: red; margin-left: 1em; } .file-upload-label { display: flex; align-items: center; gap: 1em; }`]
})
export class FileUploadComponent {

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() fileParsed = new EventEmitter<any>();
  @Input() label = 'Open File';

  filename = '';
  error = '';

  openFileDialog() {
    this.fileInput.nativeElement.click();
  }

  onFileChange(ev: Event) {
    this.error = '';
    const target = ev.target as HTMLInputElement;
    if (!target.files?.length) return;
    const file = target.files[0];
    this.filename = file.name;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result as string);
        this.fileParsed.emit(obj);
      } catch (e) {
        this.error = 'Invalid JSON file';
      }
    };
    reader.readAsText(file);
    // Clear the input so the same file can be selected again if needed
    target.value = '';
  }
}