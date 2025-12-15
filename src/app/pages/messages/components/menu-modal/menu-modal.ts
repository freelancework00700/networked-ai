import { Component, inject } from '@angular/core';
import { ModalService } from '@/services/modal.service';

@Component({
  selector: 'menu-modal',
  imports: [],
  templateUrl: './menu-modal.html',
  styleUrl: './menu-modal.scss'
})
export class MenuModal {
  private modalService = inject(ModalService);

  addMembers() {
    this.modalService.close({ role: 'addMembers' });
  }

  changeGroupName() {
    this.modalService.close({ role: 'changeGroupName' });
  }

  muteNotifications() {
    this.modalService.close({ role: 'muteNotifications' });
    console.log('Mute notifications');
  }

  leaveGroup() {
    this.modalService.close({ role: 'leave' });
  }
}
