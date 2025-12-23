import { Button } from '@/components/form/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ModalService } from '@/services/modal.service';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonFooter, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { Input, signal, inject, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'guest-filter-modal',
  styleUrl: './guest-filter-modal.scss',
  templateUrl: './guest-filter-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonHeader, IonFooter, IonToolbar, CheckboxModule, ReactiveFormsModule]
})
export class GuestFilterModal {
  // services
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);

  // inputs
  @Input() filter: any;

  // signals
  form = signal<FormGroup<any>>(
    this.fb.group({
      attending: false,
      maybe: false,
      notAttending: false,
      checkedIn: false,
      notCheckedIn: false,
      myNetwork: false,
      notMyNetwork: false,
      inApp: false,
      onTheSpot: false,
      earlyBird: false,
      standard: false,
      premium: false,
      sponsor: false
    })
  );
  filterSections = signal<any[]>([
    {
      title: 'Guest Status',
      options: [
        { control: 'attending', label: 'Attending' },
        { control: 'maybe', label: 'Maybe' },
        { control: 'notAttending', label: 'Not Attending' }
      ]
    },
    {
      title: 'Checked-in Status',
      options: [
        { control: 'checkedIn', label: 'Checked-in' },
        { control: 'notCheckedIn', label: 'Not Checked-in' }
      ]
    },
    {
      title: 'Networked Connection',
      options: [
        { control: 'myNetwork', label: 'My Network' },
        { control: 'notMyNetwork', label: 'Not My Network' }
      ]
    },
    {
      title: 'Purchase Method',
      options: [
        { control: 'inApp', label: 'In-App' },
        { control: 'onTheSpot', label: 'On the spot' }
      ]
    },
    {
      title: 'Ticket Type(s)',
      options: [
        { control: 'earlyBird', label: 'Early Bird' },
        { control: 'standard', label: 'Standard' },
        { control: 'premium', label: 'Premium' },
        { control: 'sponsor', label: 'Sponsor' }
      ]
    }
  ]);

  ionViewWillEnter() {
    this.form().patchValue({ ...this.filter });
  }

  apply() {
    this.modalService.close(this.form().value);
  }

  close() {
    this.modalService.close();
  }
}
