import { Routes } from '@angular/router';
import { FullscreenMapPage } from './pages/fullscreen-map-page/fullscreen-map-page';

export const routes: Routes = [
  {
    path: 'fullscreen',
    component: FullscreenMapPage,
    title: 'FullScreen Map',
  },
  {
    path: '**',
    redirectTo: 'fullscreen',
  },
];
