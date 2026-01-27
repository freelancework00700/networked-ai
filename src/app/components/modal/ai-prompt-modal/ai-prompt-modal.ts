import { Capacitor } from '@capacitor/core';
import { CommonModule } from '@angular/common';
import { Clipboard } from '@capacitor/clipboard';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ModalController, IonSpinner, ToastController, IonToolbar, IonHeader, IonFooter, IonContent } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, Input, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'ai-prompt-modal',
  styleUrl: './ai-prompt-modal.scss',
  templateUrl: './ai-prompt-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, IonFooter, IonHeader, IonToolbar, CommonModule, IonSpinner]
})
export class AIPromptModal implements OnInit, AfterViewInit {
  modalCtrl = inject(ModalController);
  http = inject(HttpClient);
  toastCtrl = inject(ToastController);

  @Input() conversation: any[] = [];
  @Input() isEvent: boolean = false;

  @ViewChild('textareaRef', { static: false }) textareaRef!: ElementRef<HTMLTextAreaElement>;

  prompt = signal<string>('');
  loading = signal<boolean>(false);
  conversationData = signal<Message[]>([]);

  getInitialSystemMessage(): string {
    return this.isEvent
      ? 'You are a helpful assistant. When describing events, always provide responses in structured HTML format with appropriate headings, paragraphs, and lists. Ensure that all text is wrapped in HTML tags, with headings as <h2> or <h3>, paragraphs as <p>, and lists as <ul> or <ol> with <li> for list items. Avoid returning plain text without HTML tags.'
      : 'You are a helpful assistant. Provide short responses in plain text without HTML formatting.';
  }

  ngOnInit(): void {
    if (this.conversation && this.conversation.length > 0) {
      this.conversationData.set([...this.conversation]);
    } else {
      this.conversationData.set([
        {
          role: 'system',
          content: this.getInitialSystemMessage()
        }
      ]);
    }
  }

  ngAfterViewInit(): void {
    this.autoGrowTextArea();
  }

  get filterMessage(): Message[] {
    return this.conversationData().filter((item) => item.role !== 'system');
  }

  async close(): Promise<void> {
    await this.modalCtrl.dismiss({
      type: 'data',
      data: this.conversationData()
    });
  }

  async sendPromptToAI(): Promise<void> {
    const currentPrompt = this.prompt();
    if (!currentPrompt || this.loading()) return;

    this.loading.set(true);
    const newConversation: Message[] = [...this.conversationData(), { role: 'user', content: currentPrompt }];

    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${environment.openaiKey}`
      });

      const result = await this.http
        .post<any>(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: newConversation,
            max_tokens: 4000
          },
          { headers }
        )
        .toPromise();

      const aiResponse = result.choices[0].message.content;
      const updatedResponse = aiResponse.replace(/width="\d+"/, 'width="100%"');

      const updatedConversation: Message[] = [...newConversation, { role: 'assistant', content: updatedResponse }];

      this.conversationData.set(updatedConversation);
      this.prompt.set('');
      this.autoGrowTextArea();
    } catch (error) {
      console.error('Error sending prompt:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error sending prompt. Please try again.',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.loading.set(false);
    }
  }

  handleInputChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.prompt.set(target.value);
    this.autoGrowTextArea();
  }

  autoGrowTextArea(): void {
    setTimeout(() => {
      if (this.textareaRef?.nativeElement) {
        const textarea = this.textareaRef.nativeElement;
        textarea.style.height = 'auto';
        const lines = this.prompt().split('\n').length;
        textarea.style.height = `${Math.min(lines * 20, 64)}px`;
        textarea.style.overflowY = lines > 4 ? 'scroll' : 'hidden';
      }
    }, 0);
  }

  handleSelectText(): void {
    const conversation = this.conversationData();
    const lastAssistantMessage = conversation
      .slice()
      .reverse()
      .find((msg) => msg.role === 'assistant');

    if (lastAssistantMessage) {
      this.modalCtrl.dismiss({ type: 'value', data: lastAssistantMessage.content });
    }
  }

  async handleCopyText(html: string): Promise<void> {
    try {
      const isCapacitor = Capacitor.isNativePlatform();

      if (isCapacitor) {
        try {
          const plainText = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
          await Clipboard.write({
            string: plainText
          });
          const toast = await this.toastCtrl.create({
            message: 'Text copied to clipboard!',
            duration: 1500,
            position: 'bottom',
            color: 'success'
          });
          await toast.present();
        } catch (error) {
          console.error('Failed to copy text:', error);
          await this.copyToWebClipboard(html);
        }
      } else {
        await this.copyToWebClipboard(html);
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }

  async copyToWebClipboard(html: string): Promise<void> {
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({ 'text/html': blob });
      await navigator.clipboard.write([clipboardItem]);
      const toast = await this.toastCtrl.create({
        message: 'Text copied to clipboard!',
        duration: 1500,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      const plainText = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
      await navigator.clipboard.writeText(plainText);
      const toast = await this.toastCtrl.create({
        message: 'Text copied to clipboard!',
        duration: 1500,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();
    }
  }

  getConversationLength(): number {
    return this.conversationData().length;
  }
}
