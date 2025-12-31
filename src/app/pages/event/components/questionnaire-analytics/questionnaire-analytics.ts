import { Component, inject, input } from '@angular/core';
import { IonIcon, NavController } from '@ionic/angular/standalone';

export interface AnalyticsOption {
  label: string;
  value: number;
}

export interface AnalyticsScale {
  scale: number;
  value: number;
}

export interface AnalyticsQuestion {
  flag: 'pre' | 'post';
  visibility: 'public' | 'private';
  type: 'options' | 'scale';
  question: string;
  options?: AnalyticsOption[];
  scaleData?: AnalyticsScale[];
}

@Component({
  selector: 'questionnaire-analytics',
  imports: [IonIcon],
  templateUrl: './questionnaire-analytics.html',
  styleUrl: './questionnaire-analytics.scss'
})
export class QuestionnaireAnalytics {
  navCtrl = inject(NavController);
  analytics = input<AnalyticsQuestion[]>([]);
  getMax(options: AnalyticsOption[]) {
    return Math.max(...options.map((o) => o.value));
  }

  navigateToUserList(item: AnalyticsQuestion, opt: AnalyticsOption) {
    this.navCtrl.navigateForward(`/event/questionnaire-response/guests/${opt.value}`, { state: { questionOption: item, option: opt } });
  }
}
