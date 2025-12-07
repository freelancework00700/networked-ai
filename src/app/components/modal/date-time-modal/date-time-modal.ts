import { Button } from '@/components/form/button';
import { IonDatetime, ModalController } from '@ionic/angular/standalone';
import { Input, inject, OnInit, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'date-time-modal',
  imports: [Button, IonDatetime],
  styleUrl: './date-time-modal.scss',
  templateUrl: './date-time-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateTimeModal implements OnInit {
  // inputs
  @Input() title = 'Select Date';
  @Input() type: 'date' | 'time' = 'date';
  @Input() value = ''; // format: YYYY-MM-DD or HH:mm

  // services
  private modalCtrl = inject(ModalController);

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

  dismiss(): void {
    this.modalCtrl.dismiss(this.value);
  }
}
