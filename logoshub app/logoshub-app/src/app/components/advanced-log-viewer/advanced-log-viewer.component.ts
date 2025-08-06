import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ErrorService, ErrorLog } from '../../services/error.service';
import { AdvancedLoggerService, AdvancedLogEntry, LogLevel, LogCategory } from '../../services/advanced-logger.service';

@Component({
  selector: 'app-advanced-log-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="advanced-log-viewer">
      <div class="header">
        <h2>Advanced Log Viewer</h2>
        <div class="session-info">
          Session ID: {{ sessionId }}
        </div>
      </div>

      <!-- Statistics Dashboard -->
      <div class="stats-dashboard">
        <div class="stat-card">
          <h3>Total Logs (24h)</h3>
          <p class="stat-number">{{ stats.total }}</p>
        </div>
        <div class="stat-card error">
          <h3>Errors</h3>
          <p class="stat-number">{{ stats.errors }}</p>
        </div>
        <div class="stat-card warning">
          <h3>Warnings</h3>
          <p class="stat-number">{{ stats.warnings }}</p>
        </div>
        <div class="stat-card performance">
          <h3>Performance</h3>
          <p class="stat-number">{{ stats.performance }}</p>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <div class="control-group">
          <label>Log Type:</label>
          <select [(ngModel)]="selectedLogType" (change)="filterLogs()">
            <option value="advanced">Advanced Logs</option>
            <option value="error">Error Logs</option>
          </select>
        </div>

        <div class="control-group" *ngIf="selectedLogType === 'advanced'">
          <label>Level:</label>
          <select [(ngModel)]="selectedLevel" (change)="filterLogs()">
            <option value="">All Levels</option>
            <option *ngFor="let level of logLevels" [value]="level">{{ level }}</option>
          </select>
        </div>

        <div class="control-group" *ngIf="selectedLogType === 'advanced'">
          <label>Category:</label>
          <select [(ngModel)]="selectedCategory" (change)="filterLogs()">
            <option value="">All Categories</option>
            <option *ngFor="let category of logCategories" [value]="category">{{ category }}</option>
          </select>
        </div>

        <div class="control-group">
          <label>Time Range:</label>
          <select [(ngModel)]="selectedTimeRange" (change)="filterLogs()">
            <option value="1">Last Hour</option>
            <option value="24">Last 24 Hours</option>
            <option value="168">Last Week</option>
            <option value="0">All Time</option>
          </select>
        </div>

        <div class="control-group">
          <label>Search:</label>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            (input)="filterLogs()"
            placeholder="Search in messages..."
          >
        </div>

        <div class="control-group">
          <button (click)="clearLogs()" class="clear-btn">Clear All Logs</button>
          <button (click)="exportLogs()" class="export-btn">Export Logs</button>
          <button (click)="refreshLogs()" class="refresh-btn">Refresh</button>
        </div>
      </div>

      <!-- Log Count -->
      <div class="log-count">
        Showing {{ filteredLogs.length }} of {{ totalLogs }} logs
      </div>

      <!-- Logs Container -->
      <div class="logs-container">
        <div *ngFor="let log of filteredLogs" class="log-entry" [class]="getLogEntryClass(log)">
          <!-- Advanced Log Entry -->
          <div *ngIf="selectedLogType === 'advanced' && isAdvancedLog(log)" class="advanced-log">
            <div class="log-header">
              <span class="log-level" [class]="'level-' + log.level.toLowerCase()">{{ log.level }}</span>
              <span class="log-category">{{ log.category }}</span>
              <span class="timestamp">{{ log.timestamp | date:'medium' }}</span>
              <span class="log-id">{{ log.id }}</span>
            </div>
            <div class="log-message">{{ log.message }}</div>
            <div class="log-meta">
              <span *ngIf="log.userId" class="user-id">User: {{ log.userId }}</span>
              <span *ngIf="log.duration" class="duration">Duration: {{ log.duration }}ms</span>
                             <span *ngIf="log.tags && log.tags.length" class="tags">
                 Tags: {{ log.tags.join(', ') }}
               </span>
            </div>
            <div *ngIf="log.details" class="log-details">
              <details>
                <summary>Details</summary>
                <pre>{{ log.details | json }}</pre>
              </details>
            </div>
          </div>

          <!-- Error Log Entry -->
          <div *ngIf="selectedLogType === 'error' && isErrorLog(log)" class="error-log">
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

      <!-- No Logs Message -->
      <div *ngIf="filteredLogs.length === 0" class="no-logs">
        <p>No logs found matching the current filters.</p>
      </div>
    </div>
  `,
  styles: [`
    .advanced-log-viewer {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e1e5e9;
    }

    .session-info {
      font-size: 12px;
      color: #666;
      background: #f8f9fa;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .stats-dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    .stat-card h3 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #666;
    }

    .stat-number {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .stat-card.error .stat-number {
      color: #e53e3e;
    }

    .stat-card.warning .stat-number {
      color: #d69e2e;
    }

    .stat-card.performance .stat-number {
      color: #3182ce;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .control-group label {
      font-size: 12px;
      font-weight: 600;
      color: #333;
    }

    .control-group select,
    .control-group input {
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      font-size: 14px;
    }

    .clear-btn, .export-btn, .refresh-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin-top: 16px;
    }

    .clear-btn {
      background: #e53e3e;
      color: white;
    }

    .export-btn {
      background: #38a169;
      color: white;
    }

    .refresh-btn {
      background: #3182ce;
      color: white;
    }

    .log-count {
      margin-bottom: 16px;
      font-weight: bold;
      color: #666;
    }

    .logs-container {
      max-height: 600px;
      overflow-y: auto;
      border: 1px solid #e1e5e9;
      border-radius: 8px;
    }

    .log-entry {
      border-bottom: 1px solid #e1e5e9;
      padding: 16px;
      background: white;
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .log-level, .error-type {
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }

    .level-debug {
      background: #e2e8f0;
      color: #4a5568;
    }

    .level-info {
      background: #bee3f8;
      color: #2b6cb0;
    }

    .level-warn {
      background: #fef5e7;
      color: #d69e2e;
    }

    .level-error {
      background: #fed7d7;
      color: #e53e3e;
    }

    .level-fatal {
      background: #e53e3e;
      color: white;
    }

    .log-category {
      background: #f7fafc;
      color: #4a5568;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }

    .timestamp {
      color: #666;
      font-size: 12px;
    }

    .log-id {
      color: #999;
      font-size: 10px;
      font-family: monospace;
    }

    .log-message {
      color: #333;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .log-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 8px;
      font-size: 12px;
      color: #666;
    }

    .log-details, .additional-data, .stack-trace {
      margin-top: 8px;
    }

    .log-details summary, .additional-data summary, .stack-trace summary {
      cursor: pointer;
      color: #3182ce;
      font-weight: 500;
      font-size: 14px;
    }

    pre {
      background: #f7fafc;
      padding: 12px;
      border-radius: 4px;
      font-size: 12px;
      overflow-x: auto;
      margin-top: 8px;
      border: 1px solid #e2e8f0;
    }

    .no-logs {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .error-code, .url, .user-id, .duration, .tags {
      font-size: 12px;
      color: #666;
    }

    @media (max-width: 768px) {
      .controls {
        flex-direction: column;
      }
      
      .log-header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class AdvancedLogViewerComponent implements OnInit {
  // Log data
  advancedLogs: AdvancedLogEntry[] = [];
  errorLogs: ErrorLog[] = [];
  filteredLogs: (AdvancedLogEntry | ErrorLog)[] = [];
  
  // Filter options
  selectedLogType: 'advanced' | 'error' = 'advanced';
  selectedLevel: string = '';
  selectedCategory: string = '';
  selectedTimeRange: string = '24';
  searchTerm: string = '';
  
  // Statistics
  stats: any = {
    total: 0,
    errors: 0,
    warnings: 0,
    performance: 0
  };
  
  // Enums for dropdowns
  logLevels = Object.values(LogLevel);
  logCategories = Object.values(LogCategory);
  
  // Session info
  sessionId: string = '';

  constructor(
    private errorService: ErrorService,
    private advancedLogger: AdvancedLoggerService
  ) {}

  ngOnInit() {
    this.sessionId = this.advancedLogger.getSessionId();
    this.loadLogs();
    this.updateStatistics();
  }

  loadLogs() {
    this.advancedLogs = this.advancedLogger.getLogs();
    this.errorLogs = this.errorService.getErrorLogs();
    this.filterLogs();
  }

  filterLogs() {
    let logs: (AdvancedLogEntry | ErrorLog)[] = [];
    
    if (this.selectedLogType === 'advanced') {
      logs = [...this.advancedLogs];
      
      // Filter by level
      if (this.selectedLevel) {
        logs = logs.filter(log => 
          this.isAdvancedLog(log) && log.level === this.selectedLevel
        );
      }
      
      // Filter by category
      if (this.selectedCategory) {
        logs = logs.filter(log => 
          this.isAdvancedLog(log) && log.category === this.selectedCategory
        );
      }
    } else {
      logs = [...this.errorLogs];
    }
    
    // Filter by time range
    if (this.selectedTimeRange !== '0') {
      const hours = parseInt(this.selectedTimeRange);
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      logs = logs.filter(log => log.timestamp > cutoffTime);
    }
    
    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(term)
      );
    }
    
    this.filteredLogs = logs;
    this.totalLogs = logs.length;
  }

  updateStatistics() {
    this.stats = this.advancedLogger.getLogStatistics(24);
  }

  clearLogs() {
    if (this.selectedLogType === 'advanced') {
      this.advancedLogger.clearLogs();
    } else {
      this.errorService.clearErrorLogs();
    }
    this.loadLogs();
    this.updateStatistics();
  }

  exportLogs() {
    let logsJson: string;
    let filename: string;
    
    if (this.selectedLogType === 'advanced') {
      logsJson = this.advancedLogger.exportLogs();
      filename = `advanced-logs-${new Date().toISOString().split('T')[0]}.json`;
    } else {
      logsJson = this.errorService.exportErrorLogs();
      filename = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
    }
    
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  refreshLogs() {
    this.loadLogs();
    this.updateStatistics();
  }

  getLogEntryClass(log: AdvancedLogEntry | ErrorLog): string {
    if (this.isAdvancedLog(log)) {
      return `log-${log.level.toLowerCase()}`;
    } else {
      return `log-${log.errorType.toLowerCase()}`;
    }
  }

  isAdvancedLog(log: AdvancedLogEntry | ErrorLog): log is AdvancedLogEntry {
    return 'level' in log && 'category' in log;
  }

  isErrorLog(log: AdvancedLogEntry | ErrorLog): log is ErrorLog {
    return 'errorType' in log;
  }

  get totalLogs(): number {
    return this.selectedLogType === 'advanced' ? this.advancedLogs.length : this.errorLogs.length;
  }

  set totalLogs(value: number) {
    // This is just for display purposes
  }
} 