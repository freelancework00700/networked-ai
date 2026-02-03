import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';
import { IonHeader, IonToolbar, IonContent, IonFooter } from '@ionic/angular/standalone';
import { NavigationService } from '@/services/navigation.service';
import { AuthService } from '@/services/auth.service';
import { ToasterService } from '@/services/toaster.service';
import { PermissionsService } from '@/services/permissions.service';
import { Router } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import * as htmlToImage from 'html-to-image';
import { QrCodeComponent } from 'ng-qrcode';
import { Component, inject, ChangeDetectionStrategy, signal, computed, OnInit, ViewChild, ElementRef } from '@angular/core';
import { IUser } from '@/interfaces/IUser';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { environment } from 'src/environments/environment';
import { CommonShareFooter } from '@/components/common/common-share-footer/common-share-footer';
import { ModalService } from '@/services/modal.service';
import { MessagesService } from '@/services/messages.service';

interface SocialLink {
  type: 'website' | 'facebook' | 'twitter' | 'instagram' | 'snapchat' | 'linkedin' | 'phone' | 'email';
  icon: string;
  label: string;
  value: string;
  href: string;
}

@Component({
  selector: 'business-card',
  styleUrl: './business-card.scss',
  templateUrl: './business-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, IonToolbar, IonHeader, IonFooter, Button, IonIcon, NgOptimizedImage, QrCodeComponent, CommonShareFooter]
})
export class BusinessCardPage implements OnInit {
  @ViewChild('cardDownloadSection', { static: false, read: ElementRef }) cardDownloadSection?: ElementRef<HTMLDivElement>;

  private navigationService = inject(NavigationService);
  authService = inject(AuthService);
  private router = inject(Router);
  private toasterService = inject(ToasterService);
  private modalService = inject(ModalService);
  private messagesService = inject(MessagesService);

  user = signal<IUser | null>(null);
  showMoreLinks = signal(false);
  isDownloading = signal(false);

  isNativePlatform = computed(() => Capacitor.isNativePlatform());

  private readonly socialConfigs = [
    { type: 'website', icon: 'globe-outline', key: 'website' },
    { type: 'facebook', icon: 'logo-facebook', key: 'facebook' },
    { type: 'twitter', icon: 'logo-twitter', key: 'twitter' },
    { type: 'instagram', icon: 'logo-instagram', key: 'instagram' },
    { type: 'snapchat', icon: 'logo-snapchat', key: 'snapchat' },
    { type: 'linkedin', icon: 'logo-linkedin', key: 'linkedin' }
  ] as const;

  profileImage = computed(() => {
    const user = this.user();
    return user?.thumbnail_url;
  });

  location = computed(() => {
    const user = this.user();
    if (!user?.address) return '';
    const parts = user.address.split(',').map((s) => s.trim());
    if (parts.length >= 2) {
      return `${parts[0]}, ${parts[1]}`;
    }
    return user.address;
  });

  profileLink = computed(() => {
    const user = this.user();
    if (!user?.username) return '';
    const frontendUrl = environment.frontendUrl;
    return `${frontendUrl}/${user.username}`;
  });

  contactLinks = computed(() => {
    const user = this.user();
    if (!user) return [];

    const links: SocialLink[] = [];

    // Email
    if (user.email?.trim()) {
      links.push({
        type: 'email',
        icon: 'mail-outline',
        label: user.email.trim(),
        value: user.email.trim(),
        href: `mailto:${user.email.trim()}`
      });
    }

    // Phone
    if (user.mobile?.trim()) {
      links.push({
        type: 'phone',
        icon: 'call-outline',
        label: user.mobile.trim(),
        value: user.mobile.trim(),
        href: `tel:${user.mobile.trim()}`
      });
    }

    return links;
  });

  socialLinks = computed(() => {
    const user = this.user();
    if (!user?.socials) return [];

    const links: SocialLink[] = [];

    for (const config of this.socialConfigs) {
      const value = user.socials[config.key as keyof typeof user.socials];
      if (value?.trim()) {
        const trimmedValue = value.trim();
        links.push({
          type: config.type,
          icon: config.icon,
          label: this.extractDisplayValue(trimmedValue, config.type),
          value: trimmedValue,
          href: trimmedValue
        });
      }
    }

    return links;
  });

  allLinks = computed(() => {
    return [...this.contactLinks(), ...this.socialLinks()];
  });

  visibleLinks = computed(() => {
    const links = this.allLinks();
    return this.showMoreLinks() ? links : links.slice(0, 2);
  });

  hiddenLinksCount = computed(() => {
    const total = this.allLinks().length;
    const visible = this.visibleLinks().length;
    return total > visible ? total - visible : 0;
  });

  ngOnInit(): void {
    const navigation = this.router.currentNavigation();
    const state: any = navigation?.extras?.state;
    if (state?.user) {
      this.user.set(state.user);
    } else {
      const currentUser = this.authService.currentUser();
      if (currentUser) {
        this.user.set(currentUser);
      }
    }
  }

  private extractDisplayValue(value: string, type: string): string {
    if (!value || value.trim() === '') return '';

    const trimmedValue = value.trim();

    // If not a URL, return as is
    if (!trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
      return type === 'website' ? trimmedValue : trimmedValue.startsWith('@') ? trimmedValue : `@${trimmedValue}`;
    }

    try {
      const url = new URL(trimmedValue);
      const pathname = url.pathname.replace(/^\/+|\/+$/g, '');

      if (type === 'website') {
        return trimmedValue.replace(/^https?:\/\//, '');
      }

      if (type === 'linkedin') {
        const username = pathname.replace(/^in\/+/, '');
        return username.startsWith('@') ? username : `@${username}`;
      }

      const username = pathname || trimmedValue;
      return username.startsWith('@') ? username : `@${username}`;
    } catch {
      return type === 'website' ? trimmedValue : trimmedValue.startsWith('@') ? trimmedValue : `@${trimmedValue}`;
    }
  }

  toggleShowMore(): void {
    this.showMoreLinks.update((value) => !value);
  }

  goBack(): void {
    this.navigationService.back();
  }

  onEdit(): void {
    this.navigationService.navigateForward('/profile/edit');
  }

  private sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  }

  async onDownload(): Promise<void> {
    const element = this.cardDownloadSection?.nativeElement;
    if (!element) {
      return;
    }

    this.isDownloading.set(true);

    try {
      const dataUrl = await htmlToImage.toPng(element, {
        cacheBust: true,
        skipFonts: true
      });

      const username = this.user()?.username || 'business-card';
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

      // iOS → Share sheet (best UX)
      if (Capacitor.getPlatform() === 'ios') {
        await Share.share({
          title: 'Download Business Card',
          url: savedFile.uri
        });
      } else {
        // Android → Show success message
        this.toasterService.showSuccess('Business card saved successfully!');
      }
    } catch (err) {
      console.error('Business card download failed', err);
    } finally {
      this.isDownloading.set(false);
    }
  }

  async onCopyLink(): Promise<void> {
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

  async onShareTo(): Promise<void> {
    const link = this.profileLink();
    if (!link) {
      this.toasterService.showError('Profile link not available');
      return;
    }

    try {
      await Share.share({
        text: link
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }

  onShareToThreads(): void {
    const link = this.profileLink();
    if (!link) return;

    const text = encodeURIComponent(link);
    const threadsUrl = `https://threads.net/intent/post?text=${text}`;
    window.open(threadsUrl, '_blank');
  }

  onShareToX(): void {
    const link = this.profileLink();
    if (!link) return;

    const text = encodeURIComponent(link);
    const twitterUrl = `https://x.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank');
  }

  onContact(): void {
    const link = this.profileLink();
    if (!link) {
      this.toasterService.showError('Profile link not available');
      return;
    }

    const message = encodeURIComponent(`Check out my profile: ${link}`);
    window.open(`sms:?body=${message}`, '_self');
  }

  async onChat(): Promise<void> {
    const result = await this.modalService.openConfirmModal({
      title: 'Please Confirm',
      description: 'It will send a message to your entire network. Are you sure you want to proceed?',
      confirmButtonLabel: 'Send Message',
      cancelButtonLabel: 'Close',
      confirmButtonColor: 'primary',
      onConfirm: async () => {
        const user = this.user();
        const link = this.profileLink();
        
        if (!link) {
          this.toasterService.showError('Profile link not available');
          return;
        }

        if (!user?.id) {
          this.toasterService.showError('User information not available');
          return;
        }

        try {
          const profileMessage = `Check out ${user.name || user.username}'s profile: ${link}`;
          
          const payload = {
            type: 'Text',
            message: profileMessage,
            send_entire_network: true
          };

          await this.messagesService.shareInChat(payload);
          this.toasterService.showSuccess('Profile shared to your network successfully');
        } catch (error: any) {
          console.error('Error sharing profile in chat:', error);
          this.toasterService.showError(error?.message || 'Failed to share profile');
          throw error;
        }
      }
    });
  }

  onEmail(): void {
    const user = this.user();
    const link = this.profileLink();
    if (!link) {
      this.toasterService.showError('Profile link not available');
      return;
    }

    const subject = encodeURIComponent(`Check out my profile - ${user?.name || user?.username || 'Profile'}`);
    const body = encodeURIComponent(`Hi,\n\nCheck out my profile: ${link}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }

  onWhatsapp(): void {
    const link = this.profileLink();
    if (!link) {
      this.toasterService.showError('Profile link not available');
      return;
    }

    const message = encodeURIComponent(`Check out my profile: ${link}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  getImageUrl(url: string | undefined | null): string {
    return getImageUrlOrDefault(url || '');
  }
}
