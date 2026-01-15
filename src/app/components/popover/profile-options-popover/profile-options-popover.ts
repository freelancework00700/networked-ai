import { PopoverController } from '@ionic/angular/standalone';
import { NavigationService } from '@/services/navigation.service';
import { ModalService } from '@/services/modal.service';
import { Input, inject, Component, ChangeDetectionStrategy } from '@angular/core';
import { IUser } from '@/interfaces/IUser';

@Component({
  selector: 'profile-options-popover',
  styleUrl: './profile-options-popover.scss',
  templateUrl: './profile-options-popover.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileOptionsPopover {
  // inputs
  @Input() isViewingOtherProfile: boolean = false;
  @Input() user?: IUser;
  
  // services
  private popoverCtrl = inject(PopoverController);
  private navigationService = inject(NavigationService);
  private modalService = inject(ModalService);

  async openLikedEvents(): Promise<void> {
    this.navigationService.navigateForward('/event/all?eventFilter=liked');
    await this.popoverCtrl.dismiss();
  }

  async openSetting(): Promise<void> {
    this.navigationService.navigateForward('/settings');
    await this.popoverCtrl.dismiss();
  }

  async openReportUser(): Promise<void> {
    await this.popoverCtrl.dismiss();
    if (!this.user) return;
    await this.modalService.openReportModal('User', this.user);
  }
}
