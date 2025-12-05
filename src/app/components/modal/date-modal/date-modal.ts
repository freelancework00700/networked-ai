import { Button } from '@/components/form/button';
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
  @Input() type: 'date' | 'time' = 'date';

  ngOnInit(): void {
    if (this.initialDate) {
      this.selectedDate.set(this.initialDate);
    } else {
      // If no initial date, set default based on type
      if (this.type === 'time') {
        // Default to current time in HH:mm format
        const now = new Date();
        const defaultTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        this.selectedDate.set(defaultTime);
      } else {
        // Default to today's date
        const today = new Date();
        const defaultDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        this.selectedDate.set(defaultDate);
      }
    }
  }

  onDateChange(event: CustomEvent): void {
    const value = event.detail.value as string;
    if (this.type === 'time') {
      // Format time value to HH:mm
      const date = new Date(value);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      this.selectedDate.set(`${hours}:${minutes}`);
    } else {
      this.selectedDate.set(value);
    }
  }

  getDateTimeValue(): string {
    if (this.type === 'time' && this.selectedDate()) {
      // Convert HH:mm to ISO datetime string for ion-datetime
      const [hours, minutes] = this.selectedDate().split(':');
      const today = new Date();
      today.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return today.toISOString();
    }
    return this.selectedDate() || new Date().toISOString();
  }

  confirm(): void {
    this.modalCtrl.dismiss(this.selectedDate() || null);
  }
}
