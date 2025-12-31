import { ActivatedRoute } from '@angular/router';
import { Button } from '@/components/form/button';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { IonFooter, IonHeader, IonAvatar, IonContent, IonToolbar, IonInput, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'chat-room',
  styleUrl: './chat-room.scss',
  templateUrl: './chat-room.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonInput, IonAvatar, IonFooter, IonContent, IonHeader, IonToolbar, Button]
})
export class ChatRoom {
  private route = inject(ActivatedRoute);
  private navCtrl = inject(NavController);

  newMessage = signal('');
  chatId = signal<string>('');
  chatName = signal('Cathryn W.');
  isEvent = signal<boolean>(false);
  selectedIndex = signal<number | null>(null);
  editingIndex = signal<number | null>(null);
  messages = signal<any[]>([
    { sender: 'You', text: 'Hey!', time: '11:24 AM' },
    { sender: 'Cathryn W.', text: 'Hi! How are you?', time: '11:25 AM' },
    { sender: 'You', text: 'I was thinking about our project. We need to finalize the layout.', time: '11:26 AM' },
    { sender: 'Cathryn W.', text: "Absolutely! I have some ideas. Let's discuss them during the meeting on Sunday.", time: '11:27 AM' },
    {
      sender: 'You',
      text: 'Sounds good! Also, I prepared a detailed draft of the content plan. It might take a while to review, but it will give us a clear direction for the next steps.',
      time: '11:30 AM'
    },
    {
      sender: 'Cathryn W.',
      text: 'Thanks! I also checked the client feedback. They mentioned that some sections need color adjustments and typography fixes.',
      time: '11:32 AM'
    },
    {
      sender: 'You',
      text: "Got it. I'll handle the changes. By the way, are you attending the networking event after the meeting? It could be useful.",
      time: '11:35 AM'
    },
    { sender: 'Cathryn W.', text: 'Yes! It should be interesting. Looking forward to connecting with new people there.', time: '11:37 AM' },
    { sender: 'You', text: 'Great!', time: '11:38 AM' },
    {
      sender: 'Cathryn W.',
      text: "Also, don't forget to bring the updated files. Some sections have extra notes that we need to discuss in detail. The client might have more questions, so let's be prepared.",
      time: '11:40 AM'
    },
    { sender: 'You', text: "Sure thing! I'll make sure everything is ready before the meeting.", time: '11:42 AM' }
  ]);

  private navEffect = effect(() => {
    const state = history.state;

    if (state?.message) {
      this.chatName.set(state.message.sender);
      this.isEvent.set(state.message.event);
    }
  });

  ngOnInit() {
    this.chatId.set(this.route.snapshot.paramMap.get('id')!);
  }

  onInputChange(event: any) {
    console.log('onInputChange', event);
  }

  onLongPress(index: number) {
    this.selectedIndex.set(index);
  }

  closeMenu() {
    this.selectedIndex.set(null);
  }

  deleteMessage(index: number) {
    this.messages.update((msgs) => msgs.map((msg, i) => (i === index ? { ...msg, text: 'This message was deleted', deleted: true } : msg)));

    this.selectedIndex.set(null);
  }

  sendMessage() {
    const text = this.newMessage().trim();
    if (!text) return;

    // Editing existing message
    if (this.editingIndex() !== null) {
      const idx = this.editingIndex()!;
      this.messages.update((msgs) => msgs.map((m, i) => (i === idx ? { ...m, text, deleted: false } : m)));

      this.editingIndex.set(null);
      this.newMessage.set('');
      return;
    }

    // New message
    this.messages.update((msgs) => [...msgs, { sender: 'You', text, time: this.getTime() }]);

    this.newMessage.set('');
  }

  getTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  editMessage(index: number) {
    this.editingIndex.set(index);
    this.newMessage.set(this.messages()[index].text);
    this.selectedIndex.set(null);
  }

  handleBack() {
    this.navCtrl.navigateForward('/messages');
  }

  openChatInfo() {
    this.navCtrl.navigateForward(`/chat-info/${this.chatId()}`);
  }

  navigateToNetwork() {
    this.navCtrl.navigateForward('/event/questionnaire-response/1');
  }
}
