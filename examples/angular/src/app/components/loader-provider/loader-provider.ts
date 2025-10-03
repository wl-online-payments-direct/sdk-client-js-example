import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader-service';

@Component({
  selector: 'loader-provider',
  standalone: true,
  templateUrl: './loader-provider.html',
})
export class LoaderProvider {
  constructor(public loader: LoaderService) {}
}
