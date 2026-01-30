import { Capacitor } from '@capacitor/core';
import { QrCodeComponent } from 'ng-qrcode';
import { Share } from '@capacitor/share';
import * as htmlToImage from 'html-to-image';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { MessagesService } from '@/services/messages.service';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { IonFooter, IonToolbar } from '@ionic/angular/standalone';
import { CommonShareFooter } from '@/components/common/common-share-footer';
import { Input, signal, inject, Inject, DOCUMENT, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'share-group',
  imports: [Button, IonFooter, IonToolbar, QrCodeComponent, CommonShareFooter],
  styleUrl: './share-group.scss',
  templateUrl: './share-group.html'
})
export class ShareGroup {
  @ViewChild('downloadableSection', { static: false, read: ElementRef }) downloadableSection?: ElementRef<HTMLDivElement>;

  @Input() data: any;
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);
  private messagesService = inject(MessagesService);
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
          title: 'Download Group QR Code',
          url: savedFile.uri
        });
      } else {
        // Android → Show success message
        this.toasterService.showSuccess('Group QR code saved successfully!');
      }
    } catch (err) {
      console.error('Profile download failed', err);
    } finally {
      this.isDownloading.set(false);
    }
  }

  getInviteLink(): string {
    return this.group()?.inviteLink || '';
  }

  getGroupName(): string {
    return this.group()?.name || 'Group';
  }

  onContact(): void {
    const link = this.getInviteLink();
    if (!link) {
      this.toasterService.showError('Group invite link not available');
      return;
    }

    const message = encodeURIComponent(`Join my group "${this.getGroupName()}": ${link}`);
    window.open(`sms:?body=${message}`, '_self');
  }

  async onCopyLink(): Promise<void> {
    this.copyLink();
  }

  async onShareTo(): Promise<void> {
    const link = this.getInviteLink();
    if (!link) {
      this.toasterService.showError('Group invite link not available');
      return;
    }
    try {
      await Share.share({
        text: link
      });
    } catch (error: any) {
      if (error.message && !error.message.includes('cancel')) {
        console.error('Error sharing:', error);
      }
    }
  }

  async onChat(): Promise<void> {
    const result = await this.modalService.openConfirmModal({
      title: 'Please Confirm',
      description: 'It will send a message to your entire network. Are you sure you want to proceed?',
      confirmButtonLabel: 'Send Message',
      cancelButtonLabel: 'Close',
      confirmButtonColor: 'primary',
      onConfirm: async () => {
        const link = this.getInviteLink();
        
        if (!link) {
          this.toasterService.showError('Group invite link not available');
          return;
        }

        try {
          const groupMessage = `Join my group "${this.getGroupName()}": ${link}`;

          const payload = {
            type: 'Text',
            message: groupMessage,
            send_entire_network: true
          };

          // Call share API
          await this.messagesService.shareInChat(payload);
          this.toasterService.showSuccess('Group shared to your network successfully');
        } catch (error: any) {
          console.error('Error sharing group in chat:', error);
          this.toasterService.showError(error?.message || 'Failed to share group');
          throw error;
        }
      }
    });
  }

  onEmail(): void {
    const link = this.getInviteLink();
    if (!link) {
      this.toasterService.showError('Group invite link not available');
      return;
    }

    const subject = encodeURIComponent(`Join my group - ${this.getGroupName()}`);
    const body = encodeURIComponent(`Hi,\n\nJoin my group "${this.getGroupName()}": ${link}`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }

  onWhatsapp(): void {
    const link = this.getInviteLink();
    if (!link) {
      this.toasterService.showError('Group invite link not available');
      return;
    }

    const message = encodeURIComponent(`Join my group "${this.getGroupName()}": ${link}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  onShareToX(): void {
    const link = this.getInviteLink();
    if (!link) return;

    const text = encodeURIComponent(link);
    const twitterUrl = `https://x.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank');
  }

  onShareToThreads(): void {
    const link = this.getInviteLink();
    if (!link) return;

    const text = encodeURIComponent(link);
    const threadsUrl = `https://threads.net/intent/post?text=${text}`;
    window.open(threadsUrl, '_blank');
  }
}
