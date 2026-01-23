import { Capacitor } from '@capacitor/core';
import { QrCodeComponent } from 'ng-qrcode';
import { Share } from '@capacitor/share';
import * as htmlToImage from 'html-to-image';
import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Input, signal, inject, Inject, DOCUMENT, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'share-group',
  imports: [IonIcon, Button, QrCodeComponent],
  styleUrl: './share-group.scss',
  templateUrl: './share-group.html'
})
export class ShareGroup {
  @ViewChild('downloadableSection', { static: false, read: ElementRef }) downloadableSection?: ElementRef<HTMLDivElement>;

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

  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }

  async downloadQr() {
    const element = this.downloadableSection?.nativeElement;
    if (!element) {
      return;
    }

    this.isDownloading.set(true);

    try {
      const dataUrl = await htmlToImage.toPng(element, {
        cacheBust: true,
        skipFonts: true
      });

      const username = this.group()?.name || 'group';
      const sanitizedUsername = this.sanitizeFileName(username);
      const fileName = `${sanitizedUsername}-${Date.now()}.png`;

      // WEB
      if (Capacitor.getPlatform() === 'web') {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = fileName;
        link.click();
        return;
      }

      // MOBILE (Android / iOS)
      const base64Data = dataUrl.split(',')[1];

      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents
      });

      // iOS → Share sheet
      if (Capacitor.getPlatform() === 'ios') {
        await Share.share({
          title: 'Download Profile',
          url: savedFile.uri
        });
      } else {
        // Android → Show success message
        this.toasterService.showSuccess('Profile saved successfully!');
      }
    } catch (err) {
      console.error('Profile download failed', err);
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
