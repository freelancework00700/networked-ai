import { Button } from '@/components/form/button';
import { NavController } from '@ionic/angular/standalone';
import { NgOptimizedImage } from '@angular/common';
import { input, inject, Component, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { NavigationService } from '@/services/navigation.service';
import { NetworkService } from '@/services/network.service';
import { ToasterService } from '@/services/toaster.service';
import { ModalService } from '@/services/modal.service';
import { ConnectionStatus } from '@/enums/connection-status.enum';
import { AuthService } from '@/services/auth.service';

@Component({
  imports: [Button, NgOptimizedImage],
  selector: 'user-card-list',
  styleUrl: './user-card-list.scss',
  templateUrl: './user-card-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardList {
  // inputs
  user = input.required<any>();

  // services
  private navCtrl = inject(NavController);
  private navigationService = inject(NavigationService);
  private networkService = inject(NetworkService);
  private toasterService = inject(ToasterService);
  private modalService = inject(ModalService);
  authService = inject(AuthService);

  // signals
  isAdding = signal<boolean>(false);
  isAccepting = signal<boolean>(false);
  isWithdrawing = signal<boolean>(false);

  // computed
  userImage = computed(() => {
    const user = this.user();
    return getImageUrlOrDefault(user?.thumbnail_url || user?.image_url || '');
  });

  diamondPath = computed(() => {
    const points = this.user()?.total_gamification_points || 0;

    if (points >= 50000) {
      return '/assets/svg/gamification/diamond-50k.svg';
    } else if (points >= 40000) {
      return '/assets/svg/gamification/diamond-40k.svg';
    } else if (points >= 30000) {
      return '/assets/svg/gamification/diamond-30k.svg';
    } else if (points >= 20000) {
      return '/assets/svg/gamification/diamond-20k.svg';
    } else if (points >= 10000) {
      return '/assets/svg/gamification/diamond-10k.svg';
    } else if (points >= 5000) {
      return '/assets/svg/gamification/diamond-5k.svg';
    } else {
      return '/assets/svg/gamification/diamond-1k.svg';
    }
  });

  connectionStatus = computed(() => {
    const user = this.user();
    return user?.connection_status as ConnectionStatus | undefined;
  });

  isConnected = computed(() => this.connectionStatus() === ConnectionStatus.CONNECTED);
  isRequestSent = computed(() => this.connectionStatus() === ConnectionStatus.REQUEST_SENT);
  isRequestReceived = computed(() => this.connectionStatus() === ConnectionStatus.REQUEST_RECEIVED);
  isNotConnected = computed(() => !this.connectionStatus() || this.connectionStatus() === ConnectionStatus.NOT_CONNECTED);

  // Get button config based on connection status
  buttonConfig = computed(() => {
    // Hide buttons if hideButtons is true or if user has parent_user_id (is a guest)
    if (this.user()?.parent_user_id) {
      return null;
    }

    if (this.isConnected()) {
      return { label: 'Message', isLoading: false, disabled: false };
    } else if (this.isRequestSent()) {
      return { label: 'Pending', isLoading: this.isWithdrawing(), disabled: this.isWithdrawing() };
    } else if (this.isRequestReceived()) {
      return { label: 'Accept', isLoading: this.isAccepting(), disabled: this.isAccepting() };
    } else {
      return { label: 'Add', isLoading: this.isAdding(), disabled: this.isAdding() };
    }
  });

  async onButtonClick(): Promise<void> {
    const user = this.user();
    const userId = user?.id;
    if (!userId) return;

    if (this.isConnected()) {
      this.messageUser();
    } else if (this.isRequestSent()) {
      this.showWithdrawInvitationAlert();
    } else if (this.isRequestReceived()) {
      this.acceptNetworkRequest();
    } else {
      this.addToNetwork();
    }
  }

  messageUser(): void {
    const currentUserId = this.authService.currentUser()?.id;
    const otherUserId = this.user()?.id;

    if (currentUserId && otherUserId) {
      this.navCtrl.navigateForward('/chat-room', {
        state: {
          user_ids: [currentUserId, otherUserId],
          is_personal: true
        }
      });
    }
  }

  async addToNetwork(): Promise<void> {
    const userId = this.user()?.id;
    if (!userId) return;
    try {
      this.isAdding.set(true);
      await this.networkService.sendNetworkRequest(userId);
      this.toasterService.showSuccess('Network request sent successfully');
    } catch (error) {
      console.error('Error sending network request:', error);
      this.toasterService.showError('Failed to send network request');
    } finally {
      this.isAdding.set(false);
    }
  }

  async acceptNetworkRequest(): Promise<void> {
    const userId = this.user()?.id;
    if (!userId) return;
    try {
      this.isAccepting.set(true);
      await this.networkService.acceptNetworkRequest(userId);
      this.toasterService.showSuccess('Network request accepted');
    } catch (error) {
      console.error('Error accepting network request:', error);
      this.toasterService.showError('Failed to accept network request');
    } finally {
      this.isAccepting.set(false);
    }
  }

  async showWithdrawInvitationAlert(): Promise<void> {
    const user = this.user();
    const username = user?.username || user?.name || 'this user';

    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/alert-white.svg',
      title: 'Withdraw Invitation?',
      description: `Are you sure you want to withdraw your network invitation to ${username}?`,
      confirmButtonLabel: 'Withdraw',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconBgColor: '#C73838',
      iconPosition: 'left',
      onConfirm: async () => {
        try {
          this.isWithdrawing.set(true);
          await this.networkService.cancelNetworkRequest(user.id);
          this.toasterService.showSuccess('Network invitation withdrawn');
        } catch (error) {
          console.error('Error withdrawing network invitation:', error);
          this.toasterService.showError('Failed to withdraw network invitation');
          throw error;
        } finally {
          this.isWithdrawing.set(false);
        }
      }
    });
  }

  onCardClick(): void {
    const user = this.user();
    if (user?.parent_user_id) {
      return;
    }
    const username = user?.username;
    if (username) {
      this.navigationService.navigateForward(`/${username}`);
    }
  }

  onImageError(event: Event): void {
    onImageError(event);
  }
}
