import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { ModalController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, Input } from '@angular/core';

export interface ConfirmModalConfig {
  icon?: string; // SVG path
  title: string;
  iconName?: string;
  iconBgColor?: string;
  description?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  confirmButtonColor?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null;
}

@Component({
  selector: 'confirm-modal',
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Button]
})
export class ConfirmModal {
  private modalCtrl = inject(ModalController);
  private modalService = inject(ModalService);

  @Input() icon: string = '';
  @Input() iconBgColor?: string;
  @Input() iconName: string = '';
  @Input() title: string = 'Confirm';
  @Input() description: string = '';
  @Input() cancelButtonLabel: string = '';
  @Input() confirmButtonLabel: string = 'Confirm';
  @Input() iconPosition: 'left' | 'center' = 'center';
  @Input() confirmButtonColor: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' = 'primary';

  confirm(): void {
    this.modalCtrl.dismiss(true, 'confirm');
    this.modalService.close();
  }

  cancel(): void {
    this.modalCtrl.dismiss(false, 'cancel');
    this.modalService.close();
  }
}
