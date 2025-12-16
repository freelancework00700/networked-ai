import { IonIcon, NavController } from '@ionic/angular/standalone';
import { input, inject, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [IonIcon],
  selector: 'profile-posts',
  styleUrl: './profile-posts.scss',
  templateUrl: './profile-posts.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePosts {
  // inputs
  posts = input<any[]>([]);

  // services
  navCtrl = inject(NavController);
}
