import { Swiper } from 'swiper';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { FeedService } from '@/services/feed.service';
import { ToasterService } from '@/services/toaster.service';
import { AuthService } from '@/services/auth.service';
import { MediaService } from '@/services/media.service';
import { UserService } from '@/services/user.service';
import { PostEventCard } from '@/components/card/post-event-card';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxMentionsModule, ChoiceWithIndices } from 'ngx-mentions';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  Component,
  inject,
  signal,
  viewChild,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  computed,
  PLATFORM_ID,
  DestroyRef,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { IonToolbar, IonHeader, IonContent, NavController, IonFooter, IonIcon } from '@ionic/angular/standalone';
import { FeedPost, FeedMention } from '@/interfaces/IFeed';
import { IUser } from '@/interfaces/IUser';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { isPlatformBrowser } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of, from } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'new-post',
  styleUrl: './new-post.scss',
  templateUrl: './new-post.html',
  imports: [
    Chip,
    Button,
    IonIcon,
    IonHeader,
    IonFooter,
    IonContent,
    IonToolbar,
    CommonModule,
    PostEventCard,
    DragDropModule,
    NgxMentionsModule,
    ReactiveFormsModule,
    NgOptimizedImage
  ]
})
export class NewPost implements OnInit {
  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef<HTMLDivElement>;
  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  cd = inject(ChangeDetectorRef);
  navCtrl = inject(NavController);
  router = inject(Router);
  sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);
  modalService = inject(ModalService);
  feedService = inject(FeedService);
  toasterService = inject(ToasterService);
  authService = inject(AuthService);
  mediaService = inject(MediaService);
  userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  // Check if we're in the browser (for SSR compatibility)
  isBrowser = computed(() => isPlatformBrowser(this.platformId));

  text = '';
  swiper?: Swiper;
  formattedText!: any;
  users: IUser[] = [];
  mentions: ChoiceWithIndices[] = [];
  searchRegexp = new RegExp('^([-&.\\w]+ *){0,3}$');
  textCtrl: FormControl = new FormControl('');

  // RxJS Subject for debounced user search
  private searchSubject = new Subject<string>();

  currentSlide = signal(0);
  loading = signal<boolean>(false);
  mediaItems = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  postLoading = signal<boolean>(false);
  visibility = signal<'public' | 'private'>('public');

  // Edit mode
  postId = signal<string | null>(null);
  isEditMode = computed(() => !!this.postId());
  originalMentions = signal<FeedMention[]>([]); // Store original mentions from post for parsing

  // Reactive text content signal
  textContent = signal<string>('');

  // Computed signal to check if post can be submitted
  isPostDisabled = computed(() => {
    const hasContent = this.textContent()?.trim().length > 0;
    return !hasContent;
  });

  // Current user data
  currentUser = this.authService.currentUser;
  currentUserName = computed(() => this.currentUser()?.name || this.currentUser()?.username || '');
  currentUserImage = computed(() => {
    const user = this.currentUser();
    const imageUrl = user?.thumbnail_url;
    return getImageUrlOrDefault(imageUrl);
  });

  form = signal<FormGroup>(
    this.fb.group({
      location: [''],
      events: this.fb.array([])
    })
  );

  parentCommentStatusBasedStyles = {
    color: '#F5BC61'
  };

  mentionsConfig = [
    {
      triggerCharacter: '@',
      getChoiceLabel: (item: IUser): string => {
        return `@${item.name || ''}`;
      }
    }
  ];

  ngOnInit() {
    const navigationState: any = this.router.currentNavigation()?.extras?.state;
    console.log('navigationState:', navigationState);
    if (navigationState?.postId && navigationState?.post) {
      this.postId.set(navigationState.postId);
      this.loadPostData(navigationState.post);
    }

    this.textCtrl.valueChanges.subscribe((content) => {
      this.textContent.set(content || '');
      this.getFormattedHighlightText(this.textCtrl.value, this.mentions, this.parentCommentStatusBasedStyles);
    });

    // Initialize textContent with current value
    this.textContent.set(this.textCtrl.value || '');

    // Set up debounced user search
    this.searchSubject
      .pipe(
        debounceTime(500), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Only search if the value changed
        switchMap((searchText: string) => {
          if (!searchText || searchText.trim() === '') {
            // Return empty array if search is empty
            this.users = [];
            return of({ users: [], pagination: { totalCount: 0, currentPage: 1, totalPages: 0 } });
          }

          // Defer loading state update
          this.loading.set(true);

          // Convert Promise to Observable
          return from(this.userService.searchUsers(searchText, 1, 20)).pipe(
            catchError((error) => {
              console.error('Error searching users:', error);
              this.loading.set(false);
              return of({ users: [], pagination: { totalCount: 0, currentPage: 1, totalPages: 0 } });
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        this.users = response.users || [];
        this.loading.set(false);
        this.cd.detectChanges();
      });
  }

  private loadPostData(post: FeedPost): void {
    // Load mentions - initialize mentions array and store original mention IDs
    if (post.mentions && post.mentions.length > 0 && post.content) {
      this.originalMentions.set(post.mentions);

      const content = post.content;
      const mentionsWithIndices: ChoiceWithIndices[] = [];

      post.mentions.forEach((mention) => {
        // Try to find the mention in content by username or name
        const patterns = [
          `@${mention.username}`,
          `@${mention.name}`,
          `@${mention.name.split(' ')[0]}`, // First name only
          `@${mention.name.split(' ').join('')}` // Full name without spaces
        ];

        // Try each pattern until we find a match
        let found = false;
        for (const pattern of patterns) {
          if (found) break; // Stop if we already found this mention

          let searchIndex = 0;
          while (true) {
            const index = content.indexOf(pattern, searchIndex);
            if (index === -1) break;

            // (avoid duplicates)
            const alreadyAdded = mentionsWithIndices.some((m) => m.choice?.id === mention.id && m.indices.start === index);

            if (!alreadyAdded) {
              mentionsWithIndices.push({
                choice: { ...mention } as IUser,
                indices: {
                  start: index,
                  end: index + pattern.length,
                  triggerCharacter: '@'
                }
              });
              found = true;
              break; // Found this mention, move to next mention
            }
            searchIndex = index + 1;
          }
        }
      });

      // Sort by position in content
      mentionsWithIndices.sort((a, b) => a.indices.start - b.indices.start);

      // Set mentions BEFORE setting content so ngx-mentions can track them
      this.mentions = mentionsWithIndices;
    } else {
      this.originalMentions.set([]);
      this.mentions = [];
    }

    // Now set content after mentions are initialized
    if (post.content) {
      this.textCtrl.setValue(post.content);
      this.textContent.set(post.content);
    }

    // Load visibility
    this.visibility.set(post.is_public ? 'public' : 'private');

    // Load location
    this.form().patchValue({
      location: post.address,
      latitude: post.latitude || '',
      longitude: post.longitude || ''
    });

    // Load events
    if (post.events && post.events.length > 0) {
      const eventFormArray = this.eventsArray();
      post.events.forEach((event) => {
        if (event.id) {
          eventFormArray.push(this.fb.control(event));
        }
      });
    }

    // Load medias (sort by order)
    if (post.medias && post.medias.length > 0) {
      const mediaItems = post.medias
        .slice() // Create a copy to avoid mutating the original array
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) // Sort by order
        .map((media) => ({
          id: crypto.randomUUID(),
          type: media.media_type === 'Video' ? 'video' : 'image',
          url: media.media_url || ''
        }));
      this.mediaItems.set(mediaItems);
    }

    this.cd.detectChanges();
  }
  ngAfterViewChecked() {
    if (this.swiper) return;
    if (!this.swiperEl?.nativeElement) return;
    if (!this.mediaItems().length) return;

    this.swiper = new Swiper(this.swiperEl.nativeElement, {
      slidesPerView: 1,
      spaceBetween: 0,
      allowTouchMove: true,
      observer: true,
      on: {
        slideChange: (swiper) => {
          this.currentSlide.set(swiper.activeIndex);
        }
      }
    });
  }

  setVisibility(type: 'public' | 'private') {
    this.visibility.set(type);
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.mediaItems(), event.previousIndex, event.currentIndex);
  }

  openFilePicker() {
    this.fileInput()?.nativeElement.click();
  }

  async openLocationModal() {
    const { address, latitude, longitude } = await this.modalService.openLocationModal();
    if (address) {
      this.form().patchValue({
        location: address,
        latitude: latitude || '',
        longitude: longitude || ''
      });
    }
    this.cd.detectChanges();
  }

  onBrowseFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    const newItems = files.map((file) => ({
      id: crypto.randomUUID(),
      type: file.type.startsWith('video') ? 'video' : 'image',
      file,
      url: URL.createObjectURL(file)
    }));

    this.mediaItems.update((list) => [...list, ...newItems]);
    input.value = '';

    this.refreshSwiperAndGoToLast();
  }

  async openEventModal() {
    const data = await this.modalService.openPostEventModal();
    if (!data) return;

    const exists = this.eventsArray().controls.some((ctrl) => ctrl.value.id === data.id);

    if (!exists) {
      this.eventsArray().push(this.fb.control(data));
    }
    this.cd.detectChanges();
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  async openNetworkedGallery(): Promise<void> {
    const data = await this.modalService.openImageGalleryModal();
    if (!data) return;

    const urls = this.toArray(data);

    const items = urls.map((url) => ({
      id: crypto.randomUUID(),
      type: 'image',
      url
    }));

    this.mediaItems.update((list) => [...list, ...items]);
    this.refreshSwiperAndGoToLast();
  }

  toArray(value: string | string[]): string[] {
    return Array.isArray(value) ? value : [value];
  }

  deleteMedia(index: number) {
    this.mediaItems.update((items) => {
      items.splice(index, 1);
      return [...items];
    });

    this.refreshSwiper(index - 1);
  }

  goToSlide(index: number) {
    if (!this.swiper) return;

    this.refreshSwiper(index);
  }

  private refreshSwiperAndGoToLast() {
    if (!this.swiper) return;

    requestAnimationFrame(() => {
      this.swiper!.update();

      const lastIndex = this.swiper!.slides.length - 1;
      if (lastIndex >= 0) {
        this.currentSlide.set(lastIndex);
        this.swiper!.slideTo(lastIndex, 0);
      }
    });
  }

  private refreshSwiper(targetIndex?: number) {
    if (!this.swiper) return;

    requestAnimationFrame(() => {
      this.swiper!.update();

      if (targetIndex !== undefined) {
        const safeIndex = Math.min(targetIndex, this.swiper!.slides.length - 1);

        this.currentSlide.set(safeIndex);
        this.swiper!.slideTo(safeIndex, 0);
      }
    });
  }

  get eventsArray(): () => FormArray {
    return () => this.form().get('events') as FormArray;
  }

  onRemoveEvent(event: any) {
    const index = this.eventsArray().controls.findIndex((ctrl) => ctrl.value.id === event.id);

    if (index !== -1) {
      this.eventsArray().removeAt(index);
    }
  }

  async handleCreatePost() {
    const content = this.textCtrl.value?.trim() || '';

    try {
      this.postLoading.set(true);

      const eventIds = this.eventsArray()
        .controls.map((ctrl) => ctrl.value.id)
        .filter((id) => id);
      const medias = await this.processMediaItems();

      // Extract mention IDs from mentions array - ngx-mentions tracks what's actually in the text
      const mentionIds = this.mentions.map((mention) => mention.choice?.id).filter((id): id is string => !!id);

      const payload: Partial<FeedPost> & { content: string; is_public: boolean } = {
        event_ids: eventIds,
        address: this.form().get('location')?.value || '',
        latitude: this.form().get('latitude')?.value || '',
        longitude: this.form().get('longitude')?.value || '',
        content: content,
        is_public: this.visibility() === 'public',
        medias: medias
      };

      // Only include mention_ids if there are mentions
      if (mentionIds.length > 0) payload.mention_ids = mentionIds;

      const postId = this.postId();
      let response;

      if (postId) {
        response = await this.feedService.updatePost(postId, payload);
        this.toasterService.showSuccess(response.message || 'Post updated successfully');
      } else {
        response = await this.feedService.createPost(payload);
        this.toasterService.showSuccess(response.message || 'Post created successfully');
      }

      this.navCtrl.back();
    } catch (error: any) {
      console.error('Error saving post:', error);
      const errorMessage =
        error?.message || (this.isEditMode() ? 'Failed to update post. Please try again.' : 'Failed to create post. Please try again.');
      this.toasterService.showError(errorMessage);
    } finally {
      this.postLoading.set(false);
    }
  }

  private async processMediaItems(): Promise<Array<{ media_url: string; media_type: 'Image' | 'Video'; order: number }>> {
    const mediaItems = this.mediaItems();
    if (mediaItems.length === 0) return [];

    // Upload files that need upload (only blob URLs or files)
    const filesToUpload = mediaItems.filter((item) => item.file).map((item) => item.file);
    const uploadedResults = filesToUpload.length > 0 ? await this.mediaService.uploadMedia('Post', filesToUpload).then((res) => res?.data || []) : [];

    // Build medias array maintaining original order
    const medias: Array<{ media_url: string; media_type: 'Image' | 'Video'; order: number }> = [];
    let uploadedIndex = 0;

    for (const item of mediaItems) {
      let mediaUrl: string | undefined;
      let mediaType: 'Image' | 'Video' | undefined;

      if (item.file) {
        // Use uploaded URL (new file)
        const uploaded = uploadedResults[uploadedIndex++];
        if (!uploaded?.url) continue;
        mediaUrl = uploaded.url;
        mediaType = this.getMediaTypeFromMimetype(uploaded.mimetype);
      } else if (item.url) {
        // Use existing URL (from gallery or existing post media)
        // Skip blob URLs as they're temporary
        if (this.isBlobUrl(item.url)) continue;
        mediaUrl = item.url;
        mediaType = item.type === 'video' ? 'Video' : 'Image';
      }

      if (mediaUrl && mediaType) {
        medias.push({
          media_url: mediaUrl,
          media_type: mediaType,
          order: medias.length + 1
        });
      }
    }

    return medias;
  }

  private getMediaTypeFromMimetype(mimetype?: string): 'Image' | 'Video' {
    return mimetype?.startsWith('video') ? 'Video' : 'Image';
  }

  async loadChoices({ searchText, triggerCharacter }: { searchText: string; triggerCharacter: string }): Promise<IUser[]> {
    if (triggerCharacter === '@') {
      if (searchText && searchText.trim()) {
        this.searchSubject.next(searchText);
      } else {
        this.users = [];
      }
      return this.users || [];
    }
    return [];
  }

  getChoiceLabel = (user: IUser): string => {
    return `@${user.name || ''}`;
  };

  getDisplayLabel = (item: IUser): string => {
    return item.name || '';
  };

  onSelectedChoicesChange(choices: ChoiceWithIndices[]): void {
    this.mentions = choices;
    this.getFormattedHighlightText(this.textCtrl.value, this.mentions, this.parentCommentStatusBasedStyles);
    console.log('mentions:', this.mentions);
  }

  onMenuShow(): void {
    // Menu is shown - only show if we have users
    if (!this.users || this.users.length === 0) {
      return;
    }
  }

  onMenuHide(): void {
    this.users = [];
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

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  isBlobUrl(url: string): boolean {
    return url.startsWith('blob:');
  }

  onImageError(event: Event): void {
    onImageError(event, 'assets/images/profile.jpeg');
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null!;
    }
  }
}
