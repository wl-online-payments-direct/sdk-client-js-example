import { computed, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private readonly count = signal(0);
  readonly visible = computed(() => this.getCount() > 0);

  show(): void {
    this.count.update((c) => c + 1);
  }

  hide(): void {
    this.count.update((c) => Math.max(0, c - 1));
  }

  getCount(): number {
    return this.count();
  }
}
