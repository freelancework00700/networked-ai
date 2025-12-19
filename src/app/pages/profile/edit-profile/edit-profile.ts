import { Button } from '@/components/form/button';
import { IUserForm } from '@/interfaces/IUserForm';
import { UserService } from '@/services/user.service';
import { ModalService } from '@/services/modal.service';
import { validateFields } from '@/utils/form-validation';
import { ToasterService } from '@/services/toaster.service';
import { BaseApiService } from '@/services/base-api.service';
import { ProfileImageInput } from '@/components/form/profile-image-input';
import { UserPersonalInfo } from '@/components/common/user-personal-info';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserAdditionalInfo } from '@/components/common/user-additional-info';
import { signal, inject, OnInit, effect, Component, viewChild } from '@angular/core';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { IonFooter, IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

type Tab = 'profile' | 'preferences';

@Component({
  selector: 'edit-profile',
  styleUrl: './edit-profile.scss',
  templateUrl: './edit-profile.html',
  imports: [
    Button,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonContent,
    SegmentButton,
    UserPersonalInfo,
    ProfileImageInput,
    UserAdditionalInfo,
    ReactiveFormsModule
]
})
export class EditProfile implements OnInit {
  tab = signal<Tab>('profile');

  tabItems: SegmentButtonItem[] = [
    {
      value: 'profile',
      label: 'Profile Details',
      icon: '/assets/svg/profile-details.svg',
      activeIcon: '/assets/svg/profile-details-active.svg'
    },
    {
      value: 'preferences',
      label: 'Preferences',
      icon: '/assets/svg/preferences.svg',
      activeIcon: '/assets/svg/preferences-active.svg'
    }
  ];

  // services
  private fb = inject(FormBuilder);
  private navCtrl = inject(NavController);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  // signals
  isLoading = signal(false);
  isSubmitted = signal(false);
  profileForm = signal<FormGroup<IUserForm>>(this.fb.group({}));

  // view child
  userPersonalInfo = viewChild(UserPersonalInfo);

  constructor() {
    effect(() => {
      const user = this.userService.currentUser();
      if (user) this.patchFormWithUserData();
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      this.isLoading.set(true);
      await this.userService.getCurrentUser();
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to load user data.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    this.navCtrl.back();
  }

  private async saveUserDetails(): Promise<void> {
    const formValue = this.profileForm().getRawValue();
    const payload = this.userService.formDataToUser(formValue);
    payload.mobile = this.userPersonalInfo()?.getPhoneNumber();
    await this.userService.updateCurrentUser(payload);
  }

  private patchFormWithUserData(): void {
    const user = this.userService.currentUser();
    if (!user) return;

    const formData = this.userService.userToFormData(user);
    this.profileForm().patchValue(formData);
  }

  async save(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.isSubmitted.set(true);

      const fields = ['title', 'first_name', 'last_name', 'email', 'mobile', 'username', 'dob', 'account_type', 'address'];
      if (!(await validateFields(this.profileForm(), fields))) {
        this.toasterService.showError('Please fill all required fields.');
        return;
      }

      await this.saveUserDetails();
      this.navCtrl.navigateRoot('/');
    } catch (error) {
      const message = BaseApiService.getErrorMessage(error, 'Failed to save profile. Please try again.');
      this.toasterService.showError(message);
    } finally {
      this.isLoading.set(false);
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

  onSegmentChange(value: string): void {
    this.tab.set(value as Tab);
  }
}
