import { AfterViewInit, computed, inject, Injectable, signal } from '@angular/core';
import { autonomousCommunities } from './communitiesList';
import { HttpClient } from '@angular/common/http';

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

  #state = signal<any>({
    testimonies: [],
  });

  public testimonies = computed(() => this.#state().testimonies);

  getAllTestimonies = () => {
    this.http.get<any[]>(this.testimoniesUrl).subscribe((res) => {
      this.#state.set({
        testimonies: res,
      });
    });
  };
}
