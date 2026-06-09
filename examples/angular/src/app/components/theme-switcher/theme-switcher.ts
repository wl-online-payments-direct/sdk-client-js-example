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
import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark' | 'system';

@Component({
  selector: 'wl-theme-switcher',
  imports: [],
  templateUrl: './theme-switcher.html',
  standalone: true,
})
export class ThemeSwitcher {
  theme = signal<Theme>(this.getSavedTheme());
  private document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const theme = this.theme();
      this.document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });
  }

  handleThemeChange() {
    this.theme.update((theme) => (theme === 'light' ? 'dark' : 'light'));
  }

  private getSavedTheme(): Theme {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
