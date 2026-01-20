import { ActivatedRoute, Router } from '@angular/router';
import { Button } from '@/components/form/button';
import { ChangeDetectionStrategy, Component, effect, inject, signal, OnInit, computed, ViewChild, ElementRef, AfterViewChecked, viewChild, OnDestroy } from '@angular/core';
import { IonFooter, IonHeader, IonContent, IonToolbar, IonInput, NavController, IonSpinner, IonInfiniteScroll, IonInfiniteScrollContent, IonIcon } from '@ionic/angular/standalone';
import { MessagesService } from '@/services/messages.service';
import { AuthService } from '@/services/auth.service';
import { SocketService } from '@/services/socket.service';
import { ModalService } from '@/services/modal.service';
import { ChatMessage, ChatRoomUser } from '@/interfaces/IChat';
import { CommonModule, NgOptimizedImage, DatePipe } from '@angular/common';
import { onImageError, getImageUrlOrDefault } from '@/utils/helper';
import { NavigationService } from '@/services/navigation.service';

@Component({
  selector: 'chat-room',
  styleUrl: './chat-room.scss',
  templateUrl: './chat-room.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonInput,
    IonFooter,
    IonContent,
    IonHeader,
    IonToolbar,
    Button,
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonIcon,
    CommonModule,
    NgOptimizedImage
  ]
})
export class ChatRoom implements OnInit, OnDestroy {
  // @ViewChild(IonContent) content?: IonContent;
  content = viewChild<IonContent>('content');

  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);
  private messagesService = inject(MessagesService);
  private authService = inject(AuthService);
  private socketService = inject(SocketService);
  private modalService = inject(ModalService);
  private navigationService = inject(NavigationService);
  private router = inject(Router);
  private datePipe = new DatePipe('en-US');

  // Socket event handler references for cleanup
  private messageCreatedHandler?: (payload: { message: ChatMessage }) => void;
  private messageUpdatedHandler?: (payload: { message: ChatMessage }) => void;
  private messageDeletedHandler?: (payload: { message_id: string; room_id: string; deleted_by?: string | null }) => void;

  newMessage = signal('');
  chatId = signal<string>('');
  chatName = signal('');
  otherUser = signal<ChatRoomUser | null>(null);
  isEvent = signal<boolean>(false);
  isGroup = computed(() => this.chatRoom()?.is_personal === false);
  selectedIndex = signal<string | null>(null);
  editingIndex = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  messages = signal<ChatMessage[]>([]);

  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  sortedMessages = computed(() => {
    return this.sortMessages(this.messages());
  });

  isLoading = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  isLoadingRoom = signal<boolean>(false);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  hasMoreMessages = computed(() => this.currentPage() < this.totalPages());
  chatRoom = signal<any>(null);

  currentUser = this.authService.currentUser;

  private updateChatRoomInfo(room: any): void {
    if (room) {
      if (room.is_personal && room.users && room.users.length > 0) {
        const currentUserId = this.currentUser()?.id;
        const otherUser = room.users.find((user: any) => user.id !== currentUserId);
        this.otherUser.set(otherUser);

        this.chatName.set(this.otherUser()?.name || this.otherUser()?.username || 'Chat');
      } else {
        this.chatName.set(room.name || 'Chat');
      }
      this.isEvent.set(!!room.event_id);
    }
  }

  chatImage = computed(() => {
    const room = this.chatRoom();
    if (!room) return null;

    if (room.event_image) return room.event_image;
    if (room.profile_image) return room.profile_image;

    if (room.is_personal && this.otherUser()) {
      return this.otherUser()?.thumbnail_url || '';
    }
    return null;
  });

  async ngOnInit() {
    const navigation = this.router.currentNavigation();
    const state: any = navigation?.extras?.state;

    if (state?.chatRoom?.id) {
      this.chatRoom.set(state.chatRoom);
      this.updateChatRoomInfo(state.chatRoom);
      this.chatId.set(state.chatRoom.id);

      await this.loadMessages();

      this.messagesService.markRoomAsRead(state.chatRoom.id);

      this.joinRoom();
      this.setupMessageListener();
      return;
    }
    if (state?.user_ids && Array.isArray(state.user_ids) && state.user_ids.length > 0) {
      // Personal or group chat with user_ids
      await this.initializeChatRoom(state);
    } else if (state?.event_id) {
      // Event chat - API will handle user_ids based on event participants
      await this.initializeChatRoom(state);
    } else {
      console.error('Missing required data for chat room initialization');
    }
  }

  /**
   * Initialize chat room by creating or getting existing room
   */
  private async initializeChatRoom(state: any): Promise<void> {
    const currentUserId = this.authService.currentUser()?.id;

    if (!currentUserId) {
      console.error('User not logged in');
      return;
    }

    try {
      this.isLoadingRoom.set(true);

      const roomParams: {
        user_ids: string[];
        name?: string | null;
        is_personal?: boolean;
        event_id?: string | null;
        event_image?: string | null;
        profile_image?: string | null;
      } = {
        user_ids: state.user_ids || [],
        is_personal: state.is_personal ?? (state.event_id ? false : true)
      };

      if (state.event_id !== undefined) {
        roomParams.event_id = state.event_id;
      }

      // Create or get existing chat room
      const result = await this.messagesService.createOrGetChatRoom(roomParams);

      // Set the room ID
      this.chatId.set(result.room_id);

      // Get full room data by ID to load header data and other required details
      try {
        const fullRoomData = await this.messagesService.getChatRoomById(result.room_id);
        this.chatRoom.set(fullRoomData);
        this.updateChatRoomInfo(fullRoomData);
      } catch (error) {
        console.error('Error loading full room data:', error);
        // Fallback: use room data from result if available
        if (result.room) {
          this.chatRoom.set(result.room);
          this.updateChatRoomInfo(result.room);
        }
      }

      // Load messages for the room
      await this.loadMessages();

      // Join the room via socket after messages are loaded
      this.joinRoom();

      // Setup socket listener for new messages
      this.setupMessageListener();
    } catch (error) {
      console.error('Error initializing chat room:', error);
    } finally {
      this.isLoadingRoom.set(false);
    }
  }

  ngOnDestroy(): void {
    // Leave the room when component is destroyed
    this.leaveRoom();

    // Remove socket listener
    if (this.messageCreatedHandler) {
      this.socketService.off('message:created', this.messageCreatedHandler);
    }
    if (this.messageUpdatedHandler) {
      this.socketService.off('message:updated', this.messageUpdatedHandler);
    }
    if (this.messageDeletedHandler) {
      this.socketService.off('message:deleted', this.messageDeletedHandler);
    }

    const roomId = this.chatId();
    if (roomId) {
      this.messagesService.markRoomAsRead(roomId);
    }
  }

  /**
   * Join the chat room via socket
   */
  private joinRoom(): void {
    const userId = this.authService.currentUser()?.id;
    const roomId = this.chatId();

    if (userId && roomId) {
      this.socketService.onAfterRegistration(() => {
        this.socketService.emit('joinRoom', { userId, roomId });
      });
    }
  }

  /**
   * Leave the chat room via socket
   */
  private leaveRoom(): void {
    const userId = this.authService.currentUser()?.id;
    const roomId = this.chatId();

    if (userId && roomId && this.socketService.isSocketReady()) {
      this.socketService.emit('leaveRoom', { userId, roomId });
    }
  }

  /**
   * Setup socket listeners for message events
   */
  private setupMessageListener(): void {
    const currentRoomId = this.chatId();

    // Handler for message:created
    this.messageCreatedHandler = (payload: { message: ChatMessage }) => {
      const newMessage = payload.message;

      // Only add message if it belongs to current room
      if (newMessage.chat_room_id === currentRoomId) {
        // Check if message already exists (avoid duplicates)
        const existingMessage = this.messages().find(msg => msg.id === newMessage.id);

        if (!existingMessage) {
          // Append new message to the array (it will be sorted by computed property)
          this.messages.update(current => [...current, newMessage]);

          // Scroll to bottom when new message arrives
          this.scrollToBottom();
        }
      }
    };

    // Handler for message:updated
    this.messageUpdatedHandler = (payload: { message: ChatMessage }) => {
      const updatedMessage = payload.message;

      // Only update message if it belongs to current room
      if (updatedMessage.chat_room_id === currentRoomId) {
        this.messages.update(current =>
          current.map(msg =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      }
    };

    // Handler for message:deleted
    this.messageDeletedHandler = (payload: { message_id: string }) => {
      // Only handle if it belongs to current room
      if (payload.message_id) {
        this.messages.update(current =>
          current.map(msg =>
            msg.id === payload.message_id
              ? { ...msg, is_deleted: true, message: 'This message was deleted' }
              : msg
          )
        );
      }
    };

    // Register all listeners after socket is ready
    this.socketService.onAfterRegistration(() => {
      if (this.messageCreatedHandler) {
        this.socketService.on('message:created', this.messageCreatedHandler);
      }
      if (this.messageUpdatedHandler) {
        this.socketService.on('message:updated', this.messageUpdatedHandler);
      }
      if (this.messageDeletedHandler) {
        this.socketService.on('message:deleted', this.messageDeletedHandler);
      }
    });
  }

  /**
   * Sort messages by created_at ascending (oldest first, newest last)
   */
  private sortMessages(messages: ChatMessage[]): ChatMessage[] {
    return [...messages].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB;
    });
  }

  /**
   * Load messages for the chat room
   */
  async loadMessages(reset: boolean = true): Promise<void> {
    // this.scrollToBottom();
    try {
      if (reset) {
        this.isLoading.set(true);
      } else {
        this.isLoadingMore.set(true);
      }

      const page = reset ? 1 : this.currentPage() + 1;
      const result = await this.messagesService.getMessagesByRoomId(this.chatId(), {
        page,
        limit: 15
      });

      // For reverse pagination: prepend older messages (if not resetting)
      // Or set messages if resetting (newest messages)
      if (reset) {
        this.messages.set(result.messages);
        this.scrollToBottom();
      } else {
        // Prepend older messages at the beginning
        this.messages.update(current => [...result.messages, ...current]);
      }

      this.currentPage.set(result.pagination.currentPage);
      this.totalPages.set(result.pagination.totalPages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      this.isLoading.set(false);
      this.isLoadingMore.set(false);
    }
  }

  /**
   * Load more older messages (reverse pagination on scroll up)
   */
  async loadMoreMessages(event: Event): Promise<void> {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;

    if (!this.hasMoreMessages()) {
      infiniteScroll.complete();
      return;
    }

    const content = this.content();
    if (!content) return;

    try {

      const scrollEl = await content.getScrollElement();
      const previousHeight = scrollEl?.scrollHeight || 0;

      await this.loadMessages(false);

      requestAnimationFrame(() => {
        const newHeight = scrollEl.scrollHeight;
        scrollEl.scrollTop += newHeight - previousHeight;
        infiniteScroll.complete();
      });

    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      infiniteScroll.complete();
    }
  }

  /**
   * Scroll to bottom of content
   */
  private scrollToBottom() {
    requestAnimationFrame(() => {
      this.content()?.scrollToBottom(300);
    });
  }

  /**
   * Check if message is from current user
   */
  isCurrentUserMessage(message: ChatMessage): boolean {
    return message.posted_by_user_id === this.currentUser()?.id;
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    const date = new Date(isoString);
    return this.datePipe.transform(date, 'h:mm a') || '';
  }

  getImageUrl(imageUrl: string | null | undefined): string {
    return getImageUrlOrDefault(imageUrl || '');
  }

  onImageError(event: Event): void {
    onImageError(event);
  }

  openImagePreview(imageUrl: string | null): void {
    if (!imageUrl) return;
    this.modalService.openImagePreviewModal(this.getImageUrl(imageUrl));
  }

  getMessageClasses(msg: ChatMessage): { [key: string]: boolean } {
    const isDeleted = msg.is_deleted ?? false;
    const isEditing = this.editingIndex() === msg.id;

    return {
      'bg-primary': !isDeleted && !isEditing,
      'bg-gray-200': isDeleted || isEditing,
      'text-gray-500': isDeleted,
      'text-gray-900': !isDeleted && !isEditing
    };
  }

  onLongPress(messageId: string) {
    // Toggle: if clicking the same message, close it; otherwise open it
    if (this.selectedIndex() === messageId) {
      this.selectedIndex.set(null);
    } else {
      this.selectedIndex.set(messageId);
    }
  }

  closeMenu() {
    this.selectedIndex.set(null);
  }

  async deleteMessage(messageId: string) {
    try {
      await this.messagesService.deleteMessage(messageId);
      this.selectedIndex.set(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  async sendMessage() {
    const text = this.newMessage().trim();
    const file = this.selectedFile();
    const roomId = this.chatId();

    // Don't send if no text and no file
    if (!text && !file) return;
    if (!roomId) return;

    const editingMessageId = this.editingIndex();
    if (editingMessageId !== null) {
      if (file) {
        this.selectedFile.set(null);
      }
      try {
        await this.messagesService.updateMessage(editingMessageId, roomId, text);
        this.editingIndex.set(null);
        this.newMessage.set('');
      } catch (error) {
        console.error('Error updating message:', error);
      }
      return;
    }

    // Clear input and file immediately for better UX
    const messageText = text;
    const messageFile = file;
    this.newMessage.set('');
    this.selectedFile.set(null);

    try {
      if (messageFile) {
        await this.messagesService.sendMessageWithFile(roomId, messageText, messageFile);
      } else {
        await this.messagesService.sendMessage(roomId, messageText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.newMessage.set(messageText);
      if (messageFile) {
        this.selectedFile.set(messageFile);
      }
    }
  }

  openFilePicker() {
    this.fileInput()?.nativeElement.click();
  }

  onBrowseFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedFile.set(file);
    input.value = '';
  }

  openEmojiPicker() {
    const input = document.querySelector('ion-input') as any;
    if (input) {
      const nativeInput = input.querySelector('input');
      if (nativeInput) {
        nativeInput.focus();
      }
    }
  }

  removeSelectedFile() {
    this.selectedFile.set(null);
  }

  editMessage(messageId: string) {
    const message = this.messages().find(m => m.id === messageId);
    if (message) {
      this.editingIndex.set(messageId);
      this.newMessage.set(message.message);
      this.selectedIndex.set(null);
    }
  }

  handleBack() {
    this.navCtrl.back();
  }

  openChatInfo() {
    const room = this.chatRoom();
    const roomId = this.chatId();
    if (roomId) {
      if (!room.is_personal) {
        this.navigationService.navigateForward('/chat-info', false, {
          roomId: roomId,
          chatRoom: room,
          from: 'chat-room'
        });
      } else {
        this.navigationService.navigateForward(`/${this.otherUser()?.username}`);
      }
    }
  }

  navigateToNetwork() {
    this.navCtrl.navigateForward('/event/questionnaire-response/1');
  }
}