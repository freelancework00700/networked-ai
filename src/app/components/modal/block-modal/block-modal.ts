import { inject, Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { Button } from '@/components/form/button';
import { IonFooter, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { IUser } from '@/interfaces/IUser';
import { NgOptimizedImage } from '@angular/common';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';

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

  blockUser() {
    this.modalCtrl.dismiss(true, 'block');
  }
}
