import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent {
  @Input() label = 'Buscar';
  @Input() placeholder = 'Marca, modelo o referencia';
  @Output() searchChange = new EventEmitter<string>();

  protected readonly control = new FormControl('', { nonNullable: true });
  protected hasValue = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private cdr: ChangeDetectorRef) {
    this.control.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const normalized = value.trim();
        this.hasValue = normalized.length > 0;
        this.searchChange.emit(normalized);
        this.cdr.markForCheck();
      });
  }

  clear(): void {
    this.control.setValue('');
  }
}
