import { Component, ChangeDetectionStrategy, input, inject, computed } from '@angular/core';
import { IonIcon, NavController, PopoverController } from '@ionic/angular/standalone';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { ListPopover, type PopoverItem } from '@/components/common/list-popover';

@Component({
  selector: 'page-header',
  styleUrl: './page-header.scss',
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon]
})
export class PageHeader {
  showMenuIcon = input<boolean>(false);

  userName = computed(() => {
    const currentUser = this.authService.currentUser();
    return currentUser?.name || 'User';
  });

  private navCtrl = inject(NavController);
  private popoverCtrl = inject(PopoverController);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  onNotificationClick(): void {
    this.navCtrl.navigateForward('/notification');
  }

  async onUsernameClick(event: Event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: ListPopover,
      event: event as MouseEvent,
      componentProps: {
        type: 'accounts'
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data) {
      if (data.addAccount) {
        await this.handleAddAccount();
      } else if (data.signOut) {
        await this.handleSignOut();
      } else if (data.account) {
        await this.handleAccountSwitch(data.account);
      }
    }
  }

  async onMenuIconClick(event: Event): Promise<void> {
    const popover = await this.popoverCtrl.create({
      component: ListPopover,
      event: event as MouseEvent,
      componentProps: {
        type: 'menu'
      }
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data?.menuItem) {
      await this.handleMenuItemSelect(data.menuItem);
    }
  }

  private async handleAddAccount(): Promise<void> {
    this.navCtrl.navigateForward('/login');
  }

  private async handleSignOut(): Promise<void> {
    try {
      const result = await this.modalService.openConfirmModal({
        title: 'Sign Out',
        description: 'Are you sure you want to sign out?',
        confirmButtonLabel: 'Sign Out',
        cancelButtonLabel: 'Cancel',
        confirmButtonColor: 'danger',
        iconName: 'pi-sign-out',
        iconBgColor: '#C73838',
        iconPosition: 'center'
      });

      if (result && result.role === 'confirm') {
        await this.authService.signOut();
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      this.toasterService.showError(error.message || 'Failed to sign out. Please try again.');
    }
  }

  private async handleAccountSwitch(account: any): Promise<void> {
    if (!account?.id) return;

    try {
      this.authService.switchAccount(account.id);
    } catch (error: any) {
      console.error('Account switch error:', error);
      this.toasterService.showError(error.message || 'Failed to switch account. Please try again.');
    }
  }

  private async handleMenuItemSelect(item: PopoverItem): Promise<void> {
    if (item.label === 'Settings') {
      this.navCtrl.navigateForward('/settings');
    } else if (item.label === 'Favorites') {
      console.log('Favorites clicked');
    }
  }
}
