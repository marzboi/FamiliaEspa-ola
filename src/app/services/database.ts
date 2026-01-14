import { computed, inject, Injectable, signal } from '@angular/core';
import { autonomousCommunities } from './communitiesList';
import { HttpClient } from '@angular/common/http';

export interface Testimony {
  autonomousCommunity: string;
  consent: boolean;
  email: string;
  ethnicity: string;
  name: string;
  testimony: string;
}

export interface CommunityWithTestimonies {
  name: string;
  lngLat: [number, number];
  testimonies: Testimony[];
}

@Injectable({
  providedIn: 'root',
})
export class Database {
  constructor() {
    this.getAllTestimonies();
  }

  autonomousCommunities = autonomousCommunities;
  private http = inject(HttpClient);
  private testimoniesUrl =
    'https://familiaespanola-d4114-default-rtdb.europe-west1.firebasedatabase.app/testimonies.json';

  #state = signal<{
    testimonies: Testimony[];
    loading: boolean;
  }>({
    testimonies: [],
    loading: true,
  });

  public testimonies = computed(() => this.#state().testimonies);
  public loading = computed(() => this.#state().loading);

  public testimoniesByCommunity = computed<CommunityWithTestimonies[]>(() => {
    const testimonies = this.#state().testimonies;

    const groupedMap = new Map<string, Testimony[]>();

    testimonies.forEach((testimony) => {
      const community = testimony.autonomousCommunity;
      if (!groupedMap.has(community)) {
        groupedMap.set(community, []);
      }
      groupedMap.get(community)!.push(testimony);
    });

    const result: CommunityWithTestimonies[] = [];

    groupedMap.forEach((communityTestimonies, communityName) => {
      const communityData = this.autonomousCommunities.find((c) => c.name === communityName);

      if (communityData) {
        result.push({
          name: communityName === 'NA' ? 'No especificada' : communityName,
          lngLat: communityData.lngLat as [number, number],
          testimonies: communityTestimonies,
        });
      }
    });

    return result;
  });

  getAllTestimonies = () => {
    this.#state.update((state) => ({ ...state, loading: true }));

    this.http.get<Testimony[]>(this.testimoniesUrl).subscribe((res) => {
      this.#state.set({
        testimonies: res || [],
        loading: false,
      });
    });
  };
}
