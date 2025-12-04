import { Button } from '../../button';
import { IonDatetime, ModalController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, signal, OnInit, Input } from '@angular/core';

@Component({
  selector: 'date-modal',
  templateUrl: './date-modal.html',
  styleUrl: './date-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonDatetime, Button]
})
export class DateModal implements OnInit {
  private modalCtrl = inject(ModalController);

  selectedDate = signal<string>('');
  @Input() title = 'Select Date';
  @Input() initialDate: string | null = null;

  ngOnInit(): void {
    if (this.initialDate) {
      this.selectedDate.set(this.initialDate);
    } else {
      // If no initial date, set today's date as default
      const today = new Date();
      const defaultDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      this.selectedDate.set(defaultDate);
    }
  }

  onDateChange(event: CustomEvent): void {
    this.selectedDate.set(event.detail.value as string);
  }

  confirm(): void {
    this.modalCtrl.dismiss(this.selectedDate() || null);
  }
}
