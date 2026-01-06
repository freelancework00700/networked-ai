import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { PostCard } from '@/components/card/post-card';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { FeedService } from '@/services/feed.service';
import { EmptyState } from '@/components/common/empty-state';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxMentionsModule, ChoiceWithIndices } from 'ngx-mentions';
import { Component, inject, signal, ChangeDetectionStrategy, PLATFORM_ID, computed, OnInit} from '@angular/core';
import { IonToolbar, IonHeader, IonContent, NavController, IonFooter, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import { CommentResponse, FeedComment } from '@/interfaces/IFeed';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@/services/auth.service';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { NavigationService } from '@/services/navigation.service';

@Component({
  selector: 'post-comments',
  styleUrl: './post-comments.scss',
  templateUrl: './post-comments.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    PostCard,
    EmptyState,
    IonFooter,
    IonHeader,
    MenuModule,
    IonContent,
    IonToolbar,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    CommonModule,
    NgxMentionsModule,
    ReactiveFormsModule,
    NgOptimizedImage
  ]
})
export class PostComments implements OnInit {
  navCtrl = inject(NavController);
  sanitizer = inject(DomSanitizer);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);
  feedService = inject(FeedService);
  authService = inject(AuthService);
  navigationService = inject(NavigationService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);

  // Check if we're in the browser (for SSR compatibility)
  isBrowser = computed(() => isPlatformBrowser(this.platformId));

  currentUser = this.authService.currentUser;

  choices: any[] = [];
  mentions: ChoiceWithIndices[] = [];
  textCtrl: FormControl = new FormControl('');
  searchRegexp = new RegExp('^([-&.\\w]+ *){0,3}$');

  post = signal<any>(null);
  loading = signal<boolean>(false);
  isLoadingComments = signal<boolean>(false);
  isLoadingPost = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  totalComments = signal<number>(0);
  replyingTo = signal<{
    commentId: string;
    userName: string;
    userPhoto?: string;
  } | null>(null);
  formattedText!: any;

  hasMoreComments = computed(() => this.currentPage() < this.totalPages());

  parentCommentStatusBasedStyles = {
    color: '#F5BC61'
  };

  mentionsConfig = [
    {
      triggerCharacter: '@',
      getChoiceLabel: (item: any): string => {
        return `@${item.name}`;
      }
    }
  ];

  getMenuItems(comment: FeedComment): MenuItem[] {
    const currentUserId = this.currentUser()?.id;
    const isOwnComment = comment.user_id === currentUserId || comment.created_by === currentUserId;

    const items: MenuItem[] = [];

    // View Profile is available for all comments
    items.push({
      label: 'View Profile',
      icon: 'pi pi-user',
      command: () => this.viewProfile(comment)
    });

    if (isOwnComment) {
      // Show delete option for own comments
      items.push({
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.deleteComment(comment)
      });
    } else {
      // Options for other users' comments
      items.push(
        {
          label: 'Message',
          icon: 'pi pi-envelope',
          command: () => this.sendMessage(comment)
        },
        {
          separator: true
        },
        {
          label: 'Report',
          icon: 'pi pi-flag',
          command: () => this.reportComment(comment)
        },
        {
          label: 'Block account',
          icon: 'pi pi-ban',
          command: () => this.blockUser(comment)
        }
      );
    }

    return items;
  }

  comments = signal<FeedComment[]>([]);

  async ngOnInit() {
    const postId = this.route.snapshot.paramMap.get('id');
    if (postId) {
      try {
        this.isLoadingPost.set(true);
        const postData = await this.feedService.getPostById(postId);
        if (postData) {
          this.post.set(postData);
          this.loadComments(postId);
        }
      } catch (error) {
        console.error('Error loading post:', error);
      } finally {
        this.isLoadingPost.set(false);
      }
    }

    this.textCtrl.valueChanges.subscribe((content) =>
      this.getFormattedHighlightText(this.textCtrl.value, this.mentions, this.parentCommentStatusBasedStyles)
    );
  }

  private async loadComments(feedId: string, page: number = 1, limit: number = 10): Promise<void> {
    try {
      this.isLoadingComments.set(true);
      const result = await this.feedService.getFeedComments(feedId, { page, limit });
      this.totalComments.set(result.total);

      // Add isRepliesOpen property to comments and their replies
      const addRepliesOpen = (comment: FeedComment): FeedComment => {
        return {
          ...comment,
          isRepliesOpen: false,
          replies: comment.replies?.map(reply => ({ ...reply, isRepliesOpen: false }))
        };
      };

      const topLevelComments = result.comments
        .filter(comment => !comment.parent_comment_id)
        .map(comment => addRepliesOpen(comment));

      if (page === 1) {
        this.comments.set(topLevelComments);
      } else {
        this.comments.update(current => [...current, ...topLevelComments]);
      }
      this.currentPage.set(result.page);
      this.totalPages.set(result.totalPages);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      this.isLoadingComments.set(false);
    }
  }

  async loadMoreComments(event: Event): Promise<void> {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;
    const postId = this.post()?.id;
    
    if (!postId || !this.hasMoreComments()) {
      infiniteScroll.complete();
      return;
    }

    try {
      const nextPage = this.currentPage() + 1;
      await this.loadComments(postId, nextPage);
      infiniteScroll.complete();
    } catch (error) {
      console.error('Error loading more comments:', error);
      infiniteScroll.complete();
    }
  }

  async deleteComment(comment: FeedComment): Promise<void> {
    let deleteResponse: CommentResponse | null = null;

    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/deleteWhiteIcon.svg',
      iconBgColor: '#C73838',
      title: 'Delete Comment',
      description: 'Are you sure you want to delete this comment? This action cannot be undone.',
      confirmButtonLabel: 'Delete',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconPosition: 'left',
      onConfirm: async () => {
        deleteResponse = await this.feedService.deleteComment(comment.id);
        return deleteResponse;
      }
    });

    if (result && result.role === 'confirm' && deleteResponse !== null) {
      const commentIdToDelete = comment.id;
      const isReply = !!comment.parent_comment_id;
      const responseMessage = (deleteResponse as CommentResponse).message;

      // Remove comment from the list
      this.comments.update((comments) => {
        if (isReply) {
          // Remove reply from parent comment's replies array
          return comments.map(c => {
            if (c.replies && c.replies.some(reply => reply.id === commentIdToDelete)) {
              return {
                ...c,
                replies: c.replies.filter(reply => reply.id !== commentIdToDelete),
                total_replies: Math.max((c.total_replies || 1) - 1, 0)
              };
            }
            return c;
          });
        } else {
          // Remove top-level comment
          return comments.filter(c => c.id !== commentIdToDelete);
        }
      });

      // Update pagination: decrement total comments count
      this.totalComments.update(count => Math.max(count - 1, 0));

      // Update post's total_comments
      this.post.update((p) => ({
        ...p,
        total_comments: Math.max((p.total_comments || 1) - 1, 0)
      }));

      // Show success message from API response
      this.toasterService.showSuccess(responseMessage || 'Comment deleted successfully');
    } else if (result && result.role === 'error') {
      this.toasterService.showError('Failed to delete comment. Please try again.');
    }
  }

  viewProfile(comment: FeedComment) {
    const username = comment.user?.username;
    document.body.click();
    setTimeout(() => this.navigationService.navigateForward(`/${username}`));
  }

  sendMessage(comment: FeedComment) {
    console.log('Message clicked for:', comment.user?.username);
    // TODO: Navigate to messages
  }

  async reportComment(comment: FeedComment) {
    const result = await this.modalService.openReportModal('Comment');
    if (!result || !result.reason_id) return;

    try {
      await this.feedService.reportComment({
        comment_id: comment.id,
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
      console.error('Error reporting comment:', error);
      this.toasterService.showError('Failed to report comment. Please try again.');
    }
  }

  async blockUser(comment: FeedComment) {
    if (!comment.user) return;

    const result = await this.modalService.openBlockModal(comment.user);
    if (!result) return;
  }

  onLike() {
    const currentPost = this.post();
    if (!currentPost) return;

    const currentIsLiked = currentPost.is_like || false;
    const currentLikes = currentPost.total_likes || 0;
    const newIsLiked = !currentIsLiked;
    const newLikes = newIsLiked ? currentLikes + 1 : Math.max(currentLikes - 1, 0);

    this.post.update((p) => ({ ...p, is_like: newIsLiked, total_likes: newLikes }));
  }

  toggleReplies(comment: FeedComment) {
    comment.isRepliesOpen = !comment.isRepliesOpen;
  }

  async onLikeComment(comment: FeedComment, isReply: boolean = false): Promise<void> {
    const commentId = comment.id;
    const currentIsLiked = comment.is_like || false;
    const currentLikes = comment.total_likes || 0;
    const newIsLiked = !currentIsLiked;
    const newLikes = newIsLiked ? currentLikes + 1 : Math.max(currentLikes - 1, 0);

    // Helper function to update comment in tree
    const updateCommentInTree = (c: FeedComment): FeedComment => {
      if (c.id === commentId) {
        return { ...c, is_like: newIsLiked, total_likes: newLikes };
      }
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: c.replies.map(reply => updateCommentInTree(reply)) };
      }
      return c;
    };

    // Optimistic update: Update UI immediately
    this.comments.update((comments) => comments.map(updateCommentInTree));

    try {
      // Call API
      const response = await this.feedService.toggleCommentLike(commentId);

      // Update again based on actual API response
      const actualIsLiked = response.data.content;
      const actualLikes = actualIsLiked ? currentLikes + 1 : Math.max(currentLikes - 1, 0);
      
      const updateCommentWithActual = (c: FeedComment): FeedComment => {
        if (c.id === commentId) {
          return { ...c, is_like: actualIsLiked, total_likes: actualLikes };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: c.replies.map(reply => updateCommentWithActual(reply)) };
        }
        return c;
      };

      this.comments.update((comments) => comments.map(updateCommentWithActual));
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // Revert optimistic update on error
      const revertComment = (c: FeedComment): FeedComment => {
        if (c.id === commentId) {
          return { ...c, is_like: currentIsLiked, total_likes: currentLikes };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: c.replies.map(reply => revertComment(reply)) };
        }
        return c;
      };
      this.comments.update((comments) => comments.map(revertComment));
    }
  }

  onShare() {
    this.post.update((p) => ({ ...p, share_count: (p.share_count || 0) + 1 }));
  }

  async sendComment(): Promise<void> {
    if (!this.textCtrl.value?.trim()) return;

    const replyTo = this.replyingTo();
    const feedId = this.post()?.id;
    if (!feedId) return;

    // Extract mention IDs from mentions array
    const mentionIds = this.mentions
      .map(mention => mention.choice?.id)
      .filter((id): id is string => !!id);

    // Get plain text comment (without HTML formatting)
    const commentText = this.textCtrl.value?.trim() || '';

    this.loading.set(true);

    try {
      const payload: {
        feed_id: string;
        comment: string;
        parent_comment_id?: string | null;
        mention_ids?: string[];
      } = {
        feed_id: feedId,
        comment: commentText,
        ...(replyTo && { parent_comment_id: replyTo.commentId }),
        ...(mentionIds.length > 0 && { mention_ids: mentionIds })
      };

      const response = await this.feedService.createComment(payload);
      const newComment = response.data.content as FeedComment;

      // Add isRepliesOpen property
      const commentWithState: FeedComment = {
        ...newComment,
        isRepliesOpen: false
      };

      // Update comments signal
      this.comments.update((comments) => {
        if (replyTo) {
          // Add as reply to parent comment (newest first)
          return comments.map((comment) => {
            if (comment.id === replyTo.commentId) {
              return {
                ...comment,
                replies: [commentWithState, ...(comment.replies || [])],
                total_replies: (comment.total_replies || 0) + 1
              };
            }
            return comment;
          });
        }

        // Add as top-level comment at the start
        return [commentWithState, ...comments];
      });

      if (!replyTo) {
        this.totalComments.update(count => count + 1);

        // Update post's total_comments only for parent comments
        this.post.update((p) => ({ ...p, total_comments: (p.total_comments || 0) + 1 }));
      }

      // Clear form
      this.formattedText = '';
      this.textCtrl.setValue('');
      this.replyingTo.set(null);
      this.mentions = [];
    } catch (error) {
      console.error('Error sending comment:', error);
      this.toasterService.showError('Failed to post comment. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  getTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const timestamp = new Date(dateString).getTime();

    const diffInMilliseconds = now - timestamp;
    
    // If time difference is negative (future date) or very small, show "now"
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

    return timeAgo;
  };

  renderCommentText(text: string): SafeHtml {
    if (!text) return '';

    const urlRegex = /(?<!href=")(https?:\/\/[^\s<]+)/gi;

    const modifiedText = text.replace(
      urlRegex,
      (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#1a73e8; text-decoration:underline;">${url}</a>`
    );

    return this.sanitizer.bypassSecurityTrustHtml(modifiedText);
  }

  onReplyClick(comment: FeedComment) {
    this.replyingTo.set({
      commentId: comment.id,
      userName: comment.user?.name || 'User',
      userPhoto: comment.user?.thumbnail_url || comment.user?.image_url
    });
  }

  clearReply() {
    this.replyingTo.set(null);
  }

  async loadChoices({ searchText, triggerCharacter }: { searchText: string; triggerCharacter: string }): Promise<any[]> {
    let searchResults;
    if (triggerCharacter === '@') {
      searchResults = await this.getUsers();
      this.choices = searchResults.filter((user) => {
        return user.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
      });
    } else {
    }
    return this.choices;
  }

  getChoiceLabel = (user: any): string => {
    return `@${user.name}`;
  };

  getDisplayLabel = (item: any): string => {
    if (item.hasOwnProperty('name')) {
      return (item as any).name;
    }
    return (item as any).tag;
  };

  onSelectedChoicesChange(choices: ChoiceWithIndices[]): void {
    this.mentions = choices;
    this.getFormattedHighlightText(this.textCtrl.value, this.mentions, this.parentCommentStatusBasedStyles);
    console.log('mentions:', this.mentions);
  }

  onMenuShow(): void {
    console.log('Menu show!');
  }

  onMenuHide(): void {
    console.log('Menu hide!');
    this.choices = [];
  }

  private getFormattedHighlightText(
    content: string,
    ranges: any[],
    parentCommentStatusBasedStyles: {
      color: string;
    }
  ) {
    let highlightedContent = content;
    let replaceContentIndex = 0;

    ranges.forEach((range) => {
      const start = range.indices.start;
      const end = range.indices.end;
      const highlightedText = content.substring(start, end);

      const highlighted = `<a href="http://localhost:4200" style="color: ${parentCommentStatusBasedStyles.color}; white-space: nowrap; padding: 0 3px; border-radius: 3px; text-decoration: none;">${highlightedText}</a>`;

      const newReplace = highlightedContent.substring(replaceContentIndex).replace(highlightedText, highlighted);

      highlightedContent = replaceContentIndex === 0 ? newReplace : highlightedContent.substring(0, replaceContentIndex) + newReplace;

      replaceContentIndex = highlightedContent.lastIndexOf('</a>') + 4;
    });

    highlightedContent = highlightedContent.replace(/\n/g, '<br>');

    this.formattedText = this.sanitizer.bypassSecurityTrustHtml(highlightedContent) as string;
  }

  async getUsers(): Promise<any[]> {
    this.loading.set(true);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.loading.set(false);

        resolve([
          {
            id: 1,
            name: 'Amelia'
          },
          {
            id: 2,
            name: 'Doe'
          },
          {
            id: 3,
            name: 'John Doe'
          },
          {
            id: 4,
            name: 'John J. Doe'
          },
          {
            id: 5,
            name: 'John & Doe'
          },
          {
            id: 6,
            name: 'Fredericka Wilkie'
          },
          {
            id: 7,
            name: 'Collin Warden'
          },
          {
            id: 8,
            name: 'Hyacinth Hurla'
          },
          {
            id: 9,
            name: 'Paul Bud Mazzei'
          },
          {
            id: 10,
            name: 'Mamie Xander Blais'
          },
          {
            id: 11,
            name: 'Sacha Murawski'
          },
          {
            id: 12,
            name: 'Marcellus Van Cheney'
          },
          {
            id: 12,
            name: 'Lamar Kowalski'
          },
          {
            id: 13,
            name: 'Queena Gauss'
          }
        ]);
      }, 600);
    });
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  onImageError(event: Event): void {
    onImageError(event);
  }
}