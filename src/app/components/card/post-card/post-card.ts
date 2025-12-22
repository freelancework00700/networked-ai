import { Swiper } from 'swiper';
import { NavController } from '@ionic/angular';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MenuItem } from '@/components/modal/menu-modal/menu-modal';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal, ViewChild } from '@angular/core';

@Component({
  imports: [Button],
  selector: 'post-card',
  styleUrl: './post-card.scss',
  templateUrl: './post-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostCard {
  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef<HTMLDivElement>;

  post = input.required<any>();

  navCtrl = inject(NavController);
  sanitizer = inject(DomSanitizer);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);

  onLike = output<void>();
  onComment = output<void>();
  onMore = output<void>();

  swiper?: Swiper;

  currentSlide = signal(0);
  menuItems: MenuItem[] = [
    { label: 'Not Interested', icon: 'pi pi-eye-slash', iconType: 'pi', action: 'notInterested' },
    { label: 'Add @sammyk982 to network', icon: 'assets/svg/addUserIcon.svg', iconType: 'svg', action: 'edit' },
    { label: 'Mute @sammyk982', icon: 'assets/svg/alertOffBlackIcon.svg', iconType: 'svg', action: 'mute' },
    { label: 'Unmute @sammyk982', icon: 'assets/svg/alertBlackIcon.svg', iconType: 'svg', action: 'unmute' },
    { label: 'Block @sammyk982', icon: 'pi pi-ban', iconType: 'pi', action: 'block' },
    { label: 'Report post', icon: 'assets/svg/social-feed/report.svg', iconType: 'svg', action: 'report' },
    { label: 'Unfollow @sammyk982', icon: 'assets/svg/social-feed/user-minus.svg', iconType: 'svg', action: 'unfollow' },
    { label: 'Edit', icon: 'assets/svg/editIconBlack.svg', iconType: 'svg', action: 'edit' },
    { label: 'Delete', icon: 'assets/svg/deleteIcon.svg', iconType: 'svg', danger: true, action: 'delete' }
  ];

  ngAfterViewChecked() {
    if (this.swiper) return;
    if (!this.swiperEl?.nativeElement) return;
    if (!this.post().media?.length) return;

    this.swiper = new Swiper(this.swiperEl.nativeElement, {
      slidesPerView: 1,
      spaceBetween: 0,
      allowTouchMove: true,
      observer: true,

      pagination: {
        el: '.swiper-pagination',
        clickable: true
      },

      on: {
        slideChange: (swiper) => {
          this.currentSlide.set(swiper.activeIndex);
        }
      }
    });
  }

  eventsMap = new Map<string, any>([
    [
      '-OaRVjr6NoQrDdd1Bi1u',
      {
        title: 'Atlanta Makes Me Laugh',
        location: 'Atlanta, GA',
        date: 'Fri 8/30'
      }
    ]
  ]);

  getEvent(eventId: string) {
    return this.eventsMap.get(eventId);
  }

  getTimeAgo = (timestamp: number, updatedTimestamp?: number) => {
    const now = new Date().getTime();

    // Decide which timestamp to use
    let displayTimestamp = timestamp;
    let isEdited = false;

    if (updatedTimestamp && updatedTimestamp > timestamp) {
      displayTimestamp = updatedTimestamp;
      isEdited = true;
    }

    const diffInMilliseconds = now - displayTimestamp;
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInMonths / 12);

    let timeAgo = '';
    if (diffInYears > 0) timeAgo = `${diffInYears}y`;
    else if (diffInMonths > 0) timeAgo = `${diffInMonths}m`;
    else if (diffInDays > 0) timeAgo = `${diffInDays}d`;
    else if (diffInHours > 0) timeAgo = `${diffInHours}h`;
    else if (diffInMinutes > 0) timeAgo = `${diffInMinutes}m`;
    else timeAgo = `${diffInSeconds}s`;

    return isEdited ? `edited ${timeAgo} ago` : `${timeAgo}`;
  };

  async openMenu() {
    const result = await this.modalService.openMenuModal(this.menuItems);
    if (!result) return;

    const actions: Record<string, () => void> = {
      edit: () => this.editPost(),
      delete: () => this.deletePost(),
      report: () => this.reportPost(),
      block: () => this.blockUser(),
      unfollow: () => this.unfollowPost(),
      unmute: () => this.unmutePost(),
      mute: () => this.mutePost(),
      notInterested: () => this.notInterestedPost()
    };

    actions[result.role]?.();
  }

  editPost() {
    this.navCtrl.navigateForward(`/new-post`);
  }

  async deletePost() {
    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/deleteWhiteIcon.svg',
      iconBgColor: '#C73838',
      title: 'Delete Confirmation',
      description: 'Are you sure you want to delete this post?',
      confirmButtonLabel: 'Delete',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconPosition: 'left'
    });

    if (result && result.role === 'confirm') {
      this.toasterService.showSuccess('post deleted');
    }
  }

  async reportPost() {
    const result = await this.modalService.openReportModal();
    if (!result) return;
    const resultModal = await this.modalService.openConfirmModal({
      icon: 'assets/svg/deleteWhiteIcon.svg',
      iconBgColor: '#F5BC61',
      title: 'Report Submitted',
      description: 'We use these reports to show you less of this kind of content in the future.',
      confirmButtonLabel: 'Done'
    });
    if (resultModal && resultModal.role === 'confirm') {
      this.toasterService.showSuccess('Event cancelled');
    }
    this.toasterService.showSuccess('Post reported');
  }

  async blockUser() {
    const result = await this.modalService.openBlockModal();
    if (!result) return;

    this.toasterService.showSuccess('User blocked');
  }

  unfollowPost() {
    console.log('unfollow');
  }

  unmutePost() {
    console.log('unmute');
  }

  mutePost() {
    console.log('mute');
  }

  notInterestedPost() {
    console.log('not interested');
  }

  async sharePost() {
    const result = await this.modalService.openShareModal(this.post().post_id, 'Post');
    if (result) {
      this.toasterService.showSuccess('Post shared');
    }
  }

  renderText(text: string): SafeHtml {
    if (!text) return '';

    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    let modifiedText = text.replace(mentionRegex, (match, username, uid) => {
      return `<a href="/${uid}" class="text-blue-500">@${username}</a>`;
    });

    modifiedText = modifiedText.replace(urlRegex, (match, url) => {
      return `<a href="${url}" target="_blank" class="text-blue-500">${url}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(modifiedText);
  }

  openFullscreen(index: number) {
    this.modalService.openImagePreviewModal(this.post().media[index].url);
  }

  renderCommentText(text: string): SafeHtml {
    if (!text) return '';

    const urlRegex = /(?<!href=")(https?:\/\/[^\s<]+)/gi;

    const modifiedText = text.replace(
      urlRegex,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#1a73e8; text-decoration:underline;">${url}</a>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(modifiedText);
  }
}
