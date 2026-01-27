import { Component, inject, input } from '@angular/core';
import { IonIcon, NavController } from '@ionic/angular/standalone';
import { AnalyticsQuestion, AnalyticsOption } from '@/interfaces/event';

@Component({
  selector: 'questionnaire-analytics',
  imports: [IonIcon],
  templateUrl: './questionnaire-analytics.html',
  styleUrl: './questionnaire-analytics.scss'
})
export class QuestionnaireAnalytics {
  navCtrl = inject(NavController);
  analytics = input<any[]>([]);

  navigateToUserList(item: AnalyticsQuestion, opt: any) {
    this.navCtrl.navigateForward(`/event/questionnaire-response/guests/${opt.option}`, { state: { questionOption: item, option: opt } });
  }

  getMax(options: any[]) {
    return Math.max(...options.map((o) => o.selected_count));
  }

  getChartData(item: any) {
    if (item.question_type === 'Rating') {
      return item.rating_scale || [];
    }

    if (item.question_type === 'SingleChoice') {
      return item.options || [];
    }

    return [];
  }

  getMaxCount(item: any): number {
    const data = this.getChartData(item);
    return Math.max(...data.map((d: any) => d.selected_count), 1);
  }

  getBarHeight(count: number, item: any): number {
    return (count / this.getMaxCount(item)) * 120; // 120px max height
  }

  getOptionPercentage(count: number, options: any[]): number {
    const total = options.reduce((sum, o) => sum + o.selected_count, 0);
    if (!total) return 0;
    return (count / total) * 100;
  }
}
