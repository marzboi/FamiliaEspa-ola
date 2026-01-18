import { Component, inject, input, output } from '@angular/core';
import { FilterService } from '../../../services/filter.service';

@Component({
  selector: 'app-sidebar-filter',
  imports: [],
  templateUrl: './sidebar-filter.html',
  styleUrl: './sidebar-filter.css',
})
export class SidebarFilter {
  readonly filterService = inject(FilterService);
  readonly isOpen = input<boolean>(false);
  readonly closePanel = output<void>();

  get communities() {
    return this.filterService.allCommunities();
  }

  toggleCommunity(name: string) {
    this.filterService.toggleCommunity(name);
  }

  isSelected(name: string): boolean {
    return this.filterService.isSelected(name);
  }

  selectAll() {
    this.filterService.selectAll();
  }

  clearAll() {
    this.filterService.clearAll();
  }

  close() {
    this.closePanel.emit();
  }
}
