import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'page-layout',
  imports: [RouterOutlet],
  templateUrl: './page-layout.html',
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class PageLayout {}
