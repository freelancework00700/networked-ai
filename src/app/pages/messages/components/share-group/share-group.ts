import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { Component, Input, inject, signal } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'share-group',
  imports: [IonIcon, Button],
  templateUrl: './share-group.html',
  styleUrl: './share-group.scss'
})
export class ShareGroup {
  @Input() data: any;
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);
  group = signal<any | null>(null);
  isDownloading = signal(false);

  ngOnInit() {
    this.group.set(this.data);
  }

  close() {
    this.modalService.close();
  }

  copyLink() {
    navigator.clipboard.writeText(this.group()?.inviteLink || '');
    this.toasterService.showSuccess('Link copied to clipboard');
  }

  async downloadQr() {
    const qrUrl = this.group()?.qrCodeUrl;
    if (!qrUrl) return;

    try {
      this.isDownloading.set(true);

      // Fetch image as blob
      const response = await fetch(qrUrl);
      const blob = await response.blob();

      // Create downloadable link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = `${this.group()?.name || 'qr-code'}.png`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('QR download failed', err);
    } finally {
      this.isDownloading.set(false);
    }
  }

  shareGroup() {
    console.log('Share group');
  }

  onContact() {
    console.log('Contact clicked');
  }

  onShare() {
    console.log('Share clicked');
  }

  onChat() {
    console.log('Chat clicked');
  }

  onMessenger() {
    console.log('Messenger clicked');
  }

  onStory() {
    console.log('Story clicked');
  }
}
