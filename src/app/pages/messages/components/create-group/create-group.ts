import { Button } from '@/components/form/button';
import { Searchbar } from '@/components/common/searchbar';
import { IUser } from '@/interfaces/IUser';
import { AuthService } from '@/services/auth.service';
import { MessagesService } from '@/services/messages.service';
import { MediaService } from '@/services/media.service';
import { NetworkService } from '@/services/network.service';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonFooter,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonToolbar,
  NavController
} from '@ionic/angular/standalone';
import { InputTextModule } from 'primeng/inputtext';
import { Subject, debounceTime, distinctUntilChanged, from, switchMap } from 'rxjs';
@Component({
  selector: 'create-group',
  styleUrl: './create-group.scss',
  templateUrl: './create-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonFooter, Searchbar, IonContent, IonHeader, IonToolbar, Button, InputTextModule, IonInfiniteScroll, IonInfiniteScrollContent, NgOptimizedImage]
})
export class CreateGroup {
  private navCtrl = inject(NavController);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);
  private networkService = inject(NetworkService);
  private messagesService = inject(MessagesService);
  private mediaService = inject(MediaService);
  private router = inject(Router);

  // navigation context
  roomId = signal<string | null>(null);
  from = signal<'new-chat' | 'chat-info'>('new-chat');

  // auth
  isLoggedIn = computed(() => !!this.authService.currentUser());

  // search + pagination
  searchText = signal('');
  users = signal<IUser[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  isLoading = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasMore = computed(() => this.currentPage() < this.totalPages());

  // selection + steps
  selectedMembers = signal<IUser[]>([]);
  isGroupDetails = signal(false);
  groupImagePreview = signal<string | null>(null);
  groupImageFile = signal<File | null>(null);
  groupName = signal<string>('');

  // existing group members (when editing)
  existingMemberIds = signal<Set<string>>(new Set());
  isLoadingRoom = signal<boolean>(false);

  private isInitialized = false;
  private searchSubject = new Subject<string>();

  constructor() {
    // Debounced search
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => from(this.resetAndLoad(query.trim() || undefined))),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    // Watch search changes (debounced)
    effect(() => {
      const query = this.searchText();
      if (!this.isLoggedIn() || !this.isInitialized) return;
      this.searchSubject.next(query);
    });

    // Initialize when user is available
    effect(() => {
      const userId = this.authService.currentUser()?.id;
      if (!userId) {
        this.isInitialized = false;
        this.users.set([]);
        this.currentPage.set(1);
        this.totalPages.set(0);
        return;
      }

      if (!this.isInitialized) {
        this.isInitialized = true;
        this.resetAndLoad(this.searchText().trim() || undefined);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const navigation = this.router.currentNavigation();
    const state: any = navigation?.extras?.state;
    if (state?.roomId) {
      this.roomId.set(state.roomId);
      this.from.set(state.from === 'chat-info' ? 'chat-info' : 'new-chat');
      
      // Load existing group members to track who's already added
      await this.loadExistingGroupMembers(state.roomId);
    }
  }

  /**
   * Load existing group members to track who's already in the group
   */
  private async loadExistingGroupMembers(roomId: string): Promise<void> {
    try {
      this.isLoadingRoom.set(true);
      const room = await this.messagesService.getChatRoomById(roomId);
      
      // Extract user IDs from existing members
      const memberIds = new Set<string>();
      if (room.users && Array.isArray(room.users)) {
        room.users.forEach((user: any) => {
          if (user.id) {
            memberIds.add(user.id);
          }
        });
      }
      
      this.existingMemberIds.set(memberIds);
    } catch (error) {
      console.error('Error loading existing group members:', error);
    } finally {
      this.isLoadingRoom.set(false);
    }
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  getUserThumbnail(user: IUser): string {
    const val = user.thumbnail_url ?? user.image_url ?? '';
    return typeof val === 'string' ? val : '';
  }

  getDisplayName(u: IUser): string {
    return u.name || u.username || '';
  }

  getDiamondPath(user: IUser): string {
    const points = user?.total_gamification_points || 0;
    if (points >= 50000) return '/assets/svg/gamification/diamond-50k.svg';
    if (points >= 40000) return '/assets/svg/gamification/diamond-40k.svg';
    if (points >= 30000) return '/assets/svg/gamification/diamond-30k.svg';
    if (points >= 20000) return '/assets/svg/gamification/diamond-20k.svg';
    if (points >= 10000) return '/assets/svg/gamification/diamond-10k.svg';
    if (points >= 5000) return '/assets/svg/gamification/diamond-5k.svg';
    return '/assets/svg/gamification/diamond-1k.svg';
  }

  private async resetAndLoad(search?: string): Promise<void> {
    this.currentPage.set(1);
    this.totalPages.set(0);
    await this.loadConnections(1, false, search);
  }

  async loadConnections(page: number = 1, append: boolean = false, search?: string): Promise<void> {
    if (!this.isLoggedIn()) return;
    try {
      if (page === 1) this.isLoading.set(true);

      const result = await this.networkService.getMyConnections({
        page,
        limit: 15,
        search: search || undefined
      });

      const nextUsers = result.data || [];
      if (append) {
        this.users.update((current) => [...current, ...nextUsers]);
      } else {
        this.users.set(nextUsers);
      }

      this.currentPage.set(result.pagination?.currentPage || 1);
      this.totalPages.set(result.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  loadMoreUsers = async (event: Event): Promise<void> => {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;
    const search = this.searchText().trim() || undefined;

    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    try {
      this.isLoadingMore.set(true);
      const nextPage = this.currentPage() + 1;
      await this.loadConnections(nextPage, true, search);
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  };

  toggleMember(user: IUser): void {
    // Don't allow selection if user is already in the group
    if (this.isAlreadyInGroup(user.id)) {
      return;
    }

    const isAlreadySelected = this.selectedMembers().some((u) => u.id === user.id);
    if (isAlreadySelected) {
      this.selectedMembers.update((list) => list.filter((u) => u.id !== user.id));
    } else {
      this.selectedMembers.update((list) => [...list, user]);
    }
  }

  /**
   * Check if a user is already in the group
   */
  isAlreadyInGroup(userId: string): boolean {
    return this.existingMemberIds().has(userId);
  }

  removeMember(user: IUser): void {
    this.selectedMembers.update((list) => list.filter((u) => u.id !== user.id));
  }

  isSelected(id: string): boolean {
    return this.selectedMembers().some((u) => u.id === id);
  }

  nextStep(): void {
    this.isGroupDetails.set(true);
  }

  async createGroup(): Promise<void> {
    const currentUserId = this.authService.currentUser()?.id;
    if (!currentUserId) return;

    const name = this.groupName().trim();
    if (!name) return;

    const memberIds = this.selectedMembers().map((u) => u.id);
    const user_ids = Array.from(new Set([currentUserId, ...memberIds]));

    try {
      // Upload group image first (API expects URL, not base64)
      let profileImageUrl: string | null = null;
      const imageFile = this.groupImageFile();
      if (imageFile instanceof File) {
        const response = await this.mediaService.uploadMedia('Other', [imageFile]);
        const uploadedUrl = response?.data?.[0]?.url;
        if (typeof uploadedUrl === 'string' && uploadedUrl.trim()) {
          profileImageUrl = uploadedUrl;
        }
      }

      const { room_id } = await this.messagesService.createOrGetChatRoom({
        user_ids,
        name,
        is_personal: false,
        profile_image: profileImageUrl
      });

      const room = await this.messagesService.getChatRoomById(room_id);

      this.navCtrl.navigateForward('/chat-info', {
        state: {
          roomId: room_id,
          chatRoom: room,
          from: 'new-group'
        }
      });
    } catch (error) {
      console.error('Error creating group:', error);
    }
  }

  handleBack(): void {
    if (this.isGroupDetails()) {
      this.isGroupDetails.set(false);
      return;
    }

    if (this.from() === 'chat-info') {
      this.navCtrl.back();
      return;
    }

    this.navCtrl.navigateBack('/messages');
  }

  onGroupImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;

    this.groupImageFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.groupImagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  onGroupNameInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.groupName.set(value);
  }

  /**
   * Add selected members to existing group
   */
  async addMembersToGroup(): Promise<void> {
    const roomId = this.roomId();
    if (!roomId) return;

    const selectedIds = this.selectedMembers()
      .map((u) => u.id)
      .filter((id) => !this.isAlreadyInGroup(id));

    if (selectedIds.length === 0) {
      console.log('No new members to add');
      return;
    }

    try {
      await this.messagesService.joinRoom(roomId, selectedIds);
      
      // Navigate back to chat-info after successful addition
      this.navCtrl.back();
    } catch (error) {
      console.error('Error adding members to group:', error);
    }
  }

  // TODO: backend flow for invite link
  copyInviteLink(): void {
    console.log('copyInviteLink');
  }
}
