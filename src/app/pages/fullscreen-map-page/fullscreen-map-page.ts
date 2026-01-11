import { AfterViewInit, Component, ElementRef, viewChild } from '@angular/core';
import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
mapboxgl.accessToken =
  'pk.eyJ1IjoibWFyemJvaSIsImEiOiJjbWs4N3FzZ2kwcnpvM2ZzbTllYjdnZDkxIn0.Tne8PzntrWPdrrNf_xTQ_w';

@Component({
  selector: 'app-fullscreen-map-page',
  imports: [],
  templateUrl: './fullscreen-map-page.html',
  styles: `
    div {
      width: 100vw;
      height: calc(100vh - 64px);
    }
  `,
})
export class FullscreenMapPage implements AfterViewInit {
  divElement = viewChild<ElementRef>('map');

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;
    const element = this.divElement()!.nativeElement;

    const map = new mapboxgl.Map({
      container: element, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });
  }
}
