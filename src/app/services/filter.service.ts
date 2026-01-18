import { computed, inject, Injectable, signal } from '@angular/core';
import { autonomousCommunities } from './communitiesList';
import { Database } from './database';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private database = inject(Database);

  readonly allCommunities = computed(() => {
    const communitiesWithTestimonies = this.database.testimoniesByCommunity();
    const communityNames = new Set(communitiesWithTestimonies.map((c) => c.name));

    return autonomousCommunities
      .filter((c) => c.name !== 'NA')
      .filter((c) => communityNames.has(c.name));
  });

  private selectedCommunities = signal<Set<string>>(new Set());

  private initialized = false;

  readonly selectedCommunityNames = computed(() => {
    const communities = this.allCommunities();
    if (!this.initialized && communities.length > 0) {
      this.initialized = true;
      this.selectedCommunities.set(new Set(communities.map((c) => c.name)));
    }
    return this.selectedCommunities();
  });

  isSelected(communityName: string): boolean {
    return this.selectedCommunities().has(communityName);
  }

  toggleCommunity(communityName: string): void {
    this.selectedCommunities.update((current) => {
      const updated = new Set(current);
      if (updated.has(communityName)) {
        updated.delete(communityName);
      } else {
        updated.add(communityName);
      }
      return updated;
    });
  }

  selectAll(): void {
    this.selectedCommunities.set(new Set(this.allCommunities().map((c) => c.name)));
  }

  clearAll(): void {
    this.selectedCommunities.set(new Set());
  }

  get allSelected(): boolean {
    return this.selectedCommunities().size === this.allCommunities().length;
  }

  get noneSelected(): boolean {
    return this.selectedCommunities().size === 0;
  }
}
