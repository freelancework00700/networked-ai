import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { NavController } from '@ionic/angular/standalone';
import { Searchbar } from '@/components/common/searchbar';
import { IonContent, IonToolbar, IonHeader } from '@ionic/angular/standalone';
import { ViewResponse } from '@/pages/questionnaire-response/components/view-response';
import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AnalyticsQuestion, QuestionnaireAnalytics } from '@/pages/questionnaire-response/components/questionnaire-analytics';

@Component({
  selector: 'questionnaire-response',
  styleUrl: './questionnaire-response.scss',
  templateUrl: './questionnaire-response.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonToolbar, IonContent, IonHeader, Chip, Searchbar, Button, ViewResponse, QuestionnaireAnalytics]
})
export class QuestionnaireResponse {
  navCtrl = inject(NavController);

  user = signal<any>(null);
  isHost = signal<boolean>(true);
  searchQuery = signal<string>('');
  isDownloading = signal<boolean>(false);
  isViewResponse = signal<boolean>(false);
  filter = signal<'responses' | 'analytics'>('responses');
  segmentValue = signal<'pre-event' | 'post-event'>('pre-event');
  isResponsesMode = computed(() => this.filter() === 'responses');
  isAnalyticsMode = computed(() => this.filter() === 'analytics');
  networkSuggestions = [
    {
      id: '1',
      name: 'Kathryn Murphy',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      avatar: 'assets/images/profile.jpeg',
      submittedAt: 'Submitted 20 Jan 2025, 09:12PM',
      flag: 'pre'
    },
    {
      id: '2',
      name: 'Esther Howard',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      avatar: 'assets/images/profile.jpeg',
      submittedAt: 'Submitted 20 Jan 2025, 09:12PM',
      flag: 'pre'
    },
    {
      id: '3',
      name: 'Arlene McCoy',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      avatar: 'assets/images/profile.jpeg',
      submittedAt: 'Submitted 20 Jan 2025, 09:12PM'
    },
    {
      id: '4',
      name: 'Darlene Robertson',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      avatar: 'assets/images/profile.jpeg',
      submittedAt: 'Submitted 20 Jan 2025, 09:12PM',
      flag: 'post'
    },
    {
      id: '5',
      name: 'Ronald Richards',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      avatar: 'assets/images/profile.jpeg',
      submittedAt: 'Submitted 20 Jan 2025, 09:12PM',
      flag: 'post'
    },
    {
      id: '6',
      name: 'Albert Flores',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      avatar: 'assets/images/profile.jpeg',
      submittedAt: 'Submitted 20 Jan 2025, 09:12PM',
      flag: 'pre'
    },
    {
      id: '7',
      name: 'Eleanor Pena',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      avatar: 'assets/images/profile.jpeg',
      submittedAt: 'Submitted 20 Jan 2025, 09:12PM',
      flag: 'post'
    },
    {
      id: '8',
      name: 'Savannah Nguyen',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      avatar: 'assets/images/profile.jpeg',
      submittedAt: 'Submitted 20 Jan 2025, 09:12PM',
      flag: 'pre'
    }
  ];

  analytics = signal<AnalyticsQuestion[]>([
    {
      flag: 'pre',
      visibility: 'public',
      type: 'options',
      question: 'What do you enjoy about networking?',
      options: [
        { label: 'Making new friends', value: 102 },
        { label: 'Socializing', value: 56 },
        { label: 'Others', value: 22 }
      ]
    },

    {
      flag: 'pre',
      visibility: 'private',
      type: 'options',
      question: 'Where did you hear about the event?',
      options: [
        { label: 'LinkedIn', value: 102 },
        { label: 'Instagram', value: 56 },
        { label: 'Friends', value: 45 },
        { label: 'Website', value: 22 },
        { label: 'X', value: 5 }
      ]
    },
    {
      flag: 'pre',
      visibility: 'private',
      type: 'options',
      question: 'How many events have you attended?',
      options: [
        { label: '5+', value: 0 },
        { label: '4', value: 1 },
        { label: '3', value: 24 },
        { label: '2', value: 12 },
        { label: '1', value: 92 }
      ]
    },

    {
      flag: 'post',
      visibility: 'private',
      type: 'options',
      question: 'Would you attend a similar event again?',
      options: [
        { label: 'Yes', value: 148 },
        { label: 'Maybe', value: 27 },
        { label: 'No', value: 9 }
      ]
    },

    {
      flag: 'post',
      visibility: 'public',
      type: 'scale',
      question: 'How satisfied were you with the event overall?',
      scaleData: [
        { scale: 1, value: 3 },
        { scale: 2, value: 2 },
        { scale: 3, value: 0 },
        { scale: 4, value: 7 },
        { scale: 5, value: 7 },
        { scale: 6, value: 56 },
        { scale: 7, value: 32 },
        { scale: 8, value: 49 },
        { scale: 9, value: 25 },
        { scale: 10, value: 19 }
      ]
    },

    {
      flag: 'post',
      visibility: 'private',
      type: 'scale',
      question: 'How likely are you to attend a similar event in the future?',
      scaleData: [
        { scale: 1, value: 100 },
        { scale: 2, value: 2 },
        { scale: 3, value: 0 },
        { scale: 4, value: 7 },
        { scale: 5, value: 7 },
        { scale: 6, value: 56 },
        { scale: 7, value: 32 },
        { scale: 8, value: 49 },
        { scale: 9, value: 25 },
        { scale: 10, value: 19 }
      ]
    }
  ]);

  filteredSuggestions = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    const activeFlag = this.segmentValue() === 'pre-event' ? 'pre' : 'post';

    return this.networkSuggestions.filter((item) => {
      const matchesSegment = item.flag === activeFlag;
      const matchesSearch = !search || item.name.toLowerCase().includes(search);
      return matchesSegment && matchesSearch;
    });
  });

  filteredAnalytics = computed(() => {
    const analytics = this.analytics();

    if (!this.isHost()) {
      return analytics.filter((item) => item.visibility === 'public');
    }

    const flag = this.segmentValue() === 'pre-event' ? 'pre' : 'post';
    return analytics.filter((item) => item.flag === flag);
  });

  goBack() {
    if (this.isViewResponse()) {
      this.isViewResponse.set(false);
    } else {
      this.navCtrl.back();
    }
  }

  viewResponse(user: any) {
    this.isViewResponse.set(true);
    this.user.set(user);
  }

  downloadResponses() {
    this.isDownloading.set(true);
    setTimeout(() => {
      this.isDownloading.set(false);
    }, 2000);
  }
}
