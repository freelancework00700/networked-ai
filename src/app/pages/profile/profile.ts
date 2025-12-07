import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { validateFields } from '@/utils/form-validation';
import { User } from '@capacitor-firebase/authentication';
import { EmailInput } from '@/components/form/email-input';
import { ImageInput } from '@/components/form/image-input';
import { ToasterService } from '@/services/toaster.service';
import { MobileInput } from '@/components/form/mobile-input';
import { SocialInput } from '@/components/form/social-input';
import { UsernameInput } from '@/components/form/username-input';
import { TextAreaInput } from '@/components/form/text-area-input';
import { IncognitoModeInput } from '@/components/form/incognito-mode-input';
import { signal, OnInit, inject, Component, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonFooter, IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

interface ProfileForm {
  // step 1 fields
  title?: FormControl<string | null>;
  email?: FormControl<string | null>;
  username?: FormControl<string | null>;
  password?: FormControl<string | null>;
  location?: FormControl<string | null>;
  latitude?: FormControl<number | null>;
  last_name?: FormControl<string | null>;
  birthdate?: FormControl<string | null>;
  longitude?: FormControl<number | null>;
  first_name?: FormControl<string | null>;
  phone_number?: FormControl<string | null>;
  account_type?: FormControl<string | null>;
  hide_location?: FormControl<boolean | null>;

  // step 2 fields
  x?: FormControl<string | null>;
  fb?: FormControl<string | null>;
  ig?: FormControl<string | null>;
  li?: FormControl<string | null>;
  sc?: FormControl<string | null>;
  web?: FormControl<string | null>;
  company?: FormControl<string | null>;
  aboutMe?: FormControl<string | null>;
  college_university?: FormControl<string | null>;

  // step 3 fields
  profile_image?: FormControl<string | null>;
}

interface State {
  user?: User;
}

interface NetworkSuggestion {
  id: string;
  name: string;
  value: number;
  company: string;
  jobTitle: string;
  profileImage?: string;
}

@Component({
  selector: 'profile',
  templateUrl: './profile.html',
  imports: [
    Button,
    NgClass,
    IonHeader,
    TextInput,
    IonFooter,
    IonToolbar,
    IonContent,
    ImageInput,
    EmailInput,
    MobileInput,
    SocialInput,
    TextAreaInput,
    UsernameInput,
    IncognitoModeInput,
    ReactiveFormsModule
  ]
})
export class Profile implements AfterViewInit {
  // services
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  // signals
  currentStep = signal<number>(1);
  step2Fields = signal<string[]>([]);
  step3Fields = signal<string[]>([]);
  isSubmitted = signal<boolean>(false);
  steps = signal<number[]>([1, 2, 3, 4]);
  selectedSuggestions = signal<Set<string>>(new Set());
  profileForm = signal<FormGroup<ProfileForm>>(this.fb.group({}));
  step1Fields = signal<string[]>(['title', 'first_name', 'last_name', 'email', 'phone_number', 'username', 'birthdate', 'account_type', 'location']);

  ngAfterViewInit(): void {
    // get state from Router navigation
    const state = this.router.currentNavigation()?.extras?.state as State;

    if (state && state.user) {
      const { email, phoneNumber, displayName, photoUrl } = state.user;

      // set profile image
      if (photoUrl) {
        this.profileForm().patchValue({ profile_image: photoUrl });
      }

      // set first and last name
      if (displayName) {
        const [first_name, last_name] = displayName.split(' ');
        this.profileForm().patchValue({ first_name, last_name });
      }

      // set email and disable it
      if (email) {
        this.profileForm().patchValue({ email }, { emitEvent: false });
        this.profileForm().get('email')?.disable({ emitEvent: false });
      }

      // set phone number and disable it
      if (phoneNumber) {
        this.profileForm().patchValue({ phone_number: phoneNumber }, { emitEvent: false });
        this.profileForm().get('phone_number')?.disable({ emitEvent: false });
      }
    }
  }

  // Network suggestions static data
  networkSuggestions: NetworkSuggestion[] = [
    {
      id: '1',
      name: 'Kathryn Murphy',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
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
      company: 'Cortazzo Consulting'
    },
    {
      id: '4',
      name: 'Darlene Robertson',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
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
      company: 'Cortazzo Consulting'
    },
    {
      id: '7',
      name: 'Eleanor Pena',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '8',
      name: 'Savannah Nguyen',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    }
  ];

  addSuggestion(id: string): void {
    const selected = new Set(this.selectedSuggestions());
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedSuggestions.set(selected);
  }

  isSelected(id: string): boolean {
    return this.selectedSuggestions().has(id);
  }

  save(): void {
    this.isSubmitted.set(true);

    if (this.currentStep() === 1) {
      if (!validateFields(this.profileForm(), this.step1Fields())) {
        this.toasterService.showError('Please fill all required fields.');
        return;
      }

      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      if (!validateFields(this.profileForm(), this.step2Fields())) {
        this.toasterService.showError('Please fill all required fields.');
        return;
      }

      this.currentStep.set(3);
    } else if (this.currentStep() === 3) {
      if (!validateFields(this.profileForm(), this.step3Fields())) {
        this.toasterService.showError('Please fill all required fields.');
        return;
      }

      this.currentStep.set(4);
    } else {
      const form = this.profileForm();
      console.log('form', form.getRawValue());
    }
  }

  goBack(): void {
    if (this.currentStep() === 1) {
      this.navCtrl.navigateBack('/');
    } else {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  async openTitleModal(): Promise<void> {
    const value = this.profileForm().get('title')?.value || 'Mr.';
    const title = await this.modalService.openTitleModal(value);
    this.profileForm().patchValue({ title });
  }

  async openDateModal(): Promise<void> {
    const value = this.profileForm().get('birthdate')?.value || '';
    const birthdate = await this.modalService.openDateTimeModal('date', value);
    this.profileForm().patchValue({ birthdate });
  }

  async openAccountTypeModal(): Promise<void> {
    const value = this.profileForm().get('account_type')?.value || 'individual';
    const account_type = await this.modalService.openAccountTypeModal(value);
    this.profileForm().patchValue({ account_type });
  }

  async openLocationModal(): Promise<void> {
    const { address, latitude, longitude } = await this.modalService.openLocationModal();
    this.profileForm().patchValue({ location: address, latitude, longitude });
  }
}
