import { Component, computed, inject } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'host-first-event-card',
  styleUrl: './host-first-event-card.scss',
  templateUrl: './host-first-event-card.html'
})
export class HostFirstEventCard {
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);

  isLoggedIn = computed(() => !!this.authService.currentUser());

  onClick(): void {
    if (this.isLoggedIn()) {
      this.navCtrl.navigateForward('/event');
    } else {
      this.navCtrl.navigateForward('/login');
    }
  }
}
