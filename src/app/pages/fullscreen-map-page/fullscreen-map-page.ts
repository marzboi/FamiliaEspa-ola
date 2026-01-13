import { AfterViewInit, Component, effect, ElementRef, signal, viewChild } from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { DecimalPipe, JsonPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

mapboxgl.accessToken = environment.mapboxKey;

@Component({
  selector: 'app-fullscreen-map-page',
  imports: [DecimalPipe],
  templateUrl: './fullscreen-map-page.html',
  styles: `
    div {
      width: 100vw;
      height: 100vh;
    }

    #controls {
      background-color: white;
      padding: 10px;
      border-radius: 5px;
      position: fixed;
      bottom: 25px;
      right: 20px;
      z-index: 9999;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      width: 250px;
    }

  `,
})
export class FullscreenMapPage implements AfterViewInit {
  divElement = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map | null>(null);

  zoom = signal(6);
  coordinates = signal({
    lng: -3.70838,
    lat: 40.40517,
  });

  zoomEffect = effect(() => {
    if (!this.map()) return;

    this.map()?.zoomTo(this.zoom());
  });

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((resolve) => setTimeout(resolve, 200));

    const element = this.divElement()!.nativeElement;
    const { lat, lng } = this.coordinates();

    const map = new mapboxgl.Map({
      container: element,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: this.zoom(),
    });

    this.mapListeners(map);
  }

  mapListeners(map: mapboxgl.Map) {
    map.on('zoomend', (event) => {
      const newZoom = event.target.getZoom();
      this.zoom.set(newZoom);
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      this.coordinates.set(center);
    });

    map.on('load', () => {
      console.log('Map loaded');
    });

    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.ScaleControl());

    this.map.set(map);
  }
}
