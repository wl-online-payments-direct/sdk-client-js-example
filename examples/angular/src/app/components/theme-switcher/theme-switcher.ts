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
