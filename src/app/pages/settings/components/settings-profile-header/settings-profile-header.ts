import { AuthService } from '@/services/auth.service';
import { NgOptimizedImage } from '@angular/common';
import { ModalService } from '@/services/modal.service';
import { NavigationService } from '@/services/navigation.service';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { input, output, Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';

@Component({
  selector: 'settings-profile-header',
  styleUrl: './settings-profile-header.scss',
  templateUrl: './settings-profile-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage]
})
export class SettingsProfileHeader {
  // inputs
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private navigationService = inject(NavigationService);

  currentUser = computed(() => this.authService.currentUser());
  showEditProfile = input(true);

  // outputs
  editProfileClick = output<void>();
  qrCodeClick = output<void>();

  diamondPath = computed(() => {
    const points = this.currentUser()?.total_gamification_points || 0;

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

  onEditProfileClick(): void {
    this.navigationService.navigateForward('/profile/edit');
  }

  async onQrCodeClick() {
    const user = this.currentUser();
    if (user) {
      await this.modalService.openShareProfileModal(user);
    }
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  onImageError(event: any): void {
    onImageError(event);
  }
}

