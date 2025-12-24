import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'terms-of-service',
  styleUrl: './terms-of-service.scss',
  templateUrl: './terms-of-service.html',
  imports: [IonToolbar, IonHeader, IonContent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsOfService {
  navCtrl = inject(NavController);
}
