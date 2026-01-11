import { Component, signal } from '@angular/core';
import { FullscreenMapPage } from './pages/fullscreen-map-page/fullscreen-map-page';

@Component({
  selector: 'app-root',
  imports: [FullscreenMapPage],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('maps-app');
}
