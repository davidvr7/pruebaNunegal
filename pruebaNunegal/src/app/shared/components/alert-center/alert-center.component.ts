import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Alert } from '../../../core/models/alert.model';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-alert-center',
  templateUrl: './alert-center.component.html',
  styleUrls: ['./alert-center.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertCenterComponent {
  protected readonly alerts$ = this.alertService.alerts$;

  constructor(private alertService: AlertService) {}

  protected trackById(_: number, alert: Alert): string {
    return alert.id;
  }

  protected dismiss(id: string): void {
    this.alertService.dismiss(id);
  }
}


