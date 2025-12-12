import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-share-profile-dialog',
  styleUrl: './share-profile-dialog.scss',
  templateUrl: './share-profile-dialog.html',
  imports: [IonIcon],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShareProfileDialog {
  private modalCtrl = inject(ModalController);
  
  userName = signal('Sandra T.');
  username = signal('usernamehere');
  shareableLink = signal('networked-ai.com/username_here');
  qrCodeUrl = signal('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent('networked-ai.com/username_here'));

  copyLink() {
    navigator.clipboard.writeText(this.shareableLink()).then(() => {
      // Show toast or feedback
      console.log('Link copied to clipboard');
    });
  }

  downloadProfile() {
    // Handle download logic
    console.log('Download profile');
  }

  handleContact() {
    // Handle contact action
    this.close();
  }

  handleShareTo() {
    // Handle share to action
    this.close();
  }

  handleChat() {
    // Handle chat action
    this.close();
  }

  handleMessenger() {
    // Handle messenger action
    this.close();
  }

  handleStory() {
    // Handle story action
    this.close();
  }

  close() {
    this.modalCtrl.dismiss();
  }
}

