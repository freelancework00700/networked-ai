import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { IonFooter, IonToolbar } from '@ionic/angular/standalone';
import { Input, inject, Component, ChangeDetectionStrategy } from '@angular/core';

export interface ConfirmModalConfig {
  icon?: string; // SVG path
  title: string;
  iconName?: string;
  iconBgColor?: string;
  description?: string;
  cancelButtonLabel?: string;
  confirmButtonLabel?: string;
  confirmButtonColor?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' | null;
}

@Component({
  selector: 'confirm-modal',
  styleUrl: './confirm-modal.scss',
  templateUrl: './confirm-modal.html',
  imports: [Button, IonFooter, IonToolbar],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmModal {
  // services
  private modalService = inject(ModalService);

  // inputs
  @Input() icon = '';
  @Input() iconName = '';
  @Input() description = '';
  @Input() title = 'Confirm';
  @Input() iconBgColor?: string;
  @Input() customColor?: string;
  @Input() cancelButtonLabel = '';
  @Input() confirmButtonLabel = 'Confirm';
  @Input() iconPosition: 'left' | 'center' = 'center';
  @Input() confirmButtonColor: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast' = 'primary';

  confirm(): void {
    this.modalService.close(true, 'confirm');
  }

  cancel(): void {
    this.modalService.close(false, 'cancel');
  }
}
