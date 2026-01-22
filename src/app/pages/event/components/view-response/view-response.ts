import { Component, input } from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';

interface QuestionnaireItem {
  question: string;
  type: 'text' | 'chips' | 'scale';
  answer: string | string[];
  scale?: number;
}
@Component({
  selector: 'view-response',
  imports: [NgOptimizedImage, DatePipe],
  templateUrl: './view-response.html',
  styleUrl: './view-response.scss'
})
export class ViewResponse {
  user = input<any>(null);
  questions = input<any>(null);

  onImageError(event: Event): void {
    onImageError(event);
  }

  getImageUrl(imageUrl = ''): string {
    return getImageUrlOrDefault(imageUrl);
  }
}
