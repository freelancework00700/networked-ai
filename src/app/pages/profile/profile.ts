import { Content } from '@/layout/content';
import { CommonModule } from '@angular/common';
import { Header } from '@/layout/header/header';
import { Footer } from '@/layout/footer/footer';
import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { DateInput } from '@/components/form/date-input';
import { TextInput } from '@/components/form/text-input';
import { EmailInput } from '@/components/form/email-input';
import { ImageInput } from '@/components/form/image-input';
import { MobileInput } from '@/components/form/mobile-input';
import { SelectInput } from '@/components/form/select-input';
import { SocialInput } from '@/components/form/social-input';
import { LocationInput } from '@/components/form/location-input';
import { UsernameInput } from '@/components/form/username-input';
import { signal, inject, Component, OnInit } from '@angular/core';
import { TextAreaInput } from '@/components/form/text-area-input';
import { IncognitoModeInput } from '@/components/form/incognito-mode-input';
import { SelectOption } from '@/components/form/select-input/select-modal';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

interface ProfileForm {
  // Step 1 fields
  title?: FormControl<string | null>;
  first_name?: FormControl<string | null>;
  last_name?: FormControl<string | null>;
  phone_number?: FormControl<string | null>;
  email?: FormControl<string | null>;
  password?: FormControl<string | null>;
  username?: FormControl<string | null>;
  birthdate?: FormControl<string | null>;
  account_type?: FormControl<string | null>;
  location?: FormControl<string | null>;
  incognito_mode?: FormControl<boolean | null>;
  // Step 2 fields
  college_university?: FormControl<string | null>;
  company?: FormControl<string | null>;
  aboutMe?: FormControl<string | null>;
  // Step 3 fields
  profile_image?: FormControl<string | null>;
  preference1?: FormControl<string | null>;
  preference2?: FormControl<string | null>;
}

interface NetworkSuggestion {
  id: string;
  name: string;
  profileImage?: string;
  value: number;
  jobTitle: string;
  company: string;
}

@Component({
  selector: 'profile',
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
  imports: [
    Header,
    Button,
    Footer,
    Content,
    DateInput,
    EmailInput,
    TextInput,
    MobileInput,
    SocialInput,
    ImageInput,
    SelectInput,
    CommonModule,
    LocationInput,
    TextAreaInput,
    UsernameInput,
    IncognitoModeInput,
    ReactiveFormsModule
  ]
})
export class Profile implements OnInit {
  // services
  fb = inject(FormBuilder);
  authService = inject(AuthService);

  // signals
  usernameVerified = signal<boolean>(false);
  profileForm = signal<FormGroup<ProfileForm>>(this.fb.group({}));

  ngOnInit(): void {
    // Initialize incognito_mode control with default value false
    const form = this.profileForm();
    if (!form.get('incognito_mode')) {
      form.addControl('incognito_mode', this.fb.control(false));
    }
  }

  titleOptions: SelectOption[] = [
    { value: 'Mr.', label: 'Mr.' },
    { value: 'Mrs.', label: 'Mrs.' },
    { value: 'Ms.', label: 'Ms.' }
  ];

  accountTypeOptions: SelectOption[] = [
    { value: 'individual', label: 'Individual' },
    { value: 'business', label: 'Business' }
  ];

  steps = signal<number[]>([1, 2, 3, 4]);
  currentStep = signal<number>(1);
  selectedSuggestions = signal<Set<string>>(new Set());

  step1Fields = ['title', 'first_name', 'last_name', 'email', 'phone_number', 'username', 'birthdate', 'account_type', 'location'];
  step2Fields: string[] = [];
  step3Fields: string[] = []; // Profile image is optional

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

  private validateFields(fieldNames: string[]): boolean {
    const form = this.profileForm();
    console.log('form', form.getRawValue());
    const isValid = fieldNames.every((field) => {
      const control = form.get(field);
      if (!control) return false;

      if (control.disabled && control.value) {
        return true;
      }

      return control.valid;
    });

    if (!isValid) {
      fieldNames.forEach((field) => {
        const control = form.get(field);
        if (control && !control.disabled) {
          control.markAsTouched();
          control.updateValueAndValidity();
        }
      });
    }

    return isValid;
  }

  nextStep(): void {
    if (this.currentStep() === 1) {
      // Validate step 1 fields
      if (!this.validateFields(this.step1Fields)) {
        return;
      }

      if (!this.usernameVerified()) {
        const usernameControl = this.profileForm().get('username');
        if (usernameControl) {
          usernameControl.markAsTouched();
          usernameControl.updateValueAndValidity();
        }
        return;
      }

      this.currentStep.set(2);
    } else if (this.currentStep() === 2) {
      if (!this.validateFields(this.step2Fields)) {
        return;
      }
      this.currentStep.set(3);
    } else if (this.currentStep() === 3) {
      if (!this.validateFields(this.step3Fields)) {
        return;
      }
      this.currentStep.set(4);
    }
  }

  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  async update(): Promise<void> {
    // Validate all steps in order
    const allFields = [...this.step1Fields, ...this.step3Fields];
    const allFieldsValid = this.validateFields(allFields);

    if (!allFieldsValid) {
      // Go back to first invalid step in sequence
      if (!this.validateFields(this.step1Fields)) {
        this.currentStep.set(1);
      } else if (!this.validateFields(this.step2Fields)) {
        this.currentStep.set(2);
      } else if (!this.validateFields(this.step3Fields)) {
        this.currentStep.set(3);
      }
      return;
    }

    // All validations passed - submit form
    const form = this.profileForm();
    console.log('form', form.getRawValue());
    const result = await this.authService.signInWithEmailAndPassword('ravi.disolutions@gmail.com', 'Test@123');
    console.log('result', result);
  }
}
