import { Swiper } from 'swiper';
import { Pagination } from 'swiper/modules';
import { NavController } from '@ionic/angular';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { AuthService } from '@/services/auth.service';
import { FeedService } from '@/services/feed.service';
import { NavigationService } from '@/services/navigation.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MenuItem } from '@/components/modal/menu-modal/menu-modal';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, output, signal, ViewChild, computed } from '@angular/core';
import { FeedPost } from '@/interfaces/IFeed';

@Component({
  imports: [Button, NgOptimizedImage],
  selector: 'post-card',
  styleUrl: './post-card.scss',
  templateUrl: './post-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostCard {
  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef<HTMLDivElement>;

post = input.required<FeedPost>();

  navCtrl = inject(NavController);
  sanitizer = inject(DomSanitizer);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);
  authService = inject(AuthService);
  feedService = inject(FeedService);
  navigationService = inject(NavigationService);
  
  private datePipe = new DatePipe('en-US');

  onMore = output<void>();

  swiper?: Swiper;

  currentSlide = signal(0);
  
  // Computed property to check if post belongs to current user
  isCurrentUserPost = computed(() => {
    const currentUser = this.authService.currentUser();
    const postUserId = this.post().user_id;
    return currentUser?.id === postUserId;
  });
  
  // Menu items for current user's posts (Edit/Delete only)
  currentUserMenuItems: MenuItem[] = [
    { label: 'Edit', icon: 'assets/svg/editIconBlack.svg', iconType: 'svg', action: 'edit' },
    { label: 'Delete', icon: 'assets/svg/deleteIcon.svg', iconType: 'svg', danger: true, action: 'delete' }
  ];
  
  // Menu items for other users' posts
  otherUserMenuItems: MenuItem[] = [
    { label: 'Not Interested', icon: 'pi pi-eye-slash', iconType: 'pi', action: 'notInterested' },
    { label: 'Add to network', icon: 'assets/svg/addUserIcon.svg', iconType: 'svg', action: 'addToNetwork' },
    { label: 'Mute', icon: 'assets/svg/alertOffBlackIcon.svg', iconType: 'svg', action: 'mute' },
    { label: 'Unmute', icon: 'assets/svg/alertBlackIcon.svg', iconType: 'svg', action: 'unmute' },
    { label: 'Block', icon: 'pi pi-ban', iconType: 'pi', action: 'block' },
    { label: 'Report post', icon: 'assets/svg/social-feed/report.svg', iconType: 'svg', action: 'report' },
    { label: 'Unfollow', icon: 'assets/svg/social-feed/user-minus.svg', iconType: 'svg', action: 'unfollow' }
  ];

  // Computed properties for API data
  sortedMedias = computed(() => {
    const medias = this.post().medias;
    if (!medias || medias.length === 0) return [];
    return [...medias].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  createdAtTimestamp = computed(() => {
    const dateStr = this.post().created_at;
    return dateStr ? new Date(dateStr).getTime() : Date.now();
  });

  updatedAtTimestamp = computed(() => {
    const dateStr = this.post().updated_at;
    return dateStr ? new Date(dateStr).getTime() : undefined;
  });

  ngAfterViewChecked() {
    if (this.swiper) return;
    if (!this.swiperEl?.nativeElement) return;
    if (!this.sortedMedias().length) return;

    this.swiper = new Swiper(this.swiperEl.nativeElement, {
      modules: [Pagination],
      slidesPerView: 1,
      spaceBetween: 0,
      allowTouchMove: true,
      observer: true,
      nested: true,
      pagination: {
        el: '.swiper-pagination'
      },

      on: {
        slideChange: (swiper) => {
          this.currentSlide.set(swiper.activeIndex);
        }
      }
    });
  }

  formatEventDate(dateString: string): string {
    return this.datePipe.transform(dateString, 'EEE MMM d') || '';
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

    if (diffInMilliseconds < 1000) return 'now';
    
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
    // Show different menu items based on whether it's the current user's post
    const menuItems = this.isCurrentUserPost() 
      ? this.currentUserMenuItems 
      : this.otherUserMenuItems;
    
    const result = await this.modalService.openMenuModal(menuItems);
    if (!result) return;

    const actions: Record<string, () => void> = {
      edit: () => this.editPost(),
      delete: () => this.deletePost(),
      report: () => this.reportPost(),
      block: () => this.blockUser(),
      unfollow: () => this.unfollowPost(),
      unmute: () => this.unmutePost(),
      mute: () => this.mutePost(),
      notInterested: () => this.notInterestedPost(),
      addToNetwork: () => this.addToNetwork()
    };

    actions[result.role]?.();
  }

  editPost() {
    this.navCtrl.navigateForward(`/new-post`, { 
      state: { postId: this.post().id, post: this.post() } 
    });
  }
  
  addToNetwork() {
    // TODO: Implement add to network functionality
    console.log('Add to network:', this.post().user_id);
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
      iconPosition: 'left',
      onConfirm: async () => {
        const postId = this.post().id;
        const response = await this.feedService.deletePost(postId!);
        this.toasterService.showSuccess(response.message);
        return response;
      }
    });

    if (result && result.role === 'error') {
      this.toasterService.showError('Failed to delete post. Please try again.');
    }
  }

  async reportPost() {
    const result = await this.modalService.openReportModal('Post');
    if (!result || !result.reason_id) return;

    const postId = this.post().id;
    if (!postId) return;

    try {
      await this.feedService.reportFeed({
        feed_id: postId,
        reason_id: result.reason_id,
        reason: result.reason
      });

      await this.modalService.openConfirmModal({
        icon: 'assets/svg/deleteWhiteIcon.svg',
        iconBgColor: '#F5BC61',
        title: 'Report Submitted',
        description: 'We use these reports to show you less of this kind of content in the future.',
        confirmButtonLabel: 'Done'
      });
    } catch (error) {
      console.error('Error reporting post:', error);
      this.toasterService.showError('Failed to report post. Please try again.');
    }
  }

  async blockUser() {
    const currentPost = this.post();
    if (!currentPost?.user) return;

    const result = await this.modalService.openBlockModal(currentPost.user);
    if (!result) return;
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
    const postId = this.post().id;
    if (!postId) return;
    
    await this.modalService.openShareModal(postId, 'Post', postId);
  }

  openFullscreen(index: number) {
    const media = this.sortedMedias()[index];
    if (media && media.media_type === 'Image' && media.media_url) {
      this.modalService.openImagePreviewModal(media.media_url);
    }
  }

  renderText(text: string): SafeHtml {
    if (!text) return '';

    // Use a negative lookbehind to avoid matching mentions already inside HTML tags
    const mentionRegex = /(?<!<[^>]*>)@([\w.]+)/g;
    let modifiedText = text.replace(mentionRegex, (match, username) => {
      // Check if this mention is already inside an anchor tag
      if (match.includes('<a')) return match;
      return `<a href="#" class="mention-link brand-03" data-username="${username}" style="font-weight:500; text-decoration:none; cursor:pointer;">${match}</a>`;
    });

    // Finally, handle URLs (avoid replacing URLs that are already in href attributes)
    const urlRegex = /(?<!href=")(https?:\/\/[^\s<]+)/gi;
    modifiedText = modifiedText.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#1a73e8; text-decoration:underline;">${url}</a>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(modifiedText);
  }

  onMentionClick(event: Event): void {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const mentionLink = target.closest('.mention-link') as HTMLElement;
    if (mentionLink) {
      event.preventDefault();
      const username = mentionLink.getAttribute('data-username');
      if (username) {
        this.navigationService.navigateForward(`/${username}`);
      }
    }
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  async toggleLike(): Promise<void> {
    const postId = this.post().id;
    try {
      await this.feedService.toggleLike(postId!);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  onComment(): void {
    const postId = this.post().id;
    this.navCtrl.navigateForward(['/comments', postId!], { state: { post: this.post() } });
  }
}
