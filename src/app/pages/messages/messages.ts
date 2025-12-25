import {
  IonAvatar,
  IonBadge,
  IonItem,
  IonLabel,
  IonList,
  IonContent,
  IonHeader,
  IonToolbar,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  NavController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';

export interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  unreadCount?: number;
  group?: boolean;
  event?: boolean;
  network?: boolean;
  isMuted?: boolean;
}

@Component({
  selector: 'messages',
  imports: [
    Button,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonAvatar,
    IonHeader,
    Searchbar,
    IonContent,
    IonToolbar,
    CommonModule,
    IonItemOption,
    IonItemOptions,
    IonItemSliding
  ],
  styleUrl: './messages.scss',
  templateUrl: './messages.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Messages {
  private navCtrl = inject(NavController);
  private modalService = inject(ModalService);
  messages = signal<Message[]>([
    { id: 1, sender: 'Kathryn Murphy', text: "Hey, what's up?", time: '8:07 pm', unreadCount: 1, isMuted: true },
    { id: 2, sender: 'Group Chat A', text: 'Janette: Hello!', time: '5:15 pm', unreadCount: 3, group: true },
    { id: 3, sender: 'Sports Network', text: 'New update posted', time: '1:20 pm', unreadCount: 5, network: true },
    { id: 4, sender: 'Comedy Event', text: 'Event starting soon', time: 'Yesterday', unreadCount: 2, event: true },
    { id: 5, sender: 'John Doe', text: 'You: Got it!', time: '11:00 am' },
    { id: 6, sender: 'Group Chat B', text: 'New message!', time: '10:00 am', group: true },
    { id: 7, sender: 'Network People', text: 'Announcement made', time: '9:00 am', network: true }
  ]);

  tabs = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: 'Unread' },
    { value: 'group', label: 'Group' },
    { value: 'event', label: 'Event' },
    { value: 'network', label: 'Network' }
  ];

  activeTab = signal('all');

  searchInput = signal<string>('');

  constructor() {}

  // ---------- FINAL FILTERED MESSAGES ----------
  getFilteredMessages = computed(() => {
    const tab = this.activeTab();
    const search = this.searchInput().toLowerCase();

    return this.messages().filter((msg) => {
      const matchesSearch = msg.sender.toLowerCase().includes(search);

      if (!matchesSearch) return false;

      if (tab === 'unread') return msg.unreadCount && msg.unreadCount > 0;
      if (tab === 'group') return msg.group === true;
      if (tab === 'event') return msg.event === true;
      if (tab === 'network') return msg.network === true;

      return true;
    });
  });

  startNewChat() {
    this.navCtrl.navigateForward('/new-chat');
  }

  async muteChat(msg: Message) {
    const result = await this.modalService.openConfirmModal({
      icon: msg.isMuted ? 'assets/svg/alertBlackIcon.svg' : 'assets/svg/alertOffBlackIcon.svg',
      iconBgColor: '#ABABAB',
      title: msg.isMuted ? 'Unmute Chat' : 'Mute Chat',
      description: `Are you sure you want to ${msg.isMuted ? 'unmute' : 'mute'} the chat with "${msg.sender}"?`,
      confirmButtonLabel: msg.isMuted ? 'Unmute' : 'Mute',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'primary',
      iconPosition: 'left'
    });

    if (result && result.role === 'confirm' && result.data) {
      this.messages.update((list) => list.map((m) => (m.id === msg.id ? { ...m, isMuted: !m.isMuted } : m)));
    }
  }

  async deleteChat(msg: Message) {
    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/deleteWhiteIcon.svg',
      iconBgColor: '#C73838',
      title: 'Delete Chat',
      description: `Are you sure you want to delete the chat with "${msg.sender}"?`,
      confirmButtonLabel: 'Delete',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconPosition: 'left'
    });

    if (result && result.role === 'confirm' && result.data) {
      this.messages.update((list) => list.filter((m) => m.id !== msg.id));
    }
  }

  goToChat(msg: Message) {
    this.navCtrl.navigateForward(`/chat-room/${msg.id}`, { state: { message: msg } });
  }
}
