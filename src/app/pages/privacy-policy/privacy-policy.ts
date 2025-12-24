import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'privacy-policy',
  styleUrl: './privacy-policy.scss',
  templateUrl: './privacy-policy.html',
  imports: [IonToolbar, IonHeader, IonContent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivacyPolicy {
  navCtrl = inject(NavController);
}
