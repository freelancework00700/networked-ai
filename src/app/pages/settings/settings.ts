import { AuthService } from '@/services/auth.service';
import { ModalService } from '@/services/modal.service';
import { StripeService } from '@/services/stripe.service';
import { ToasterService } from '@/services/toaster.service';
import { NavigationService } from '@/services/navigation.service';
import { signal, inject, Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';
import { SettingsProfileHeader } from '@/pages/settings/components/settings-profile-header';
import { SettingListItem, SettingsListItem } from '@/pages/settings/components/settings-list-item';

@Component({
  selector: 'settings',
  styleUrl: './settings.scss',
  templateUrl: './settings.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SettingsProfileHeader, SettingsListItem, IonHeader, IonToolbar, IonContent]
})
export class Settings implements OnInit {
  // services
  navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
  private stripeService = inject(StripeService);
  private toasterService = inject(ToasterService);
  private navigationService = inject(NavigationService);

  // signals
  userName = signal<string>('Sandra Tanner');
  userPoints = signal<number>(200);
  userImageUrl = signal<string>('/assets/images/profile.jpeg');
  appVersion = signal<string>('9.17.0');
  buildVersion = signal<string>('12');

  // settings sections
  accountItems = signal<SettingListItem[]>([
    {
      label: 'Account Settings',
      icon: 'pi pi-user-edit',
      route: '/settings/account'
    },
    {
      label: 'Change Password',
      icon: 'pi pi-lock',
      route: '/settings/change-account-info/password'
    },
    {
      label: 'Payment',
      icon: 'pi pi-credit-card',
      route: '/settings/payment'
    },
    {
      label: 'Payment History',
      icon: 'pi pi-history',
      route: '/settings/payment-history'
    }
  ]);

  preferencesItems = signal<SettingListItem[]>([
    {
      label: 'Notifications',
      icon: 'pi pi-bell',
      route: '/settings/notifications'
    },
    {
      label: 'Permissions',
      icon: 'pi pi-cog',
      route: '/settings/permissions'
    },
    {
      label: 'App Icon Appearance',
      icon: 'pi pi-palette',
      route: '/settings/app-icon'
    }
  ]);

  resourcesItems = signal<SettingListItem[]>([
    {
      label: 'Contact Support',
      icon: 'pi pi-comments',
      route: '/settings/contact-support'
    },
    {
      label: 'Rate in App Store',
      icon: 'pi pi-star',
      action: 'rate-app'
    },
    {
      label: 'Invite a Friend',
      icon: 'pi pi-user-plus',
      action: 'invite-friend'
    }
  ]);

  subscriptionsItems = signal<SettingListItem[]>([
    {
      label: 'My Subscriptions Plans',
      icon: 'pi pi-crown',
      action: 'subscription-plans'
    },
    {
      label: 'My Subscriptions',
      icon: 'pi pi-crown',
      route: '/subscription/list'
    }
  ]);

  aboutItems = signal<SettingListItem[]>([
    {
      label: 'App Version',
      value: this.appVersion(),
      showChevron: false
    },
    {
      label: 'Build Version',
      value: this.buildVersion(),
      showChevron: false
    },
    {
      label: 'Terms & Conditions',
      route: '/settings/terms',
      showChevron: true
    },
    {
      label: 'Privacy Policy',
      route: '/settings/privacy',
      showChevron: true
    }
  ]);

  sections = signal([
    { title: 'Account', items: this.accountItems },
    { title: 'Preferences', items: this.preferencesItems },
    { title: 'Resources', items: this.resourcesItems },
    { title: 'Subscriptions', items: this.subscriptionsItems },
    { title: 'About the App', items: this.aboutItems, useItemShowChevron: true }
  ]);

  ngOnInit(): void {}

  onItemClick(item: any): void {
    if (item.route) {
      this.navCtrl.navigateForward(item.route);
    } else if (item.action) {
      this.handleAction(item.action);
    }
  }

  async navigateToSubscriptionPlans(): Promise<void> {
    const user = this.authService.currentUser();
    if (!user?.email) {
      this.toasterService.showError('Please add your email to your profile to view subscription plans.');
      return;
    }
    if (user?.stripe_account_id && user?.stripe_account_status === 'active') {
      this.navigationService.navigateForward('/subscription/plans');
    } else {
      await this.openStripePayoutModal();
    }
  }

  async openStripePayoutModal(): Promise<void> {
    await this.modalService.openConfirmModal({
      icon: 'assets/svg/payoutIcon.svg',
      iconBgColor: '#C73838',
      title: 'Add Payout Details',
      description: 'To view subscription plans in app, you must setup your payout details with Stripe.',
      confirmButtonLabel: 'Connect Payment',
      cancelButtonLabel: 'Maybe Later',
      confirmButtonColor: 'primary',
      iconPosition: 'center',
      onConfirm: () => this.handleStripeAccountCreation()
    });
  }

  async handleStripeAccountCreation(): Promise<void> {
    try {
      const accountResponse = await this.stripeService.createStripeAccount();
      if (accountResponse?.url) {
        window.location.href = accountResponse.url;
      } else {
        this.toasterService.showError('Failed to get Stripe account URL. Please try again.');
      }
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      this.toasterService.showError('Error creating Stripe account. Please try again.');
    }
  }

  private async handleAction(action: string): Promise<void> {
    switch (action) {
      case 'rate-app':
        this.toasterService.showSuccess('Rate app feature coming soon!');
        break;
      case 'invite-friend':
        this.toasterService.showSuccess('Invite friend feature coming soon!');
        break;
      case 'subscription-plans':
        await this.navigateToSubscriptionPlans();
        break;
    }
  }

  onEditProfileClick(): void {
    this.navCtrl.navigateForward('/profile/edit');
  }

  onQrCodeClick(): void {
    this.toasterService.showSuccess('QR code feature coming soon!');
  }

  async onSignOut(): Promise<void> {
    try {
      const result = await this.modalService.openConfirmModal({
        title: 'Sign Out',
        description: 'Are you sure you want to sign out?',
        confirmButtonLabel: 'Sign Out',
        cancelButtonLabel: 'Cancel',
        confirmButtonColor: 'danger',
        iconName: 'pi-sign-out',
        iconBgColor: '#C73838',
        iconPosition: 'center'
      });

      if (result && result.role === 'confirm') {
        await this.authService.signOut();
        this.navCtrl.navigateRoot('/');
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
      this.toasterService.showError(error.message || 'Failed to sign out. Please try again.');
    }
  }
}