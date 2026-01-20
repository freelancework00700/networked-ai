import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { Component, effect, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { IonContent, IonToolbar, IonHeader, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'questionnaire-user-list',
  styleUrl: './questionnaire-user-list.scss',
  templateUrl: './questionnaire-user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, Button]
})
export class QuestionnaireUserList {
  navCtrl = inject(NavController);
  private authService = inject(AuthService);

  question = signal<any>(null);
  option = signal<any>(null);

  private navEffect = effect(() => {
    const state = history.state;

    if (state?.questionOption) {
      this.question.set(state.questionOption);
    }
    if (state?.option) {
      this.option.set(state.option);
    }
  });

  networkSuggestions = signal([
    {
      id: '1',
      name: 'Kathryn Murphy',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: true
    },
    {
      id: '2',
      name: 'Esther Howard',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '3',
      name: 'Arlene McCoy',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: false,
      requested: true
    },
    {
      id: '4',
      name: 'Darlene Robertson',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: true
    },
    {
      id: '5',
      name: 'Ronald Richards',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '6',
      name: 'Albert Flores',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: true
    },
    {
      id: '7',
      name: 'Eleanor Pena',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      networked: false,
      requested: true
    },
    {
      id: '8',
      name: 'Savannah Nguyen',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '9',
      name: 'Guy Hawkins',
      value: 200,
      jobTitle: 'CTO',
      company: 'Cortazzo Consulting',
      networked: false
    },
    {
      id: '10',
      name: 'Cody Fisher',
      value: 200,
      jobTitle: 'CFO',
      company: 'Cortazzo Consulting',
      networked: true
    }
  ]);

  addSuggestion(id: string) {
    const user = this.networkSuggestions().find((item) => item.id === id);
    if (!user) return;

    user.requested = true;
    user.networked = false;
  }

  messageUser(id: string) {
    const currentUserId = this.authService.currentUser()?.id;
    
    if (currentUserId && id) {
      this.navCtrl.navigateForward('/chat-room', {
        state: {
          user_ids: [currentUserId, id],
          is_personal: true
        }
      });
    }
  }
}
