import { NgOptimizedImage } from '@angular/common';
import { ChatEventCard } from "../chat-event-card";
import { NavigationService } from '@/services/navigation.service';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { Component, computed, inject, input } from '@angular/core';

@Component({
  selector: 'app-chat-feed-card',
  imports: [NgOptimizedImage, ChatEventCard],
  templateUrl: './chat-feed-card.html',
  styleUrl: './chat-feed-card.scss'
})
export class ChatFeedCard {
  feed = input<any>();
  navigationService = inject(NavigationService);

  firstMedia = computed(() => {
    const medias = this.feed()?.medias ?? [];

    console.log(
      'medias:',
      medias.find((m: any) => m.order === 1)
    );

    return medias.find((m: any) => m.order === 1) ?? null;
  });


  onPostClick(): void {
    const feed = this.feed();
    if (!feed) return;
    this.navigationService.navigateForward(`/comments/${feed.id}`);
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }

  onImageError(event: any): void {
    onImageError(event);
  }
}
