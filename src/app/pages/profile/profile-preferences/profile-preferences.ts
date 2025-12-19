import { VibeItem } from '@/interfaces/IUser';
import { Button } from '@/components/form/button';
import { UserService } from '@/services/user.service';
import { ToasterService } from '@/services/toaster.service';
import { BaseApiService } from '@/services/base-api.service';
import { OnInit, signal, inject, computed, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonFooter, IonHeader, IonSpinner, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

export type PreferenceType = 'vibe' | 'hobby' | 'interest' | 'all';

@Component({
  selector: 'profile-preferences',
  styleUrl: './profile-preferences.scss',
  templateUrl: './profile-preferences.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonHeader, IonFooter, IonToolbar, IonContent, IonSpinner]
})
export class ProfilePreferences implements OnInit {
  // signals
  maxSelections = 3;
  isLoading = signal(false);
  currentStep = signal<number>(1);
  type = signal<PreferenceType>('all');

  vibes = signal<VibeItem[]>([]);
  hobbies = signal<VibeItem[]>([]);
  interests = signal<VibeItem[]>([]);
  selectedVibes = signal<Set<string>>(new Set());
  selectedHobbies = signal<Set<string>>(new Set());
  selectedInterests = signal<Set<string>>(new Set());

  // services
  private navCtrl = inject(NavController);
  private userService = inject(UserService);
  private toasterService = inject(ToasterService);

  steps = [
    {
      type: 'vibe' as PreferenceType,
      title: "What's your vibe?",
      description: 'Choose up to 3 vibes that best describe your world. These help us tailor your feed and connections.'
    },
    {
      type: 'interest' as PreferenceType,
      title: 'Who to connect?',
      description: 'Select up to 3 types of people you want to meet through the app - from colleagues to hobby buddies.'
    },
    {
      type: 'hobby' as PreferenceType,
      title: 'What gets you fired up?',
      description: 'Pick your top 3 hobbies and interests to shape the content you see and the events you get invited to.'
    }
  ];

  currentStepData = computed(() => {
    const step = this.steps[this.currentStep() - 1];
    return step || this.steps[0];
  });

  currentItems = computed(() => {
    const stepType = this.currentStepData().type;
    if (stepType === 'vibe') return this.vibes();
    if (stepType === 'interest') return this.interests();
    if (stepType === 'hobby') return this.hobbies();
    return [];
  });

  hasNoData = computed(() => {
    return !this.isLoading() && this.currentItems().length === 0;
  });

  currentSelected = computed(() => {
    const stepType = this.currentStepData().type;
    if (stepType === 'vibe') return this.selectedVibes();
    if (stepType === 'interest') return this.selectedInterests();
    if (stepType === 'hobby') return this.selectedHobbies();

    return new Set<string>();
  });

  isMultiStep = computed(() => this.type() === 'all');

  totalSteps = computed(() => (this.isMultiStep() ? 3 : 1));

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.isLoading.set(true);
    try {
      const preferenceType = this.type();
      if (preferenceType === 'all' || preferenceType === 'vibe') {
        const vibesData = await this.userService.getVibes();
        this.vibes.set(vibesData || []);
      }

      if (preferenceType === 'all' || preferenceType === 'interest') {
        const interestsData = await this.userService.getInterests();
        this.interests.set(interestsData || []);
      }

      if (preferenceType === 'all' || preferenceType === 'hobby') {
        const hobbiesData = await this.userService.getHobbies();
        this.hobbies.set(hobbiesData || []);
      }
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to load preferences.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  isSelected(itemId: string): boolean {
    return this.currentSelected().has(itemId);
  }

  canSelectMore(): boolean {
    return this.currentSelected().size < this.maxSelections;
  }

  toggleItem(itemId: string): void {
    const stepType = this.currentStepData().type;
    let selected: Set<string>;

    if (stepType === 'vibe') {
      selected = new Set(this.selectedVibes());
    } else if (stepType === 'interest') {
      selected = new Set(this.selectedInterests());
    } else {
      selected = new Set(this.selectedHobbies());
    }

    if (selected.has(itemId)) {
      selected.delete(itemId);
    } else {
      if (selected.size < this.maxSelections) {
        selected.add(itemId);
      }
    }

    if (stepType === 'vibe') {
      this.selectedVibes.set(selected);
    } else if (stepType === 'interest') {
      this.selectedInterests.set(selected);
    } else {
      this.selectedHobbies.set(selected);
    }
  }

  skip(): void {
    this.navCtrl.back();
  }

  goBack(): void {
    if (this.isMultiStep() && this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    } else {
      this.navCtrl.back();
    }
  }

  async next(): Promise<void> {
    if (this.isMultiStep()) {
      // Multi-step flow: move to next step or finish
      if (this.currentStep() < this.totalSteps()) {
        this.currentStep.set(this.currentStep() + 1);
      } else {
        // Last step - save all preferences
        await this.savePreferences();
      }
    } else {
      // Single type selection - save and go back
      await this.savePreferences();
    }
  }

  async savePreferences(): Promise<void> {
    this.isLoading.set(true);
    try {
      // TODO: Implement API call to save preferences
      // const payload = {
      //   vibes: Array.from(this.selectedVibes()),
      //   interests: Array.from(this.selectedInterests()),
      //   hobbies: Array.from(this.selectedHobbies())
      // };
      // await this.userService.savePreferences(payload);

      this.navCtrl.back();
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to save preferences.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
