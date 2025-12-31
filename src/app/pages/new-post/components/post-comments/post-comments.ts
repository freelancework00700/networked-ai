import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { PostCard } from '@/components/card/post-card';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { EmptyState } from '@/components/common/empty-state';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxMentionsModule, ChoiceWithIndices } from 'ngx-mentions';
import { Component, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { IonToolbar, IonHeader, IonContent, NavController, IonFooter } from '@ionic/angular/standalone';

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
    CommonModule,
    NgxMentionsModule,
    ReactiveFormsModule
  ]
})
export class PostComments {
  navCtrl = inject(NavController);
  sanitizer = inject(DomSanitizer);
  modalService = inject(ModalService);
  toasterService = inject(ToasterService);

  choices: any[] = [];
  mentions: ChoiceWithIndices[] = [];
  textCtrl: FormControl = new FormControl('');
  searchRegexp = new RegExp('^([-&.\\w]+ *){0,3}$');

  post = signal<any>(null);
  loading = signal<boolean>(false);
  replyingTo = signal<{
    commentId: string;
    userName: string;
    userPhoto?: string;
  } | null>(null);
  formattedText!: any;

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

  menuItems: MenuItem[] = [
    {
      label: 'View Profile',
      icon: 'pi pi-user',
      command: () => this.viewProfile()
    },
    {
      label: 'Message',
      icon: 'pi pi-envelope',
      command: () => this.sendMessage()
    },
    {
      separator: true
    },
    {
      label: 'Report',
      icon: 'pi pi-flag',
      command: () => this.reportComment()
    },
    {
      label: 'Block account',
      icon: 'pi pi-ban',
      command: () => this.blockUser()
    }
  ];

  comments = signal<any[]>([
    {
      comment_id: 'HWCL26g6rwZeMOyenN6L',
      text: 'https://www.npmjs.com/package/angular-mentions',
      uid: 'DUtQ8jeMUANBUnye5InM6feXD0B3',
      post_id: 'MuffELhtUqTbGnUJ3zmE',
      createdAt: 1766127451868,
      parent_comment_id: null,
      like_count: 2,
      reply_count: 0,
      isLiked: true,
      replies: [],
      isSending: false
    },
    {
      comment_id: 'voGvKv9Tq36p9KsbYuKQ',
      parent_comment_id: null,
      uid: 'DUtQ8jeMUANBUnye5InM6feXD0B3',
      reply_count: 2,
      text: 'test123',
      post_id: 'MuffELhtUqTbGnUJ3zmE',
      createdAt: 1756378928704,
      like_count: 0,
      isLiked: false,
      replies: [
        {
          comment_id: 'xLSf8Aj5RPtxzVSvyXOW',
          text: 'test 123',
          uid: 'DUtQ8jeMUANBUnye5InM6feXD0B3',
          post_id: 'MuffELhtUqTbGnUJ3zmE',
          createdAt: 1766127504771,
          parent_comment_id: 'voGvKv9Tq36p9KsbYuKQ',
          like_count: 4,
          reply_count: 0,
          isLiked: false,
          replies: [],
          isSending: false
        },
        {
          comment_id: 'qneGoETVRliLSp2FNrCk',
          parent_comment_id: 'voGvKv9Tq36p9KsbYuKQ',
          uid: 'DUtQ8jeMUANBUnye5InM6feXD0B3',
          post_id: 'MuffELhtUqTbGnUJ3zmE',
          like_count: 0,
          createdAt: 1756378939910,
          text: '123',
          reply_count: 0,
          isLiked: false
        }
      ]
    },
    {
      comment_id: 'BKk8mYZhGEe39GI9zfIO',
      parent_comment_id: null,
      uid: 'DUtQ8jeMUANBUnye5InM6feXD0B3',
      post_id: 'MuffELhtUqTbGnUJ3zmE',
      createdAt: 1756359496204,
      text: 'test comment',
      reply_count: 2,
      like_count: 6,
      isLiked: false,
      replies: [
        {
          comment_id: '6bgZ30Vqn6ZZecwkg889',
          post_id: 'MuffELhtUqTbGnUJ3zmE',
          reply_count: 0,
          parent_comment_id: 'BKk8mYZhGEe39GI9zfIO',
          uid: 'DUtQ8jeMUANBUnye5InM6feXD0B3',
          text: '123',
          createdAt: 1756378946006,
          like_count: 0,
          isLiked: false
        },
        {
          comment_id: 'qRr65alYV39qWAWU1Mdf',
          createdAt: 1756378933651,
          reply_count: 0,
          like_count: 0,
          text: 'test',
          uid: 'DUtQ8jeMUANBUnye5InM6feXD0B3',
          parent_comment_id: 'BKk8mYZhGEe39GI9zfIO',
          post_id: 'MuffELhtUqTbGnUJ3zmE',
          isLiked: false
        }
      ]
    }
  ]);

  private navEffect = effect(() => {
    const state = history.state;

    if (state?.post) {
      this.post.set(state.post);
    }
  });

  ngOnInit() {
    this.textCtrl.valueChanges.subscribe((content) =>
      this.getFormattedHighlightText(this.textCtrl.value, this.mentions, this.parentCommentStatusBasedStyles)
    );
  }

  viewProfile() {
    console.log('View profile clicked');
  }

  sendMessage() {
    console.log('Message clicked');
  }

  async reportComment() {
    const result = await this.modalService.openReportModal('Post');
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

  onLike() {
    this.post.set({
      ...this.post(),
      isLikedByYou: !this.post().isLikedByYou,
      like_count: !this.post().isLikedByYou ? (this.post().like_count || 0) + 1 : Math.max((this.post().like_count || 1) - 1, 0)
    });
  }

  toggleReplies(comment: any) {
    comment.isRepliesOpen = !comment.isRepliesOpen;
  }

  onLikeComment(comment: any, isReply: boolean = false) {
    comment.isLiked = !comment.isLiked;
    if (isReply) {
      comment.like_count = comment.isLiked ? (comment.like_count || 0) + 1 : Math.max((comment.like_count || 1) - 1, 0);
    } else {
      comment.like_count = comment.isLiked ? (comment.like_count || 0) + 1 : Math.max((comment.like_count || 1) - 1, 0);
    }
  }

  onShare() {
    this.post.update((p) => ({ ...p, share_count: (p.share_count || 0) + 1 }));
  }

  sendComment() {
    if (!this.textCtrl.value?.trim()) return;

    const replyTo = this.replyingTo();
    const newComment = {
      comment_id: Date.now(),
      userName: 'You',
      userPhoto: 'assets/images/profile.jpeg',
      text: this.formattedText?.changingThisBreaksApplicationSecurity,
      createdAt: Date.now(),
      replies: [],
      like_count: 0,
      isLiked: false
    };

    this.comments.update((comments) => {
      if (replyTo) {
        return comments.map((comment) => {
          if (comment.comment_id === replyTo.commentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment]
            };
          }
          return comment;
        });
      }

      return [...comments, newComment];
    });
    this.formattedText = '';
    this.textCtrl.setValue('');
    this.replyingTo.set(null);

    this.loading.set(true);
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }

  getTimeAgo = (timestamp: number) => {
    const now = new Date().getTime();

    let displayTimestamp = timestamp;

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

    return `${timeAgo}`;
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

  onReplyClick(comment: any) {
    this.replyingTo.set({
      commentId: comment.comment_id,
      userName: comment.userName || 'User',
      userPhoto: comment.userPhoto
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
}
