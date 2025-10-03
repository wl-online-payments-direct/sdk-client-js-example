import { Component } from '@angular/core';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'wl-header',
  imports: [ThemeSwitcher, RouterLink],
  templateUrl: './header.html',
  standalone: true,
})
export class Header {}
