/*
 * Do not remove or alter the notices in this preamble.
 *
 * This software is owned by Worldline and may not be be altered, copied, reproduced, republished, uploaded, posted, transmitted or distributed in any way, without the prior written consent of Worldline.
 *
 * Copyright © 2026 Worldline and/or its affiliates.
 *
 * All rights reserved. License grant and user rights and obligations according to the applicable license agreement.
 *
 * Please contact Worldline for questions regarding license and user rights.
 */
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
