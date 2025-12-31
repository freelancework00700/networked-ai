import { Component, input } from '@angular/core';

interface QuestionnaireItem {
  question: string;
  type: 'text' | 'chips' | 'scale';
  answer: string | string[];
  scale?: number;
}
@Component({
  selector: 'view-response',
  imports: [],
  templateUrl: './view-response.html',
  styleUrl: './view-response.scss'
})
export class ViewResponse {
  user = input<any>(null);

  questionnaire: QuestionnaireItem[] = [
    {
      question: 'Tell us your experience with rock-climbing!',
      type: 'text',
      answer: 'I’ve had a couple trips with my friends last year but nothing too pro level.'
    },
    {
      question: 'What do you enjoy about networking?',
      type: 'chips',
      answer: ['Making new friends', 'Socializing', 'Making new friends Socializing', 'Making new friends']
    },
    {
      question: 'What topic are you most interested in?',
      type: 'chips',
      answer: ['Rock Climbing']
    },
    {
      question: 'How satisfied were you with the event overall??',
      type: 'scale',
      answer: '5',
      scale: 10
    }
  ];
}
