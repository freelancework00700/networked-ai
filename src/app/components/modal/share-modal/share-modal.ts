import { Checkbox } from 'primeng/checkbox';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { ToasterService } from '@/services/toaster.service';
import { UserService } from '@/services/user.service';
import { FeedService } from '@/services/feed.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonIcon, IonHeader, IonFooter, IonToolbar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner, ModalController } from '@ionic/angular/standalone';
import { Input, inject, signal, computed, Component, ChangeDetectionStrategy, OnInit, DestroyRef, ChangeDetectorRef, effect } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap, from, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUser } from '@/interfaces/IUser';
import { getImageUrlOrDefault } from '@/utils/helper';

@Component({
  selector: 'share-modal',
  styleUrl: './share-modal.scss',
  templateUrl: './share-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonIcon, Checkbox, IonFooter, Searchbar, IonHeader, IonToolbar, ReactiveFormsModule, IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonSpinner]
})
export class ShareModal implements OnInit {
  // services
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);
  private userService = inject(UserService);
  private feedService = inject(FeedService);
  private modalCtrl = inject(ModalController);
  private destroyRef = inject(DestroyRef);
  private cd = inject(ChangeDetectorRef);

  // inputs
  @Input() eventId: any;
  @Input() feedId?: string; // For Post type
  @Input() type: 'Event' | 'Post' = 'Event';

  // signals
  searchQuery = signal<string>('');
  selectedUsers = signal<IUser[]>([]);
  selectAllNetworkCtrl = signal<FormControl>(new FormControl(false));
  yourNetwork = signal<IUser[]>([]);
  isLoading = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  sendEntireNetwork = signal<boolean>(false);

  actions = [
    { icon: 'assets/svg/linkBlackIcon.svg', label: 'Copy Link', type: 'svg' },
    { icon: 'assets/svg/users.svg', label: 'Contact', type: 'svg' },
    { icon: 'pi pi-upload ', label: 'Share to', type: 'i' },
    { icon: 'assets/svg/chatIcon.svg', label: 'Chat', type: 'svg' },
    { icon: 'assets/svg/messengerIcon.svg', label: 'Messenger', type: 'svg' }
  ];

  private searchSubject = new Subject<string>();

  // computed
  selectedCount = computed(() => {
    const count = this.selectedUsers().length;
    return count > 0 ? ` (${count})` : '';
  });

  shareButtonLabel = computed(() => {
    return `Share ${this.type}${this.selectedCount()}`;
  });

  hasMore = computed(() => {
    return this.currentPage() < this.totalPages();
  });

  selectedUserIds = computed(() => {
    return this.selectedUsers().map(u => u.id);
  });

  constructor() {
    // Set up debounced search
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((searchText: string) => {
          this.isLoading.set(true);
          this.currentPage.set(1);
          
          return from(this.userService.getMyConnections({
            page: 1,
            limit: 20,
            search: searchText || undefined
          })).pipe(
            catchError((error) => {
              console.error('Error fetching network connections:', error);
              this.isLoading.set(false);
              return of({ data: [], pagination: { totalCount: 0, currentPage: 1, totalPages: 0 } });
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => {
        // Extract users from peer property in connections
        const users: IUser[] = (response.data || []).map((connection) => connection.peer).filter((peer): peer is IUser => !!peer);
        
        this.yourNetwork.set(users);
        this.currentPage.set(response.pagination?.currentPage || 1);
        this.totalPages.set(response.pagination?.totalPages || 0);
        this.isLoading.set(false);
        this.cd.detectChanges();
      });

    // Watch for search query changes
    effect(() => {
      const query = this.searchQuery();
      if (query !== undefined) {
        this.searchSubject.next(query);
      }
    });

    // Watch for checkbox changes
    this.selectAllNetworkCtrl().valueChanges.subscribe((checked) => {
      this.onSelectAllChange(checked);
    });
  }

  async ngOnInit() {
    await this.loadNetworkConnections();
  }

  async loadNetworkConnections(page: number = 1, append: boolean = false) {
    try {
      if (!append) {
        this.isLoading.set(true);
      } else {
        this.isLoadingMore.set(true);
      }

      const response = await this.userService.getMyConnections({
        page,
        limit: 20,
        search: this.searchQuery() || undefined
      });

      // Extract users from peer property in connections
      const users: IUser[] = (response.data || []).map((connection) => connection.peer).filter((peer): peer is IUser => !!peer);

      if (append) {
        this.yourNetwork.update(current => [...current, ...users]);
      } else {
        this.yourNetwork.set(users);
      }

      this.currentPage.set(response.pagination?.currentPage || 1);
      this.totalPages.set(response.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error loading network connections:', error);
    } finally {
      this.isLoading.set(false);
      this.isLoadingMore.set(false);
      this.cd.detectChanges();
    }
  }

  async loadMoreUsers(event: Event): Promise<void> {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;
    
    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    try {
      const nextPage = this.currentPage() + 1;
      await this.loadNetworkConnections(nextPage, true);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      infiniteScroll.complete();
    }
  }

  toggleUser(user: IUser) {
    const selected = this.selectedUsers();
    const exists = selected.some((u) => u.id === user.id);

    if (exists) {
      this.selectedUsers.set(selected.filter((u) => u.id !== user.id));
    } else {
      this.selectedUsers.set([...selected, user]);
    }

    this.syncSelectAllCheckbox();
  }

  isSelected(user: IUser) {
    return this.selectedUsers().some((u) => u.id === user.id);
  }

  syncSelectAllCheckbox() {
    const network = this.yourNetwork();
    const allSelected = network.length > 0 && network.every((u) => this.isSelected(u));

    this.selectAllNetworkCtrl().setValue(allSelected, {
      emitEvent: false
    });
  }

  onSelectAllChange(checked: boolean) {
    this.sendEntireNetwork.set(checked);
    
    if (checked) {
      const network = this.yourNetwork();
      const selected = this.selectedUsers();
      const merged = [...selected, ...network.filter((u) => !selected.some((s) => s.id === u.id))];
      this.selectedUsers.set(merged);
    } else {
      const networkIds = new Set(this.yourNetwork().map((u) => u.id));
      this.selectedUsers.set(this.selectedUsers().filter((u) => !networkIds.has(u.id)));
    }
  }

  getImageUrl(user: IUser): string {
    return getImageUrlOrDefault(user.thumbnail_url);
  }

  getUserDisplayName(user: IUser): string {
    
    const name = user.name || user.username || '';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0]} ${parts[parts.length - 1][0]}.`;
    }
    return name;
  }

  async sharePost() {
    if (this.type !== 'Post' || !this.feedId) {
      this.toasterService.showError('Invalid share request');
      return;
    }

    const sendEntireNetwork = this.sendEntireNetwork();
    const selectedIds = this.selectedUserIds();

    if (!sendEntireNetwork && selectedIds.length === 0) {
      this.toasterService.showError('Please select at least one user or enable "Send to Entire Network"');
      return;
    }

    try {
      const payload: {
        feed_id: string;
        peer_ids?: string[];
        send_entire_network?: boolean;
      } = {
        feed_id: this.feedId
      };

      if (sendEntireNetwork) {
        payload.send_entire_network = true;
      } else {
        payload.peer_ids = selectedIds;
      }

      const response = await this.feedService.shareFeed(payload);
      
      this.toasterService.showSuccess(response.message || 'Post shared successfully');
      
      await this.modalCtrl.dismiss({ success: true });
    } catch (error: any) {
      console.error('Error sharing post:', error);
      const errorMessage = error?.message || 'Failed to share post. Please try again.';
      this.toasterService.showError(errorMessage);
    }
  }

  async close() {
    await this.modalCtrl.dismiss();
  }
}
