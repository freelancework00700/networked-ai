import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'host-event-promo-card',
  styleUrl: './host-event-promo-card.scss',
  templateUrl: './host-event-promo-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostEventPromoCard {
  navCtrl = inject(NavController);

  openLinkedin(): void {
    window.open(`https://www.linkedin.com/company/networked-ai`, '_blank');
  }

  openInstagram(): void {
    window.open(`https://www.instagram.com/networked_ai`, '_blank');
  }
}
