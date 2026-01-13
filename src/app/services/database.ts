import { Injectable } from '@angular/core';
import { autonomousCommunities } from './communitiesList';

@Injectable({
  providedIn: 'root',
})
export class Database {
  constructor() {}

  autonomousCommunities = autonomousCommunities;
}
