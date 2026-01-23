import { IAuthUser } from '@/interfaces/IAuth';
import { NgOptimizedImage } from '@angular/common';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { PopoverController } from '@ionic/angular/standalone';
import { NavigationService } from '@/services/navigation.service';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { inject, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  imports: [NgOptimizedImage],
  selector: 'account-switcher-popover',
  styleUrl: './account-switcher-popover.scss',
  templateUrl: './account-switcher-popover.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSwitcherPopover {
  // services
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private popoverCtrl = inject(PopoverController);
  private navigationService = inject(NavigationService);

  // signals
  accounts = this.authService.allUsers;
  activeAccount = this.authService.currentUser;

  async switchAccount(account: IAuthUser): Promise<void> {
    await this.popoverCtrl.dismiss();
    this.authService.switchActiveAccount(account.id);
  }

  async login(): Promise<void> {
    await this.popoverCtrl.dismiss();
    this.navigationService.navigateForward('/login');
  }

  async signOut(): Promise<void> {
    await this.popoverCtrl.dismiss();
    const result = await this.modalService.openConfirmModal({
      title: 'Sign Out',
      iconBgColor: '#C73838',
      iconPosition: 'center',
      iconName: 'pi-sign-out',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      confirmButtonLabel: 'Sign Out',
      description: 'Are you sure you want to sign out?'
    });

    if (result && result.role === 'confirm') {
      await this.authService.signOut();
    }
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl, 'assets/images/profile.jpeg');
  }
}
