import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { NavController, IonIcon } from '@ionic/angular/standalone';
import { IonContent, IonToolbar, IonHeader } from '@ionic/angular/standalone';
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
@Component({
  selector: 'guest-list',
  styleUrl: './guest-list.scss',
  templateUrl: './guest-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, Button, Searchbar, IonIcon, MenuModule, ButtonModule]
})
export class GuestList {
  navCtrl = inject(NavController);
  modalService = inject(ModalService);
  searchQuery = signal('');
  isDownloading = signal<boolean>(false);
  filter = signal<any>({
    attending: false,
    maybe: false,
    notAttending: true,
    checkedIn: true,
    notCheckedIn: true,
    myNetwork: false,
    notMyNetwork: true,
    inApp: true,
    onTheSpot: false,
    earlyBird: false,
    standard: false,
    premium: true,
    sponsor: true
  });

  guestList = [
    {
      id: '1',
      name: 'Kathryn Murphy',
      value: 200,
      ticketType: 'Standard',
      paymentStatus: 'paid',
      paymentMode: 'in-app',
      checkedIn: true
    },
    {
      id: '2',
      name: 'Esther Howard',
      value: 200,
      ticketType: 'Standard',
      paymentStatus: 'unpaid',
      paymentMode: 'ots',
      checkedIn: false
    },
    {
      id: '3',
      name: 'Kristin Watson',
      value: 200,
      ticketType: 'Premium',
      paymentStatus: 'paid',
      paymentMode: 'in-app',
      checkedIn: true
    },
    {
      id: '4',
      name: 'Arlene McCoy',
      value: 200,
      ticketType: 'Early Bird',
      paymentStatus: 'paid',
      paymentMode: 'in-app',
      checkedIn: false
    }
  ];

  stats = [
    {
      key: 'total',
      label: 'Total',
      value: 209,
      class: 'stat-total'
    },
    {
      key: 'attending',
      label: 'Attending',
      value: 191,
      class: 'stat-attending'
    },
    {
      key: 'maybe',
      label: 'Maybe',
      value: 18,
      class: 'stat-maybe'
    },
    {
      key: 'not',
      label: 'Not',
      value: 0,
      class: 'stat-not'
    }
  ];

  items: MenuItem[] = [
    {
      label: 'Check-in Guest',
      command: () => this.checkInGuest(),
      iconPath: 'assets/svg/guest-list/check-in.svg'
    },
    {
      label: 'Issue Refund',
      command: () => this.issueRefund(),
      iconPath: 'assets/svg/guest-list/refund-issue.svg'
    },
    {
      label: 'Add as Network',
      command: () => this.addAsNetwork(),
      iconPath: 'assets/svg/guest-list/add-network.svg'
    },
    {
      label: 'Send Message',
      command: () => this.sendMessage(),
      iconPath: 'assets/svg/guest-list/send-message.svg'
    },
    {
      label: 'Uncheck-in',
      command: () => this.uncheckIn(),
      iconPath: 'assets/svg/guest-list/uncheck-in.svg'
    },
    {
      label: 'Remove Guest',
      command: () => this.removeGuest(),
      iconPath: 'assets/svg/deleteIcon.svg'
    }
  ];

  issueRefund() {
    console.log('Refund');
  }
  checkInGuest() {
    console.log('Check-in Guest');
  }
  addAsNetwork() {
    console.log('Add Network');
  }
  sendMessage() {
    console.log('Message');
  }
  uncheckIn() {
    console.log('Uncheck-in');
  }
  removeGuest() {
    console.log('Remove Guest');
  }
  filteredGuestList = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    if (!search) return this.guestList;

    return this.guestList.filter((s) => s.name.toLowerCase().includes(search));
  });

  back() {
    this.navCtrl.back();
  }

  downloadGuestList() {
    this.isDownloading.set(true);
    setTimeout(() => {
      this.isDownloading.set(false);
    }, 2000);
  }

  async openFilterModal() {
    const result = await this.modalService.openGuestFilterModal(this.filter());
    if (result) this.filter.set(result);
  }
}
