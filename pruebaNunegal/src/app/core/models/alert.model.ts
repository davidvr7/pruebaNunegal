export type AlertType = 'success' | 'error' | 'info';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  autoClose: boolean;
  createdAt: number;
  durationMs: number;
}

export interface AlertOptions {
  autoClose?: boolean;
  durationMs?: number;
}


