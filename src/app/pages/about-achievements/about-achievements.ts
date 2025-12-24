import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { IonContent, IonToolbar, IonHeader, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'about-achievements',
  styleUrl: './about-achievements.scss',
  templateUrl: './about-achievements.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, CommonModule]
})
export class AboutAchievements {
  navCtrl = inject(NavController);

  diamondData = [
    { icon: 'assets/svg/gamification/diamond-1k.svg', color: 'Green', points: '1K' },
    { icon: 'assets/svg/gamification/diamond-5k.svg', color: 'Red', points: '5K' },
    { icon: 'assets/svg/gamification/diamond-10k.svg', color: 'Blue', points: '10K' },
    { icon: 'assets/svg/gamification/diamond-20k.svg', color: 'Purple', points: '20K' },
    { icon: 'assets/svg/gamification/diamond-30k.svg', color: 'Gold', points: '30K' },
    { icon: 'assets/svg/gamification/diamond-40k.svg', color: 'Platinum', points: '40K' },
    { icon: 'assets/svg/gamification/diamond-50k.svg', color: 'Black', points: '50K' }
  ];

  diamondTiers = [
    { color: 'Green', description: 'Newcomer – Just getting started', points: '1,000 Pts' },
    { color: 'Red', description: "Contributor – You're in the mix", points: '5,000 Pts' },
    { color: 'Blue', description: 'Connector – People know your name', points: '10,000 Pts' },
    { color: 'Purple', description: 'Leader – You drive the culture', points: '20,000 Pts' },
    { color: 'Gold', description: 'Influencer – Your events shift rooms', points: '30,000 Pts' },
    { color: 'Platinum', description: 'Visionary – Everyone watches your moves', points: '40,000 Pts' },
    { color: 'Black', description: "Legacy Builder – You've shaped the Network", points: '50,000 Pts' }
  ];

  pointsActions = [
    { action: 'Host an event', points: '+50 pts' },
    { action: 'Attend an event', points: '+25 pts' },
    { action: 'Make a new connection', points: '+10 pts' },
    { action: 'Scan a QR code', points: '+5 pts' },
    { action: 'Send a message', points: '+2 pts' }
  ];

  eventHostedBadges = [
    { eventCount: 10, badge: 'Gold-Platinum', title: 'Rookie' },
    { eventCount: 25, badge: 'Red', title: 'Emerging Organizer' },
    { eventCount: 50, badge: 'Teal', title: 'Community Starter' },
    { eventCount: 100, badge: 'Purple', title: 'Event Builder' },
    { eventCount: 250, badge: 'Bronze', title: 'Connector in Action' },
    { eventCount: 500, badge: 'Gold', title: 'Community Leader' },
    { eventCount: 1000, badge: 'Light Gold', title: 'Trusted Influencer' },
    { eventCount: 2000, badge: 'Purple Grey', title: 'Elite Host' },
    { eventCount: 5000, badge: 'Silver', title: 'Master Organizer' },
    { eventCount: 10000, badge: 'Gold-Platinum', title: 'Legacy Builder' }
  ];

  categoryBadges = [
    { percentage: '10%', title: 'Getting Started' },
    { percentage: '25%', title: 'Contributor' },
    { percentage: '50%', title: 'Builder' },
    { percentage: '75%', title: 'Power Networker' },
    { percentage: '100%', title: 'Elite Leader' }
  ];
}
