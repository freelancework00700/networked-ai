import { Component, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { NgOptimizedImage } from '@angular/common';
import { ToasterService } from '@/services/toaster.service';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { IUser } from '@/interfaces/IUser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'profile-image-preview-overlay',
  styleUrl: './profile-image-preview-overlay.scss',
  templateUrl: './profile-image-preview-overlay.html',
  imports: [IonIcon, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileImagePreviewOverlay {

  user = input<IUser | null>(null);
  isViewingOtherProfile = input<boolean>(false);
  closeOverlay = output<void>();

  private toasterService = inject(ToasterService);

  close(): void {
    this.closeOverlay.emit();
  }

  async onCopyLink(): Promise<void> {
    try {
      const user = this.user();
      if (!user) return;
      const frontendUrl = environment.frontendUrl || 'https://dev.app.net-worked.ai';
      const profileLink = `${frontendUrl}/${user.username || ''}`;
      await navigator.clipboard.writeText(profileLink);
      this.toasterService.showSuccess('Link copied to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
      this.toasterService.showError('Failed to copy link');
    }
  }

  onShare(): void {
  }

  onBusinessCard(): void {
  }

  getImage(user: IUser | null): string {
    return user?.image_url as string || user?.thumbnail_url || '';
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  getImageUrl(url: string | undefined | null): string {
    return getImageUrlOrDefault(url || '');
  }
}