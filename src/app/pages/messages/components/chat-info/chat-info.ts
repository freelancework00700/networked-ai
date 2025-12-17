import { Button } from '@/components/form/button';
import { InputTextModule } from 'primeng/inputtext';
import { ModalService } from '@/services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IonToggle, IonContent, IonHeader, IonToolbar, IonFooter } from '@ionic/angular/standalone';
import { MenuItem } from '../../../../components/modal/menu-modal';

@Component({
  selector: 'chat-info',
  styleUrl: './chat-info.scss',
  templateUrl: './chat-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonFooter, IonToolbar, IonHeader, IonContent, IonToggle, Button, InputTextModule]
})
export class ChatInfo {
  notificationsOn = signal(true);
  isEditingName = signal(false);
  private router = inject(Router);
  groupName = signal('Sports Group');
  createdDate = signal('13 OCT 2024');
  private route = inject(ActivatedRoute);
  tempGroupName = signal(this.groupName());
  private modalService = inject(ModalService);
  groupImage = signal<string | null>('assets/images/profile.jpeg');
  menuItems: MenuItem[] = [
    { label: 'Add Members', icon: 'assets/svg/addUserIcon.svg', iconType: 'svg', action: 'addMembers' },
    { label: 'Change Group Name', icon: 'assets/svg/editIconBlack.svg', iconType: 'svg', action: 'changeGroupName' },
    { label: 'Mute Notifications', icon: 'assets/svg/alertOffBlackIcon.svg', iconType: 'svg', action: 'toggleNotifications' },
    { label: 'Leave Group', icon: 'pi pi-sign-out text-6', iconType: 'pi', danger: true, action: 'leaveGroup' }
  ];

  ngOnInit() {
    const routePath = this.router.url;

    this.route.params.subscribe(async (params) => {
      const groupId = params['id'];
      if (!groupId) return;

      if (routePath.includes('group-invitation')) {
        await this.modalService.openGroupInvitationModal(groupId);
      }
    });
  }

  members = signal([
    {
      id: '1',
      name: 'Jonah Jameson',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting',
      isYou: true
    },
    {
      id: '2',
      name: 'Kathryn Murphy',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '3',
      name: 'Esther Howard',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '4',
      name: 'Arlene McCoy',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    }
  ]);

  startEditGroupName() {
    this.tempGroupName.set(this.groupName());
    this.isEditingName.set(true);
  }

  cancelEditGroupName() {
    this.isEditingName.set(false);
  }

  saveGroupName() {
    const name = this.tempGroupName().trim();
    if (!name) return;

    this.groupName.set(name);
    this.isEditingName.set(false);
  }

  handleBack() {
    this.router.navigate(['/chat-room', this.route.snapshot.params['id']]);
  }

  toggleNotifications() {
    this.notificationsOn.update((v) => !v);
  }

  async openMenu() {
    const result = await this.modalService.openMenuModal(this.menuItems);
    if (!result) return;

    const actions: Record<string, () => void> = {
      leave: () => this.leaveGroup(),
      addMembers: () => this.addMembers(),
      changeGroupName: () => this.changeGroupName(),
      muteNotifications: () => this.toggleNotifications()
    };

    actions[result.role]?.();
  }

  async openShareGroup() {
    await this.modalService.openShareGroupModal({
      name: this.groupName() || '',
      membersCount: this.members().length,
      inviteLink: 'networked-ai.com/username_here',
      qrCodeUrl: 'assets/svg/QR.svg',
      image: this.groupImage() || ''
    });
  }

  async addMembers() {
    this.router.navigate(['/create-group'], { queryParams: { groupId: this.route.snapshot.params['id'] } });
  }

  async changeGroupName() {
    this.startEditGroupName();
  }

  onGroupNameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.tempGroupName.set(value);
  }

  onGroupImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files.length) return;

    const file = input.files[0];

    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.groupImage.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  async leaveGroup() {
    const result = await this.modalService.openConfirmModal({
      iconName: 'pi-sign-out',
      title: 'Leave Group',
      description: 'Are you sure you want to go leave this group chat?',
      confirmButtonLabel: 'Leave',
      cancelButtonLabel: 'Cancel',
      confirmButtonColor: 'danger',
      iconPosition: 'left',
      iconBgColor: '#C73838'
    });

    if (result && result.role === 'confirm') {
      this.router.navigate(['/messages']);
    }
  }
}
