import { Button } from '@/components/form/button';
import { NavController } from '@ionic/angular/standalone';
import { input, inject, output, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [Button],
  selector: 'user-card-list',
  styleUrl: './user-card-list.scss',
  templateUrl: './user-card-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardList {
  // inputs
  user = input.required<any>();

  // outputs
  handleClick = output<string>();

  // services
  private navCtrl = inject(NavController);

  onAddClick(id: string): void {
    if (this.isSelected(id)) {
      this.navCtrl.navigateForward(['/chat-room', id]);
    } else {
      this.handleClick.emit(id);
    }
  }

  isSelected(id: string): boolean {
    return this.user().networked;
  }
}
