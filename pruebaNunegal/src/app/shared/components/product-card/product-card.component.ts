import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input() product?: Product;
  @Output() selectProduct = new EventEmitter<string>();

  @HostListener('keyup.enter')
  @HostListener('keyup.space')
  handleKeyPress(): void {
    this.onSelect();
  }

  onSelect(): void {
    if (this.product?.id) {
      this.selectProduct.emit(this.product.id);
    }
  }
}
