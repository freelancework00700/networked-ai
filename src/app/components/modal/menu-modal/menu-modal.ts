import { Component, inject, Input } from '@angular/core';
import { ModalService } from '@/services/modal.service';

export interface MenuItem {
  label: string;
  icon?: string;
  iconType?: 'svg' | 'pi';
  danger?: boolean;
  action?: string;
}

@Component({
  selector: 'menu-modal',
  standalone: true,
  templateUrl: './menu-modal.html',
  styleUrl: './menu-modal.scss'
})
export class MenuModal {
  private modalService = inject(ModalService);

  @Input() items: MenuItem[] = [];

  onItemClick(item: MenuItem) {
    this.modalService.close({
      role: item.action,
      data: item
    });
  }
}
