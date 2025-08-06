import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorService, ErrorLog } from '../../services/error.service';

@Component({
  selector: 'app-error-log-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="error-log-viewer">
      <h2>Error Logs</h2>
      <div class="controls">
        <button (click)="clearLogs()" class="clear-btn">Clear Logs</button>
        <button (click)="exportLogs()" class="export-btn">Export Logs</button>
        <select [(ngModel)]="selectedErrorType" (change)="filterLogs()">
          <option value="">All Error Types</option>
          <option value="HTTP_ERROR">HTTP Errors</option>
          <option value="AUTH_ERROR">Auth Errors</option>
          <option value="FIREBASE_ERROR">Firebase Errors</option>
          <option value="NETWORK_ERROR">Network Errors</option>
          <option value="VALIDATION_ERROR">Validation Errors</option>
          <option value="NAVIGATION_ERROR">Navigation Errors</option>
          <option value="COMPONENT_ERROR">Component Errors</option>
          <option value="SERVICE_ERROR">Service Errors</option>
        </select>
      </div>
      
      <div class="log-count">
        Total Errors: {{ filteredLogs.length }}
      </div>
      
      <div class="logs-container">
        <div *ngFor="let log of filteredLogs" class="log-entry" [class]="'log-' + log.errorType.toLowerCase()">
          <div class="log-header">
            <span class="error-type">{{ log.errorType }}</span>
            <span class="timestamp">{{ log.timestamp | date:'medium' }}</span>
          </div>
          <div class="log-message">{{ log.message }}</div>
          <div *ngIf="log.errorCode" class="error-code">Code: {{ log.errorCode }}</div>
          <div *ngIf="log.url" class="url">URL: {{ log.url }}</div>
          <div *ngIf="log.userId" class="user-id">User: {{ log.userId }}</div>
          <div *ngIf="log.additionalData" class="additional-data">
            <details>
              <summary>Additional Data</summary>
              <pre>{{ log.additionalData | json }}</pre>
            </details>
          </div>
          <div *ngIf="log.stack" class="stack-trace">
            <details>
              <summary>Stack Trace</summary>
              <pre>{{ log.stack }}</pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-log-viewer {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .controls {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .clear-btn, .export-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .clear-btn {
      background: #e53e3e;
      color: white;
    }

    .export-btn {
      background: #38a169;
      color: white;
    }

    select {
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    .log-count {
      margin-bottom: 20px;
      font-weight: bold;
      color: #666;
    }

    .logs-container {
      max-height: 600px;
      overflow-y: auto;
    }

    .log-entry {
      border: 1px solid #e1e5e9;
      border-radius: 8px;
      margin-bottom: 10px;
      padding: 15px;
      background: white;
    }

    .log-http_error {
      border-left: 4px solid #e53e3e;
    }

    .log-auth_error {
      border-left: 4px solid #d69e2e;
    }

    .log-firebase_error {
      border-left: 4px solid #3182ce;
    }

    .log-network_error {
      border-left: 4px solid #805ad5;
    }

    .log-validation_error {
      border-left: 4px solid #38a169;
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .error-type {
      font-weight: bold;
      color: #333;
    }

    .timestamp {
      color: #666;
      font-size: 12px;
    }

    .log-message {
      color: #e53e3e;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .error-code, .url, .user-id {
      font-size: 12px;
      color: #666;
      margin-bottom: 4px;
    }

    .additional-data, .stack-trace {
      margin-top: 10px;
    }

    .additional-data summary, .stack-trace summary {
      cursor: pointer;
      color: #3182ce;
      font-weight: 500;
    }

    pre {
      background: #f7fafc;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
      margin-top: 5px;
    }
  `]
})
export class ErrorLogViewerComponent implements OnInit {
  allLogs: ErrorLog[] = [];
  filteredLogs: ErrorLog[] = [];
  selectedErrorType: string = '';

  constructor(private errorService: ErrorService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.allLogs = this.errorService.getErrorLogs();
    this.filteredLogs = [...this.allLogs];
  }

  filterLogs() {
    if (this.selectedErrorType) {
      this.filteredLogs = this.allLogs.filter(log => log.errorType === this.selectedErrorType);
    } else {
      this.filteredLogs = [...this.allLogs];
    }
  }

  clearLogs() {
    this.errorService.clearErrorLogs();
    this.loadLogs();
  }

  exportLogs() {
    const logsJson = this.errorService.exportErrorLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
} 