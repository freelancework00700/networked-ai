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

  getFormattedValue(): string {
    if (!this.value) return '';
    
    if (this.type === 'time') {
      if (this.value.includes('T')) {
        return this.value;
      }
      return this.convertTimeToISO(this.value);
    }
    
    return this.value;
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

  private convertTimeToISO(timeString: string): string {
    if (!timeString || !timeString.includes(':')) {
      return '';
    }
    const [hours, minutes] = timeString.split(':').map(Number);
    const today = new Date();
    // Create ISO string with today's date and specified time
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const hour = String(hours).padStart(2, '0');
    const minute = String(minutes).padStart(2, '0');
    return `${year}-${month}-${day}T${hour}:${minute}:00`;
  }

  getMinValue(): string | undefined {
    if (this.type === 'time') {
      if (!this.min) return undefined;
      if (this.min.includes('T')) {
        return this.min;
      }
      return this.convertTimeToISO(this.min);
    }
    
    // For date type, return undefined if min is not provided to allow all dates including past dates
    if (!this.min) {
      return undefined;
    }
    
    return this.min;
  }

  getMaxValue(): string | undefined {
    if (this.type === 'time') {
      if (!this.max) return undefined;
      if (this.max.includes('T')) {
        return this.max;
      }
      return this.convertTimeToISO(this.max);
    }

    if (!this.max) {
      const futureDate = new Date();
      futureDate.setFullYear(2050, 11, 31); // December 31, 2050
      return futureDate.toISOString().split('T')[0];
    }

    return this.max;
  }
}
