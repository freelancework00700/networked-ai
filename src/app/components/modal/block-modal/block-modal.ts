import { inject, Component, Input, ChangeDetectionStrategy, signal } from '@angular/core';
import { Button } from '@/components/form/button';
import { IonFooter, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { IUser } from '@/interfaces/IUser';
import { NgOptimizedImage } from '@angular/common';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { UserService } from '@/services/user.service';
import { ToasterService } from '@/services/toaster.service';

@Component({
  selector: 'block-modal',
  styleUrl: './block-modal.scss',
  templateUrl: './block-modal.html',
  imports: [Button, IonFooter, IonToolbar, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlockModal {
  // inputs
  @Input() user: IUser | null = null;

  // services
  private modalCtrl = inject(ModalController);
  private userService = inject(UserService);
  private toasterService = inject(ToasterService);

  isLoading = signal(false);

  getUserName(): string {
    if (!this.user) return 'User';
    return this.user.name || this.user.username || 'User';
  }

  getImageUrl(): string {
    if (!this.user) return 'assets/images/profile.jpeg';
    return getImageUrlOrDefault(this.user.thumbnail_url);
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  async blockUser() {
    if (!this.user?.id) {
      this.toasterService.showError('User information not available');
      return;
    }
    try {
      this.isLoading.set(true);
      await this.userService.blockUser(this.user.id);
      this.toasterService.showSuccess('User blocked successfully');
      this.modalCtrl.dismiss(true, 'block');
    } catch (error: any) {
      console.error('Error blocking user:', error);
      this.toasterService.showError(error?.message || 'Failed to block user');
    } finally {
      this.isLoading.set(false);
    }
  }
}
