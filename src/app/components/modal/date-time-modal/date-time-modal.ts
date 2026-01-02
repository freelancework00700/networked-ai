import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Input, inject, OnInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonFooter, IonHeader, IonToolbar, IonDatetime, ModalController } from '@ionic/angular/standalone';

@Component({
  selector: 'date-time-modal',
  styleUrl: './date-time-modal.scss',
  templateUrl: './date-time-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonHeader, IonFooter, IonToolbar, IonDatetime]
})
export class DateTimeModal implements OnInit {
  // inputs
  @Input() title = 'Select Date';
  @Input() type: 'date' | 'time' = 'date';
  @Input() value = ''; // format: YYYY-MM-DD or HH:mm
  @Input() min: string | null = null; // format: YYYY-MM-DD or HH:mm
  @Input() max: string | null = null; // format: YYYY-MM-DD or HH:mm

  // services
  private modalCtrl = inject(ModalController);
  private modalService = inject(ModalService);

  ngOnInit(): void {
    if (!this.value) {
      const now = new Date();
      if (this.type === 'time') {
        // default to current time format: HH:mm
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        this.value = `${hours}:${minutes}`;
      } else {
        // default to current date format: YYYY-MM-DD
        const year = now.getFullYear();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        this.value = `${year}-${month}-${day}`;
      }
    }
  }

  private formatReturnValue(value: string): string {
    if (!value) return value;
    if (value.includes('T')) {
      if (this.type === 'time') {
        try {
          const date = new Date(value);
          const hours = date.getHours().toString().padStart(2, '0');
          const minutes = date.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        } catch {
          return value;
        }
      } else {
        return value.split('T')[0];
      }
    }

    return value;
  }

  dismiss(): void {
    const formattedValue = this.formatReturnValue(this.value);
    this.modalCtrl.dismiss(formattedValue);
    this.modalService.close();
  }

  // Common function to convert HH:mm to ISO datetime string with timezone adjustment
  private convertTimeToISO(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const today = new Date();
    const localDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    const timezoneOffset = localDate.getTimezoneOffset();
    const utcDate = new Date(localDate.getTime() - timezoneOffset * 60 * 1000);
    return utcDate.toISOString();
  }

  getMinValue(): string | undefined {
    if (!this.min) return undefined;
    if (this.type === 'time') {
      return this.convertTimeToISO(this.min);
    }
    return this.min || undefined;
  }

  getMaxValue(): string | undefined {
    if (this.type === 'time') {
      if (!this.max) return undefined;
      return this.convertTimeToISO(this.max);
    }

    if (!this.max) {
      const futureDate = new Date();
      futureDate.setFullYear(2050, 11, 31); // December 31, 2050
      return futureDate.toISOString().split('T')[0];
    }

    return this.max || undefined;
  }
}
