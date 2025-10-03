import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';

@Component({
  selector: 'layout',
  imports: [RouterOutlet, Header],
  templateUrl: './layout.html',
  standalone: true,
  styles: [':host { display: contents; }'],
})
export class Layout {}
