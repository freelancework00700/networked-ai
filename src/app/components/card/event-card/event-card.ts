import { ModalService } from '@/services/modal.service';
import { MenuItem } from '@/components/modal/menu-modal';
import { NavController } from '@ionic/angular/standalone';
import { input, Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ToasterService } from '@/services/toaster.service';

export interface IEvent {
  date: string;
  day?: string;
  views: string;
  title: string;
  image: string;
  location: string;
  dayOfWeek?: string;
  organization: string;
}

@Component({
  selector: 'event-card',
  styleUrl: './event-card.scss',
  templateUrl: './event-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCard {
  navCtrl = inject(NavController);
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  event = input.required<IEvent>();
  variant = input<'default' | 'compact'>('default');

  menuItems: MenuItem[] = [
    { label: 'Edit', icon: 'assets/svg/manage-event/edit.svg', iconType: 'svg', action: 'editEvent' },
    { label: 'Analytics', icon: 'assets/svg/manage-event/analytics.svg', iconType: 'svg', action: 'viewEventAnalytics' },
    { label: 'Questionnaire Responses', icon: 'assets/svg/manage-event/questionnaire.svg', iconType: 'svg', action: 'viewQuestionnaireResponses' },
    { label: 'Manage Roles', icon: 'assets/svg/manage-event/settings.svg', iconType: 'svg', action: 'manageRoles' },
    { label: 'Guest List', icon: 'assets/svg/manage-event/users.svg', iconType: 'svg', action: 'viewGuestList' },
    { label: 'Event Page QR', icon: 'assets/svg/scanner.svg', iconType: 'svg', action: 'viewEventPageQr' },
    { label: 'Tap to pay', icon: 'assets/svg/manage-event/tap-to-pay.svg', iconType: 'svg', action: 'viewTapToPay' },
    { label: 'Share Event', icon: 'pi pi-upload', iconType: 'pi', action: 'shareEvent' },
    { label: 'Cancel Event', icon: 'assets/svg/manage-event/calendar-x.svg', iconType: 'svg', danger: true, action: 'cancelEvent' }
  ];

  async openMenu() {
    const result = await this.modalService.openMenuModal(this.menuItems);
    if (!result?.role) return;

    const actions: Record<string, () => void> = {
      editEvent: () => this.editEvent(),
      viewEventAnalytics: () => this.viewEventAnalytics(),
      viewQuestionnaireResponses: () => this.viewQuestionnaireResponses(),
      manageRoles: () => this.manageRoles(),
      viewGuestList: () => this.viewGuestList(),
      viewEventPageQr: () => this.viewEventPageQr(),
      viewTapToPay: () => this.viewTapToPay(),
      shareEvent: () => this.shareEvent(),
      cancelEvent: () => this.cancelEvent()
    };
    actions[result.role]?.();
  }

  editEvent() {
    this.navCtrl.navigateForward(`/create-event`);
  }

  viewEventAnalytics() {
    this.navCtrl.navigateForward(`/event-analytics/1111`);
  }
  viewQuestionnaireResponses() {}
  manageRoles() {}
  viewGuestList() {}
  viewEventPageQr() {}
  viewTapToPay() {}
  shareEvent() {}

  async cancelEvent() {
    const result = await this.modalService.openConfirmModal({
      icon: 'assets/svg/deleteWhiteIcon.svg',
      iconBgColor: '#C73838',
      title: 'Cancel This Event',
      description: 'Are you sure you want to cancel this event? We’ll notify everyone that have registered, and issue automatic refunds.',
      confirmButtonLabel: 'Cancel Event',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconPosition: 'left'
    });
    if (result && result.role === 'confirm') {
      this.toasterService.showSuccess('Event cancelled');
    }
  }
}
