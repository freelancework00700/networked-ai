import { QrCodeComponent } from 'ng-qrcode';
import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { Input, signal, inject, Inject, DOCUMENT, Component } from '@angular/core';

@Component({
  selector: 'share-group',
  imports: [IonIcon, Button, QrCodeComponent],
  styleUrl: './share-group.scss',
  templateUrl: './share-group.html'
})
export class ShareGroup {
  @Input() data: any;
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);
  @Inject(DOCUMENT) private document = inject(DOCUMENT);
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
      const a = this.document.createElement('a');

      a.href = url;
      a.download = `${this.group()?.name || 'qr-code'}.png`;
      this.document.body.appendChild(a);
      a.click();

      // Cleanup
      this.document.body.removeChild(a);
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
