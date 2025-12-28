import { NavigationService } from '@/services/navigation.service';
import { inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader, IonContent, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'terms-of-service',
  styleUrl: './terms-of-service.scss',
  templateUrl: './terms-of-service.html',
  imports: [IonHeader, IonToolbar, IonContent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsOfService {
  // services
  navigationService = inject(NavigationService);
}
