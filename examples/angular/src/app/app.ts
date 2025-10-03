import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderProvider } from './components/loader-provider/loader-provider';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: true,
  imports: [RouterOutlet, LoaderProvider],
})
export class App {
  protected readonly title = signal('angular');
}
