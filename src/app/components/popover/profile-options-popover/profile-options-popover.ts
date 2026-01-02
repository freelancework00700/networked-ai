import { PopoverController } from '@ionic/angular/standalone';
import { NavigationService } from '@/services/navigation.service';
import { inject, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'profile-options-popover',
  styleUrl: './profile-options-popover.scss',
  templateUrl: './profile-options-popover.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileOptionsPopover {
  // services
  private popoverCtrl = inject(PopoverController);
  private navigationService = inject(NavigationService);

  async openLikedEvents(): Promise<void> {
    this.navigationService.navigateForward('/event/all');
    await this.popoverCtrl.dismiss();
  }

  async openSetting(): Promise<void> {
    this.navigationService.navigateForward('/settings');
    await this.popoverCtrl.dismiss();
  }
}
