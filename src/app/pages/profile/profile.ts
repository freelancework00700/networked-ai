import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { Button } from '@/components/form/button';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { validateFields } from '@/utils/form-validation';
import { EmailInput } from '@/components/form/email-input';
import { ToasterService } from '@/services/toaster.service';
import { MobileInput } from '@/components/form/mobile-input';
import { SocialInput } from '@/components/form/social-input';
import { FirebaseService } from '@/services/firebase.service';
import { PasswordInput } from '@/components/form/password-input';
import { UsernameInput } from '@/components/form/username-input';
import { TextAreaInput } from '@/components/form/text-area-input';
import { ProfileImageInput } from '@/components/form/profile-image-input';
import { IncognitoModeInput } from '@/components/form/incognito-mode-input';
import { User, FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { signal, inject, Component, AfterViewInit, ViewChild } from '@angular/core';
import { IonFooter, IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';
import { FormGroup, FormBuilder, FormControl, AbstractControl, ReactiveFormsModule } from '@angular/forms';

const PROFILE_STEPS = {
  PERSONAL_INFO: 1,
  ADDITIONAL_INFO: 2,
  PROFILE_IMAGE: 3,
  NETWORK_SUGGESTIONS: 4
};

interface ProfileForm {
  // step 1 fields
  dob?: FormControl<string | null>;
  title?: FormControl<string | null>;
  email?: FormControl<string | null>;
  mobile?: FormControl<string | null>;
  address?: FormControl<string | null>;
  username?: FormControl<string | null>;
  password?: FormControl<string | null>;
  latitude?: FormControl<number | null>;
  last_name?: FormControl<string | null>;
  longitude?: FormControl<number | null>;
  first_name?: FormControl<string | null>;
  account_type?: FormControl<'Individual' | 'Business'>;

  settings?: AbstractControl<{
    hide_location?: FormControl<boolean | null>;
  }>;

  // step 2 fields
  socials?: AbstractControl<{
    website?: FormControl<string | null>;
    twitter?: FormControl<string | null>;
    facebook?: FormControl<string | null>;
    linkedin?: FormControl<string | null>;
    snapchat?: FormControl<string | null>;
    instagram?: FormControl<string | null>;
  }>;
  company_name?: FormControl<string | null>;
  description?: FormControl<string | null>;
  college_university_name?: FormControl<string | null>;

  // step 3 fields
  image_url?: FormControl<string | null>;
  thumbnail_url?: FormControl<string | null>;
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
    EmailInput,
    MobileInput,
    SocialInput,
    TextAreaInput,
    PasswordInput,
    UsernameInput,
    ProfileImageInput,
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
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);
  private firebaseService = inject(FirebaseService);

  // signals
  currentStep = signal<number>(PROFILE_STEPS.PERSONAL_INFO);
  steps = signal([1, 2, 3, 4]);

  emailLinked = signal(false);
  phoneLinked = signal(false);
  needsEmailLink = signal(false);
  needsPhoneLink = signal(false);

  isLoading = signal(false);
  isSubmitted = signal(false);
  showPasswordInput = signal(false);
  selectedSuggestions = signal<Set<string>>(new Set());
  profileForm = signal<FormGroup<ProfileForm>>(this.fb.group({}));

  // view child
  @ViewChild(MobileInput) mobileInput?: MobileInput;

  // variables
  readonly networkSuggestions: NetworkSuggestion[] = [
    { id: '1', name: 'Kathryn Murphy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '2', name: 'Esther Howard', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '3', name: 'Arlene McCoy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '4', name: 'Darlene Robertson', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '5', name: 'Ronald Richards', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '6', name: 'Albert Flores', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '7', name: 'Eleanor Pena', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '8', name: 'Savannah Nguyen', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' }
  ];

  async ngAfterViewInit(): Promise<void> {
    const state = this.router.currentNavigation()?.extras?.state as State;
    await this.initializeUserLinkStatus();

    if (state?.user) {
      this.initializeSocialLoginUser(state.user);
    } else {
      this.showPasswordInput.set(true);
    }
  }

  private async initializeUserLinkStatus(): Promise<void> {
    const { user: currentUser } = await FirebaseAuthentication.getCurrentUser();
    if (!currentUser) return;

    const { email, phoneNumber } = currentUser;

    if (email) {
      this.emailLinked.set(true);
      setTimeout(() => this.disableFieldIfLinked('email', email), 0);
    }

    if (phoneNumber) {
      this.phoneLinked.set(true);
      setTimeout(() => this.disableFieldIfLinked('mobile', phoneNumber), 0);
    }
  }

  private initializeSocialLoginUser(user: User): void {
    const { email, phoneNumber, displayName, photoUrl } = user;
    const hasEmail = !!email;
    const hasPhone = !!phoneNumber;

    if (photoUrl) {
      this.profileForm().patchValue({ image_url: photoUrl });
    }

    if (displayName) {
      const [first_name, last_name] = displayName.split(' ');
      this.profileForm().patchValue({ first_name, last_name });
    }

    if (hasEmail && !hasPhone && !this.phoneLinked()) {
      this.needsPhoneLink.set(true);
      this.setFormField(email, 'email', true);
    } else if (hasPhone && !hasEmail && !this.emailLinked()) {
      this.needsEmailLink.set(true);
      this.setFormField(phoneNumber, 'mobile', true);
    } else {
      if (email) this.setFormField(email, 'email', true);
      if (phoneNumber) this.setFormField(phoneNumber, 'mobile', true);
    }
  }

  private setFormField(value: string, fieldName: string, disable = false): void {
    this.profileForm().patchValue({ [fieldName]: value }, { emitEvent: false });
    if (disable) {
      const control = this.profileForm().get(fieldName);
      if (control && !control.disabled) {
        control.disable({ emitEvent: false });
      }
    }
  }

  private disableFieldIfLinked(fieldName: 'email' | 'mobile', value?: string): void {
    const control = this.profileForm().get(fieldName);
    if (control && !control.disabled) {
      if (value) {
        this.profileForm().patchValue({ [fieldName]: value }, { emitEvent: false });
      }
      control.disable({ emitEvent: false });
    }
  }

  private getStep1ValidationFields(): string[] {
    const fields = ['title', 'first_name', 'last_name', 'email', 'mobile', 'username', 'dob', 'account_type', 'address'];

    // add password for signup scenario
    if (this.showPasswordInput()) {
      fields.push('password');
    }

    // remove email if already linked or being linked
    if (this.needsPhoneLink() || this.phoneLinked()) {
      const emailIndex = fields.indexOf('email');
      if (emailIndex > -1) fields.splice(emailIndex, 1);
    }

    // remove mobile if already linked or being linked
    if (this.needsEmailLink() || this.emailLinked()) {
      const mobileIndex = fields.indexOf('mobile');
      if (mobileIndex > -1) fields.splice(mobileIndex, 1);
    }

    return fields;
  }

  private async handleAccountLinking(): Promise<void> {
    if (this.showPasswordInput()) {
      await this.handleSignupAccountLinking();
    }

    if (this.needsPhoneLink() && !this.phoneLinked()) {
      await this.linkPhoneNumber();
      return;
    }

    if (this.needsEmailLink() && !this.emailLinked()) {
      await this.linkEmailAddress();
    }
  }

  private async handleSignupAccountLinking(): Promise<void> {
    const mobile = this.mobileInput?.getPhoneNumber();
    const { email, password } = this.profileForm().getRawValue();

    await this.checkUserLinkStatus();

    if (!this.phoneLinked() && !this.emailLinked()) {
      await this.authService.createUserWithEmailAndPassword(email!, password!);
      this.emailLinked.set(true);
      this.disableFieldIfLinked('email', email!);
    }

    if (mobile && !this.phoneLinked()) {
      await this.linkPhoneNumber(mobile);
    }
  }

  private async linkPhoneNumber(mobile?: string): Promise<void> {
    const phoneNumber = mobile || this.mobileInput?.getPhoneNumber();
    if (!phoneNumber) return;

    await this.authService.sendOtpForPhoneLink(phoneNumber);
    const isPhoneLinked = await this.modalService.openOtpModal(phoneNumber, 'mobile');
    if (!isPhoneLinked) return;

    await this.checkUserLinkStatus();
  }

  private async linkEmailAddress(): Promise<void> {
    const { email } = this.profileForm().getRawValue();
    if (!email) return;

    await this.authService.linkEmailToAccount(email);
    this.emailLinked.set(true);
    this.disableFieldIfLinked('email', email);
  }

  private async checkUserLinkStatus(): Promise<void> {
    try {
      const { user } = await FirebaseAuthentication.getCurrentUser();
      if (!user) return;

      if (user.phoneNumber) {
        this.phoneLinked.set(true);
        this.needsPhoneLink.set(false);
        const mobileValue = this.profileForm().get('mobile')?.value || this.mobileInput?.getPhoneNumber();
        if (mobileValue) {
          this.disableFieldIfLinked('mobile', mobileValue);
        }
      }

      if (user.email) {
        this.emailLinked.set(true);
        this.needsEmailLink.set(false);
        const emailValue = this.profileForm().get('email')?.value || user.email;
        if (emailValue) {
          this.disableFieldIfLinked('email', emailValue);
        }
      }
    } catch (error) {
      console.error('Error checking user link status:', error);
    }
  }

  private async handleImageUploads(): Promise<void> {
    try {
      const { image_url } = this.profileForm().getRawValue();
      if (!image_url) return;

      const timestamp = Date.now();
      const profileImageUrl = await this.uploadProfileImage(image_url, timestamp);

      if (profileImageUrl) {
        const thumbnailUrl = await this.uploadThumbnail(image_url, profileImageUrl, timestamp);
        if (thumbnailUrl) {
          this.profileForm().patchValue({ thumbnail_url: thumbnailUrl });
        }
      }
    } catch (error: any) {
      const message = error.message || 'Failed to upload images. Please try again.';
      console.error('Error uploading images:', error);
      throw new Error(message);
    }
  }

  private async uploadProfileImage(imageUrl: string | File, timestamp: number): Promise<string | null> {
    if (imageUrl instanceof File) {
      const url = await this.firebaseService.uploadProfileImage(imageUrl, false, timestamp);
      this.profileForm().patchValue({ image_url: url });
      return url;
    }

    if (typeof imageUrl === 'string' && imageUrl.trim()) {
      return imageUrl;
    }

    return null;
  }

  private async uploadThumbnail(imageUrl: string | File, profileImageUrl: string, timestamp: number): Promise<string | null> {
    const thumbnailFile = await this.firebaseService.createThumbnail(imageUrl instanceof File ? imageUrl : profileImageUrl);
    return await this.firebaseService.uploadProfileImage(thumbnailFile, true, timestamp);
  }

  private async submitProfile(): Promise<void> {
    const payload = this.profileForm().getRawValue();
    payload.mobile = this.mobileInput?.getPhoneNumber();

    await this.authService.loginWithFirebaseToken();
    await this.userService.updateUser(payload);
  }

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

  async save(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.isSubmitted.set(true);

      if (this.currentStep() === PROFILE_STEPS.PERSONAL_INFO) {
        if (!(await validateFields(this.profileForm(), this.getStep1ValidationFields()))) {
          this.toasterService.showError('Please fill all required fields.');
          return;
        }
        await this.handleAccountLinking();
        this.currentStep.set(PROFILE_STEPS.ADDITIONAL_INFO);
      } else if (this.currentStep() === PROFILE_STEPS.ADDITIONAL_INFO) {
        this.currentStep.set(PROFILE_STEPS.PROFILE_IMAGE);
      } else if (this.currentStep() === PROFILE_STEPS.PROFILE_IMAGE) {
        await this.handleImageUploads();
        this.currentStep.set(PROFILE_STEPS.NETWORK_SUGGESTIONS);
      } else {
        await this.submitProfile();
        this.navCtrl.navigateRoot('/');
      }
    } catch (error: any) {
      const message = error?.message || 'Failed to save profile. Please try again.';
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    if (this.currentStep() === PROFILE_STEPS.PERSONAL_INFO) {
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
    const value = this.profileForm().get('dob')?.value || '';
    const dob = await this.modalService.openDateTimeModal('date', value);
    this.profileForm().patchValue({ dob });
  }

  async openAccountTypeModal(): Promise<void> {
    const value = this.profileForm().get('account_type')?.value || 'Individual';
    const account_type = await this.modalService.openAccountTypeModal(value as 'Individual' | 'Business');
    this.profileForm().patchValue({ account_type });
  }

  async openLocationModal(): Promise<void> {
    const currentAddress = this.profileForm().get('address')?.value || '';
    const { address, latitude, longitude } = await this.modalService.openLocationModal(currentAddress);
    this.profileForm().patchValue({ address, latitude, longitude });
  }
}
