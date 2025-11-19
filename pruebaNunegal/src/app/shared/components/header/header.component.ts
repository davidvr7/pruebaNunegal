import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CartService } from '../../../core/services/cart.service';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  breadcrumbs: Breadcrumb[] = [];
  cartCount$ = this.cartService.cartCount$;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.buildBreadcrumbs());

    this.buildBreadcrumbs();
  }

  private buildBreadcrumbs(): void {
    const crumbs: Breadcrumb[] = [{ label: 'Inicio', url: '/' }];
    const childCrumbs = this.resolveChildCrumbs(this.route.root);
    this.breadcrumbs = [...crumbs, ...childCrumbs];
    this.cdr.markForCheck();
  }

  private resolveChildCrumbs(route: ActivatedRoute, url: string = ''): Breadcrumb[] {
    const breadcrumbs: Breadcrumb[] = [];
    const children = route.children;

    if (!children.length) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL = child.snapshot.url.map((segment) => segment.path).join('/');
      if (routeURL) {
        url += `/${routeURL}`;
      }

      const label = child.snapshot.data?.['breadcrumb'];
      if (label) {
        breadcrumbs.push({ label, url });
      }

      breadcrumbs.push(...this.resolveChildCrumbs(child, url));
    }

    return breadcrumbs;
  }
}
