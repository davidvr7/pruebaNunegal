import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Alert, AlertOptions, AlertType } from '../models/alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private static readonly DEFAULT_DURATION = 5000;

  private readonly alertsSubject = new BehaviorSubject<Alert[]>([]);
  private readonly activeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
  private counter = 0;

  readonly alerts$ = this.alertsSubject.asObservable();

  info(message: string, options?: AlertOptions): void {
    this.push('info', message, options);
  }

  success(message: string, options?: AlertOptions): void {
    this.push('success', message, options);
  }

  error(message: string, options?: AlertOptions): void {
    this.push('error', message, options);
  }

  dismiss(id: string): void {
    this.clearTimeout(id);
    const alerts = this.alertsSubject.value.filter((alert) => alert.id !== id);
    this.alertsSubject.next(alerts);
  }

  clear(): void {
    Array.from(this.activeTimeouts.keys()).forEach((id) => this.clearTimeout(id));
    this.alertsSubject.next([]);
  }

  private push(type: AlertType, message: string, options?: AlertOptions): void {
    const alert: Alert = {
      id: this.generateId(),
      type,
      message,
      autoClose: options?.autoClose ?? true,
      durationMs: options?.durationMs ?? AlertService.DEFAULT_DURATION,
      createdAt: Date.now()
    };

    this.alertsSubject.next([...this.alertsSubject.value, alert]);

    if (alert.autoClose) {
      const timeoutId = setTimeout(() => this.dismiss(alert.id), alert.durationMs);
      this.activeTimeouts.set(alert.id, timeoutId);
    }
  }

  private generateId(): string {
    this.counter += 1;
    return `alert-${Date.now()}-${this.counter}`;
  }

  private clearTimeout(id: string): void {
    const timeout = this.activeTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimeouts.delete(id);
    }
  }
}


