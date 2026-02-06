import { Button } from '@/components/form/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ModalService } from '@/services/modal.service';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { IonFooter, IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { signal, inject, Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'guest-filter-modal',
  styleUrl: './guest-filter-modal.scss',
  templateUrl: './guest-filter-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonHeader, IonFooter, IonToolbar, CheckboxModule, ReactiveFormsModule]
})
export class GuestFilterModal implements OnInit {
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);

  initialFilter: Record<string, boolean> = {};

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
      earlyBird: false,
      standard: false,
      free: false,
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
      title: 'Ticket Type(s)',
      options: [
        { control: 'earlyBird', label: 'Early Bird' },
        { control: 'standard', label: 'Standard' },
        { control: 'sponsor', label: 'Sponsor' },
        { control: 'free', label: 'Free' },
      ]
    }
  ]);

  ngOnInit(): void {
    this.form().patchValue({ ...this.initialFilter });
  }

  readonly resetValues = {
    attending: true,
    maybe: true,
    notAttending: true,
    checkedIn: true,
    notCheckedIn: true,
    myNetwork: true,
    notMyNetwork: true,
    earlyBird: true,
    standard: true,
    free: true,
    sponsor: true
  };

  reset(): void {
    this.form().patchValue(this.resetValues);
  }

  apply(): void {
    this.modalService.close(this.form().value);
  }

  close(): void {
    this.modalService.close();
  }
}
