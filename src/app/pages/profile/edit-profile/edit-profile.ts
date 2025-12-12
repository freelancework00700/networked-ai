import { Button } from '@/components/form/button';
import { IUserForm } from '@/interfaces/IUserForm';
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { ModalService } from '@/services/modal.service';
import { ToasterService } from '@/services/toaster.service';
import { signal, inject, Component, ViewChild } from '@angular/core';
import { ProfileImageInput } from '@/components/form/profile-image-input';
import { UserPersonalInfo } from '@/components/common/user-personal-info';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UserAdditionalInfo } from '@/components/common/user-additional-info';
import { IonFooter, IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';

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
    UserPersonalInfo,
    ProfileImageInput,
    UserAdditionalInfo,
    ReactiveFormsModule
  ],
})
export class EditProfile {
  // services
  private fb = inject(FormBuilder);
  private navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  // signals
  isLoading = signal(false);
  isSubmitted = signal(false);
  profileForm = signal<FormGroup<IUserForm>>(this.fb.group({}));

  // view child
  @ViewChild(UserPersonalInfo) userPersonalInfo?: UserPersonalInfo;


  goBack(): void {
    this.navCtrl.back();
  }

  private async saveUserDetails(): Promise<void> {
    const payload = this.profileForm().getRawValue();
    payload.mobile = this.userPersonalInfo?.getPhoneNumber();

    await this.authService.loginWithFirebaseToken();
    await this.userService.saveUser(payload);
  }

  async save(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.isSubmitted.set(true);

      // if (!(await validateFields(this.profileForm(), this.getStep1ValidationFields()))) {
      //   this.toasterService.showError('Please fill all required fields.');
      //   return;
      // }

      await this.saveUserDetails();
      this.navCtrl.navigateRoot('/');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save profile. Please try again.';
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
}
