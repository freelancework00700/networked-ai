import { Component, ChangeDetectionStrategy, inject, Input } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonIcon } from '@ionic/angular/standalone';
import { ShareProfileDialog } from '../share-profile-dialog/share-profile-dialog';

@Component({
  selector: 'app-profile-long-press-menu',
  styleUrl: './profile-long-press-menu.scss',
  templateUrl: './profile-long-press-menu.html',
  imports: [IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileLongPressMenu {
  private modalCtrl = inject(ModalController);
  
  @Input() userName: string = 'Sandra Tanner';
  @Input() userImage: string = '/assets/svg/user_image.svg';

  async handleCopyLink() {
    // Handle copy link
    const link = `networked-ai.com/${this.userName.toLowerCase().replace(' ', '_')}`;
    await navigator.clipboard.writeText(link);
    this.close();
  }

  handleShare() {
    // Handle share
    this.close();
  }

  async handleBusinessCard() {
    // Close current modal and open share profile dialog
    this.close();
    
    // Small delay to ensure current modal is closed
    setTimeout(async () => {
      const modal = await this.modalCtrl.create({
        component: ShareProfileDialog,
        mode: 'ios',
        handle: true,
        breakpoints: [0, 1],
        initialBreakpoint: 1,
        backdropDismiss: true,
        cssClass: 'share-profile-modal'
      });
      await modal.present();
    }, 100);
  }

  handleEdit() {
    // Handle edit profile picture
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}

