import { inject, Injectable } from '@angular/core';
import { MenuItem } from '@/components/modal/menu-modal';
import { MenuModal } from '@/components/modal/menu-modal';
import { ModalController } from '@ionic/angular/standalone';
import { TitleModal } from '@/components/modal/title-modal';
import { LoadingModal } from '@/components/modal/loading-modal';
import { CreateEvent } from '@/pages/create-event/create-event';
import { ConfirmModal } from '@/components/modal/confirm-modal';
import { LocationModal } from '@/components/modal/location-modal';
import { DateTimeModal } from '@/components/modal/date-time-modal';
import { UserDetail } from '@/pages/network/components/user-detail';
import { VerifyOtpModal } from '@/components/modal/verify-otp-modal';
import { PostEventModal } from '@/components/modal/post-event-modal';
import { ShareGroup } from '@/pages/messages/components/share-group';
import { GifGalleryModal } from '@/components/modal/gif-gallery-modal';
import { BlockModal } from '@/components/modal/block-modal/block-modal';
import { ShareModal } from '@/components/modal/share-modal/share-modal';
import { AccountTypeModal } from '@/components/modal/account-type-modal';
import { EventFilterModal } from '@/components/modal/event-filter-modal';
import { GuestFilterModal } from '@/components/modal/guest-filter-modal';
import { ReportModal } from '@/components/modal/report-modal/report-modal';
import { ImageGalleryModal } from '@/components/modal/image-gallery-modal';
import { CitySelectionModal } from '@/components/modal/city-selection-modal';
import { EventCategoryModal } from '@/components/modal/event-category-modal';
import { PasswordSavedModal } from '@/components/modal/password-saved-modal';
import { GroupInvitation } from '@/pages/messages/components/group-invitation';
import { LocationFilterModal } from '@/components/modal/location-filter-modal';
import { AIPromptModal } from '@/pages/create-event/components/ai-prompt-modal';
import { TicketTypeModal } from '@/pages/create-event/components/ticket-type-modal';
import { AchievementDetailModal } from '@/components/modal/achievement-detail-modal';
import { QuestionnaireForm } from '@/pages/create-event/components/questionnaire-form';
import { PhoneEmailVerifiedModal } from '@/components/modal/phone-email-verified-modal';
import { TicketForm, TicketFormData } from '@/pages/create-event/components/ticket-form';
import { ManageRoleModal } from '@/components/modal/manage-role-modal/manage-role-modal';
import { NetworkTagModal, NetworkTag } from '@/pages/create-event/components/network-tag';
import { ProfileImageConfirmModal } from '@/components/modal/profile-image-confirm-modal';
import { ImagePreviewModal } from '@/components/modal/image-preview-modal/image-preview-modal';
import { PromoCodeForm, PromoCodeFormData } from '@/pages/create-event/components/promo-code-form';

@Injectable({ providedIn: 'root' })
export class ModalService {
  // services
  private modalCtrl = inject(ModalController);

  async openLoadingModal(message: string): Promise<void> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      component: LoadingModal,
      componentProps: { message },
      cssClass: 'auto-hight-modal'
    });

    await modal.present();
  }

  async openPhoneEmailVerifiedModal(type: 'email' | 'mobile'): Promise<boolean> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      componentProps: { type },
      cssClass: 'auto-hight-modal',
      component: PhoneEmailVerifiedModal
    });

    await modal.present();

    await modal.onDidDismiss();
    return true;
  }

  async openPasswordSavedModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      cssClass: 'auto-hight-modal',
      component: PasswordSavedModal
    });

    await modal.present();
  }

  async openTitleModal(value: string): Promise<string> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: TitleModal,
      backdropDismiss: true,
      componentProps: { value },
      cssClass: 'auto-hight-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    // return original value if dismissed via backdrop without data
    return data || value;
  }

  async openDateTimeModal(type: 'date' | 'time', value?: string, min?: string, max?: string): Promise<string> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: true,
      component: DateTimeModal,
      cssClass: 'auto-hight-modal',
      componentProps: { type, value, min, max }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    // return original value if dismissed via backdrop without data
    return data || value;
  }

  async openAccountTypeModal(value: 'Individual' | 'Business'): Promise<'Individual' | 'Business'> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: true,
      componentProps: { value },
      component: AccountTypeModal,
      cssClass: 'auto-hight-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    // return original value if dismissed via backdrop without data
    return data || value;
  }

  async openLocationModal(location = ''): Promise<{ address: string; latitude: string; longitude: string }> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: true,
      component: LocationModal,
      componentProps: { location },
      cssClass: 'modal-80-percent-height'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    // return original value if dismissed via backdrop without data
    return data || { address: location || '', latitude: '', longitude: '' };
  }

  async openEventCategoryModal(value?: string): Promise<string> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      cssClass: 'auto-hight-modal',
      component: EventCategoryModal,
      componentProps: { value }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data;
  }

  async openNetworkTagModal(tags: NetworkTag[], initialSelectedTags: string[]): Promise<string[] | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: NetworkTagModal,
      backdropDismiss: true,
      cssClass: 'auto-hight-modal',
      componentProps: {
        title: 'Networked Meta Tags',
        subtitle: 'Select up to 5',
        tags,
        initialSelectedTags,
        maxSelections: 5
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    return data && Array.isArray(data) ? data : null;
  }

  async openAIPromptModal(conversation: any[], isEvent?: boolean): Promise<any> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'modal-600px-height',
      component: AIPromptModal,
      componentProps: {
        conversation,
        isEvent
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openTicketModal(
    ticketType: 'free' | 'paid' | 'early-bird' | 'sponsor' | 'standard',
    initialData?: Partial<TicketFormData>,
    eventDate?: string | null,
    eventStartTime?: string | null
  ): Promise<{ data: TicketFormData; role: string } | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: TicketForm,
      cssClass: 'modal-600px-height',
      backdropDismiss: false,
      componentProps: {
        ticketType,
        initialData,
        eventDate,
        eventStartTime
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    return data && role === 'save' ? { data, role } : null;
  }

  async openTicketTypeModal(): Promise<'standard' | 'early-bird' | 'sponsor' | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: TicketTypeModal,
      cssClass: 'auto-hight-modal',
      backdropDismiss: true
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    return role === 'select' && data ? (data as 'standard' | 'early-bird' | 'sponsor') : null;
  }

  async openPromoCodeModal(initialData?: Partial<PromoCodeFormData>): Promise<{ data: PromoCodeFormData; role: string } | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: PromoCodeForm,
      cssClass: 'modal-600px-height',
      backdropDismiss: false,
      componentProps: {
        initialData
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    return data && role === 'save' ? { data, role } : null;
  }

  async openConfirmModal(config: {
    icon?: string;
    title: string;
    iconName?: string;
    description: string;
    iconBgColor?: string;
    confirmButtonLabel: string;
    cancelButtonLabel?: string;
    confirmButtonColor?: string;
    iconPosition?: 'left' | 'center';
    customColor?: string;
  }): Promise<{ data: any; role: string } | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: ConfirmModal,
      backdropDismiss: true,
      cssClass: 'auto-hight-modal',
      componentProps: config
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    return { data, role: role || '' };
  }

  async openRepeatingEventModal(eventData: any): Promise<{ data: any; role: string } | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: CreateEvent,
      cssClass: 'modal-80-percent-height',
      backdropDismiss: false,
      componentProps: {
        isModalMode: true,
        eventData: eventData
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    return data && role === 'save' ? { data, role } : null;
  }

  async openQuestionnaireModal(type: 'pre_event' | 'post_event', initialData?: any): Promise<any> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: QuestionnaireForm,
      componentProps: {
        type,
        initialData
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openOtpModal(email: string, mobile: string): Promise<boolean> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: false,
      component: VerifyOtpModal,
      cssClass: 'auto-hight-modal',
      componentProps: { email, mobile }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data;
  }

  async showProfileImageConfirmationModal(file: File): Promise<{ action: 'confirm' | 'retake' | 'cancel'; file?: File }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const imageDataUrl = e.target.result;

        const modal = await this.modalCtrl.create({
          mode: 'ios',
          handle: true,
          breakpoints: [0, 1],
          initialBreakpoint: 1,
          backdropDismiss: false,
          cssClass: 'auto-hight-modal',
          componentProps: { imageDataUrl },
          component: ProfileImageConfirmModal
        });

        await modal.present();

        const { data } = await modal.onWillDismiss();

        if (data && data.action === 'confirm') {
          resolve({ action: 'confirm', file });
        } else if (data && data.action === 'retake') {
          resolve({ action: 'retake' });
        } else {
          resolve({ action: 'cancel' });
        }
      };
      reader.readAsDataURL(file);
    });
  }

  async openImageGalleryModal(title = 'Select Image', multiSelect = true): Promise<string | string[] | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: true,
      component: ImageGalleryModal,
      cssClass: 'modal-80-percent-height',
      componentProps: { title, multiSelect }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data;
  }

  async openGifGalleryModal(title = 'Select GIF', multiSelect = true): Promise<string | string[] | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: true,
      component: GifGalleryModal,
      cssClass: 'modal-80-percent-height',
      componentProps: { title, multiSelect }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data;
  }

  async openMenuModal(items: MenuItem[]): Promise<{ role: string; data?: MenuItem } | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: MenuModal,
      cssClass: 'auto-hight-modal',
      componentProps: {
        items
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    return data ?? null;
  }

  async openShareGroupModal(data: any): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: ShareGroup,
      cssClass: 'auto-hight-modal',
      componentProps: {
        data: data
      }
    });
    await modal.present();
    const { data: shareGroupData } = await modal.onWillDismiss();
    return shareGroupData;
  }

  async openGroupInvitationModal(groupId: string): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: GroupInvitation,
      backdropDismiss: false,
      cssClass: 'auto-hight-modal'
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openLocationFilterModal(): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'auto-hight-modal',
      component: LocationFilterModal
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openUserDetailModal(user: any): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'auto-hight-modal',
      component: UserDetail,
      componentProps: { user }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openManageRoleModal(users: any[], eventId: string): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: ManageRoleModal,
      cssClass: 'auto-hight-modal',
      componentProps: { users, eventId }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openGuestFilterModal(filter: any): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: GuestFilterModal,
      cssClass: 'auto-hight-modal',
      componentProps: { filter }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openShareModal(eventId: any, type: 'Event' | 'Post'): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: ShareModal,
      cssClass: 'auto-hight-modal',
      componentProps: { eventId, type }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openPostEventModal(): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: PostEventModal
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openImagePreviewModal(url: string): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      component: ImagePreviewModal,
      componentProps: { url }
    });
    await modal.present();
  }

  async openReportModal(): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: ReportModal,
      cssClass: 'auto-hight-modal'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openBlockModal(): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: BlockModal,
      cssClass: 'auto-hight-modal'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openAchievementDetailModal(achievement: any): Promise<any | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      component: AchievementDetailModal,
      cssClass: 'auto-hight-modal',
      componentProps: {
        achievement
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async openEventFilterModal(initialValues?: {
    location?: string;
    eventDate?: string;
    distance?: number;
  }): Promise<{ location?: string; eventDate?: string; distance?: number } | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      cssClass: 'auto-hight-modal',
      component: EventFilterModal,
      componentProps: { initialValues }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data || null;
  }

  async openCitySelectionModal(): Promise<{ city: string; state: string; fullName: string } | null> {
    const modal = await this.modalCtrl.create({
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: true,
      component: CitySelectionModal,
      cssClass: 'modal-80-percent-height'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    return data || null;
  }

  async close(data?: any, role?: string): Promise<void> {
    const modal = await this.modalCtrl.getTop();
    if (modal) await modal.dismiss(data, role);
  }
}
