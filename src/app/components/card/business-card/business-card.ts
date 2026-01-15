import { IonIcon } from '@ionic/angular/standalone';
import { Button } from '@/components/form/button';
import { NavigationService } from '@/services/navigation.service';
import { AuthService } from '@/services/auth.service';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

@Component({
  selector: 'business-card',
  imports: [IonIcon, Button],
  styleUrl: './business-card.scss',
  templateUrl: './business-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessCard {
  private navigationService = inject(NavigationService);
  private authService = inject(AuthService);
  
  user = input<any>(null);
  
  currentUser = computed(() => this.user() || this.authService.currentUser());
  
  goToEditProfile(): void {
    this.navigationService.navigateForward('/profile/edit');
  }
}
