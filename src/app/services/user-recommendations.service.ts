import { Injectable, inject, signal } from '@angular/core';
import { IUser } from '@/interfaces/IUser';
import { NetworkService } from './network.service';
import { ToasterService } from './toaster.service';

@Injectable({ providedIn: 'root' })
export class UserRecommendationsService {
  private networkService = inject(NetworkService);
  private toasterService = inject(ToasterService);

  // Shared state for recommendations
  peopleCards = signal<IUser[]>([]);

  async loadRecommendations(): Promise<void> {
    const shouldLoad = this.peopleCards().length === 0;
    if (!shouldLoad) return;

    try {
      const recommendations = await this.networkService.getNetworkRecommendations();
      this.peopleCards.set(recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      this.toasterService.showError('Failed to load recommendations');
    }
  }

  removeUser(userId: string): void {
    this.peopleCards.update((list) => list.filter((user) => user.id !== userId));
    if (this.peopleCards().length === 0) {
      this.loadRecommendations();
    }
  }
}
