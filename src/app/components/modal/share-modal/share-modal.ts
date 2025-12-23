import { Checkbox } from 'primeng/checkbox';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { ToasterService } from '@/services/toaster.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IonIcon, IonHeader, IonFooter, IonToolbar } from '@ionic/angular/standalone';
import { Input, inject, signal, computed, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'share-modal',
  styleUrl: './share-modal.scss',
  templateUrl: './share-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonIcon, Checkbox, IonFooter, Searchbar, IonHeader, IonToolbar, ReactiveFormsModule]
})
export class ShareModal {
  // services
  private modalService = inject(ModalService);
  private toasterService = inject(ToasterService);

  // inputs
  @Input() eventId: any;
  @Input() type: 'Event' | 'Post' = 'Event';

  // signals
  searchQuery = signal<string>('');
  isChecked = signal<boolean>(false);
  selectedUsers = signal<{ name: string; avatar: string }[]>([]);
  selectAllNetworkCtrl = signal<FormControl>(new FormControl(false));

  previousAttendees = signal([
    { name: 'Kathryn M.', avatar: 'assets/images/profile.jpeg' },
    { name: 'Esther H.', avatar: 'assets/images/profile.jpeg' },
    { name: 'Jane H.', avatar: 'assets/images/profile.jpeg' },
    { name: 'Arlene M.', avatar: 'assets/images/profile.jpeg' }
  ]);

  yourNetwork = signal([
    { name: 'Kathryn L.', avatar: 'assets/images/profile.jpeg' },
    { name: 'Esther H.', avatar: 'assets/images/profile.jpeg' },
    { name: 'Darrell S.', avatar: 'assets/images/profile.jpeg' },
    { name: 'Annette B.', avatar: 'assets/images/profile.jpeg' },
    { name: 'Iris K.', avatar: 'assets/images/profile.jpeg' },
    { name: 'Alexander S.', avatar: 'assets/images/profile.jpeg' }
  ]);

  actions = [
    { icon: 'assets/svg/linkBlackIcon.svg', label: 'Copy Link', type: 'svg' },
    { icon: 'assets/svg/users.svg', label: 'Contact', type: 'svg' },
    { icon: 'pi pi-upload ', label: 'Share to', type: 'i' },
    { icon: 'assets/svg/chatIcon.svg', label: 'Chat', type: 'svg' },
    { icon: 'assets/svg/messengerIcon.svg', label: 'Messenger', type: 'svg' }
  ];

  filteredPreviousAttendees = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) return this.previousAttendees();

    return this.previousAttendees().filter((user) => user.name.toLowerCase().includes(query));
  });

  filteredYourNetwork = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) return this.yourNetwork();

    return this.yourNetwork().filter((user) => user.name.toLowerCase().includes(query));
  });

  constructor() {
    this.selectAllNetworkCtrl().valueChanges.subscribe((checked) => {
      if (checked) {
        this.addAllNetworkUsers();
      } else {
        this.removeAllNetworkUsers();
      }
    });
  }

  addAllNetworkUsers() {
    const network = this.yourNetwork();
    const selected = this.selectedUsers();

    const merged = [...selected, ...network.filter((u) => !selected.some((s) => s.name === u.name))];

    this.selectedUsers.set(merged);
  }

  removeAllNetworkUsers() {
    const networkNames = new Set(this.yourNetwork().map((u) => u.name));

    this.selectedUsers.set(this.selectedUsers().filter((u) => !networkNames.has(u.name)));
  }

  toggleUser(user: any) {
    const selected = this.selectedUsers();
    const exists = selected.some((u) => u.name === user.name);

    if (exists) {
      this.selectedUsers.set(selected.filter((u) => u.name !== user.name));
    } else {
      this.selectedUsers.set([...selected, user]);
    }

    this.syncSelectAllCheckbox();
  }

  isSelected(user: any) {
    return this.selectedUsers().some((u) => u.name === user.name);
  }

  syncSelectAllCheckbox() {
    const network = this.yourNetwork();

    const allSelected = network.length && network.every((u) => this.selectedUsers().some((s) => s.name === u.name));

    this.selectAllNetworkCtrl().setValue(allSelected as boolean, {
      emitEvent: false
    });
  }

  shareEvent() {
    this.toasterService.showSuccess(`${this.type} shared successfully`);
    this.modalService.close();
  }
}
