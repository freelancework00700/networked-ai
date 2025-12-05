import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { ModalController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, Input } from '@angular/core';

export interface ConfirmModalConfig {
  icon?: string; // SVG path
  title: string;
  description?: string;
  confirmButtonLabel?: string;
  cancelButtonLabel?: string;
  primaryButtonColor?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null;
  secondaryButtonColor?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null;
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

  @Input() icon: string = '';
  @Input() title: string = 'Confirm';
  @Input() description: string = '';
  @Input() confirmButtonLabel: string = 'Confirm';
  @Input() cancelButtonLabel: string = 'Cancel';

  confirm(): void {
    this.modalCtrl.dismiss(true, 'confirm');
  }

  cancel(): void {
    this.modalCtrl.dismiss(false, 'cancel');
  }
}
