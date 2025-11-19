import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { AlertService } from './alert.service';

describe('AlertService', () => {
  let service: AlertService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertService);
  });

  it('should push success alerts', (done) => {
    const message = 'Todo salió bien';
    const subscription = service.alerts$.subscribe((alerts) => {
      if (alerts.length) {
        expect(alerts[0].type).toBe('success');
        expect(alerts[0].message).toBe(message);
        subscription.unsubscribe();
        done();
      }
    });

    service.success(message, { autoClose: false });
  });

  it('should auto dismiss alerts after duration', fakeAsync(() => {
    let latestLength = 0;
    const subscription = service.alerts$.subscribe((alerts) => {
      latestLength = alerts.length;
    });

    service.success('Auto close alert');
    expect(latestLength).toBe(1);

    tick(6000);
    expect(latestLength).toBe(0);
    subscription.unsubscribe();
  }));

  it('should dismiss alerts manually', () => {
    let latestCount = 0;
    let alertId: string | undefined;
    const subscription = service.alerts$.subscribe((alerts) => {
      latestCount = alerts.length;
      if (alerts.length) {
        alertId = alerts[0].id;
      }
    });

    service.success('Manual dismiss', { autoClose: false });
    expect(latestCount).toBe(1);
    expect(alertId).toBeTruthy();

    service.dismiss(alertId as string);
    expect(latestCount).toBe(0);
    subscription.unsubscribe();
  });
});


