import { NavigationService } from '@/services/navigation.service';
import { inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader, IonContent, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'privacy-policy',
  styleUrl: './privacy-policy.scss',
  templateUrl: './privacy-policy.html',
  imports: [IonHeader, IonToolbar, IonContent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicy {
  // services
  navigationService = inject(NavigationService);
}
