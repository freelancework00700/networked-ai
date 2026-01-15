import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';
import { IonToolbar, IonFooter, ModalController } from '@ionic/angular/standalone';
import { ToasterService } from '@/services/toaster.service';
import { NgOptimizedImage } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import * as htmlToImage from 'html-to-image';
import { QrCodeComponent } from 'ng-qrcode';
import { 
  Component, 
  inject, 
  ChangeDetectionStrategy, 
  signal, 
  computed,
  Input,
  ViewChild,
  ElementRef
} from '@angular/core';
import { IUser } from '@/interfaces/IUser';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'share-profile-modal',
  styleUrl: './share-profile-modal.scss',
  templateUrl: './share-profile-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonToolbar, IonFooter, Button, IonIcon, NgOptimizedImage, QrCodeComponent]
})
export class ShareProfileModal {
  @ViewChild('downloadableSection', { static: false, read: ElementRef }) downloadableSection?: ElementRef<HTMLDivElement>;
  
  private modalCtrl = inject(ModalController);
  private toasterService = inject(ToasterService);
  
  @Input() user?: IUser;
  
  isDownloading = signal(false);
  
  profileImage = computed(() => {
    const user = this.user;
    return user?.thumbnail_url;
  });
  
  location = computed(() => {
    const user = this.user;
    if (!user?.address) return '';
    const parts = user.address.split(',').map(s => s.trim());
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`;
    }
    return user.address;
  });
  
  profileLink = computed(() => {
    const user = this.user;
    if (!user?.username) return '';
    const frontendUrl = environment.frontendUrl;
    return `${frontendUrl}/${user.username}`;
  });
  
  async copyLink(): Promise<void> {
    const link = this.profileLink();
    if (!link) {
      this.toasterService.showError('Profile link not available');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(link);
      this.toasterService.showSuccess('Link copied to clipboard');
    } catch (error) {
      console.error('Error copying link:', error);
      this.toasterService.showError('Failed to copy link');
    }
  }
  
  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }

  async downloadProfile(): Promise<void> {
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

      const username = this.user?.username || 'profile';
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
  
  onContact(): void {
    const user = this.user;
    if (!user?.mobile) {
      this.toasterService.showError('Phone number not available');
      return;
    }
    
    const link = this.profileLink();
    window.open(`sms://&body=${encodeURIComponent(link)}`, '_blank');
  }
  
  async onShareTo(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      // For web, use Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: this.user?.username || 'Profile',
            text: this.profileLink()
          });
          return;
        } catch (error: any) {
          if (error.name !== 'AbortError') {
            console.error('Error sharing:', error);
          }
          return;
        }
      }
      this.toasterService.showError('Share to is only available on mobile devices');
      return;
    }
    
    const link = this.profileLink();
    if (!link) {
      this.toasterService.showError('Profile link not available');
      return;
    }
    
    try {
      await Share.share({
        title: this.user?.username || 'Profile',
        text: link
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }
  
  onChat(): void {
    // TODO: Implement chat functionality
    console.log('Chat clicked');
  }
  
  onStory(): void {
    const link = this.profileLink();
    if (!link) return;
    
    const text = encodeURIComponent(link);
    const threadsUrl = `https://threads.net/intent/post?text=${text}`;
    window.open(threadsUrl, '_blank');
  }
  
  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }
  
  onImageError(event: Event): void {
    onImageError(event);
  }
  
  getImageUrl(url: string | undefined | null): string {
    return getImageUrlOrDefault(url || '');
  }
}

