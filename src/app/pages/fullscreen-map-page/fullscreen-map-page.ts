import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import mapboxgl from 'mapbox-gl';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { CommunityWithTestimonies, Database, Testimony } from '../../services/database';
import { FilterService } from '../../services/filter.service';
import { SidebarFilter } from '../../shared/components/sidebar-filter/sidebar-filter';

mapboxgl.accessToken = environment.mapboxKey;

@Component({
  selector: 'app-fullscreen-map-page',
  imports: [DecimalPipe, SidebarFilter],
  templateUrl: './fullscreen-map-page.html',
  styles: `
    #map-container {
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
  private api = inject(Database);
  private filterService = inject(FilterService);
  private markers: mapboxgl.Marker[] = [];

  isSidebarOpen = signal(false);

  toggleSidebar() {
    this.isSidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  selectedTestimony = signal<Testimony | null>(null);
  isModalOpen = signal(false);

  private allTestimonies: Testimony[] = [];

  constructor() {
    (window as any).openTestimonyModal = (index: number, communityName: string) => {
      const community = this.api.testimoniesByCommunity().find((c) => c.name === communityName);
      if (community && community.testimonies[index]) {
        this.openModal(community.testimonies[index]);
      }
    };
  }

  openModal(testimony: Testimony) {
    this.selectedTestimony.set(testimony);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.selectedTestimony.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.isModalOpen()) {
      this.closeModal();
    }
  }

  zoom = signal(6);
  coordinates = signal({
    lng: -3.70838,
    lat: 40.40517,
  });

  zoomEffect = effect(() => {
    if (!this.map()) return;

    this.map()?.zoomTo(this.zoom());
  });

  testimoniesEffect = effect(() => {
    const testimoniesByCommunity = this.api.testimoniesByCommunity();
    const selectedCommunities = this.filterService.selectedCommunityNames();
    const map = this.map();

    if (!map || testimoniesByCommunity.length === 0) return;

    const filteredCommunities = testimoniesByCommunity.filter((community) => {
      const originalName = community.name === 'No especificada' ? 'NA' : community.name;
      return selectedCommunities.has(originalName) || selectedCommunities.has(community.name);
    });

    this.updateMarkers(filteredCommunities);
  });

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    this.api.getAllTestimonies();

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
      const testimoniesByCommunity = this.api.testimoniesByCommunity();
      if (testimoniesByCommunity.length > 0) {
        this.updateMarkers(testimoniesByCommunity);
      }
    });

    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.ScaleControl());

    this.map.set(map);
  }

  private updateMarkers(communities: CommunityWithTestimonies[]) {
    const map = this.map();
    if (!map) return;

    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    communities.forEach((community) => {
      const popupContent = this.createPopupContent(community);

      const popup = new mapboxgl.Popup({
        maxWidth: '300px',
        className: 'testimony-popup',
      }).setHTML(popupContent);

      const markerElement = document.createElement('div');
      markerElement.className = 'community-marker';
      markerElement.innerHTML = `
        <div style="
          background-color: #ef4444;
          color: white;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          cursor: pointer;
        ">
          ${community.testimonies.length}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat(community.lngLat)
        .setPopup(popup)
        .addTo(map);

      this.markers.push(marker);
    });
  }

  private createPopupContent(community: CommunityWithTestimonies): string {
    const testimoniesHtml = community.testimonies
      .map(
        (t, index) => `
        <div
          onclick="window.openTestimonyModal(${index}, '${community.name.replace(/'/g, "\\'")}')"
          style="
            border-bottom: 1px solid #e5e7eb;
            padding: 12px 0;
            cursor: pointer;
            transition: background-color 0.2s;
          "
          onmouseover="this.style.backgroundColor='#f3f4f6'"
          onmouseout="this.style.backgroundColor='transparent'"
        >
          <div style="
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 4px;
          ">${t.name}</div>
          <div style="
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 8px;
          ">${t.ethnicity}</div>
          <div style="
            font-size: 13px;
            color: #374151;
            line-height: 1.5;
            max-height: 100px;
            overflow-y: auto;
          ">${t.testimony.substring(0, 250)}${t.testimony.length > 250 ? '...' : ''}</div>
          <div style="
            font-size: 12px;
            color: #ef4444;
            margin-top: 8px;
            font-weight: 500;
          ">Click para leer más →</div>
        </div>
      `,
      )
      .join('');

    return `
      <div style="max-height: 350px; overflow-y: auto;">
        <h3 style="
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #ef4444;
        ">
          ${community.name}
          <span style="
            font-weight: 400;
            font-size: 14px;
            color: #6b7280;
          ">(${community.testimonies.length} testimonio${
            community.testimonies.length > 1 ? 's' : ''
          })</span>
        </h3>
        ${testimoniesHtml}
      </div>
    `;
  }
}
