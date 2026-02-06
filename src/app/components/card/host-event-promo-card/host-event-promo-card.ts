import { isPlatformBrowser } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, PLATFORM_ID } from '@angular/core';
import { NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'host-event-promo-card',
  styleUrl: './host-event-promo-card.scss',
  templateUrl: './host-event-promo-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostEventPromoCard {
  navCtrl = inject(NavController);

  // platform
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  openLinkedin(): void {
    if (this.isBrowser) window.open(`https://www.linkedin.com/company/networked-ai`, '_blank');
  }

  openInstagram(): void {
    if (this.isBrowser) window.open(`https://www.instagram.com/networked_ai`, '_blank');
  }
}
