import { SelectModule } from 'primeng/select';
import { ModalController } from '@ionic/angular/standalone';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, Input, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'manage-role-modal',
  styleUrl: './manage-role-modal.scss',
  templateUrl: './manage-role-modal.html',
  imports: [ReactiveFormsModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageRoleModal implements OnInit {
  @Input() users: any[] = [];
  @Input() eventId: string = '';
  fb = inject(FormBuilder);
  modalCtrl = inject(ModalController);

  form = signal<FormGroup>(
    this.fb.group({
      users: this.fb.array([])
    })
  );

  roles = signal([
    { name: 'None', value: 'none' },
    { name: 'Staff', value: 'staff' },
    { name: 'Cohost', value: 'co-host' },
    { name: 'Sponsor', value: 'sponsor' },
    { name: 'Speaker', value: 'speaker' }
  ]);

  ngOnInit() {
    this.form.set(
      this.fb.group({
        users: this.fb.array(
          this.users.map((user) =>
            this.fb.group({
              id: [user.id],
              name: [user.name],
              image: [user.image],
              role: [user.role ?? 'none']
            })
          )
        )
      })
    );
  }

  get usersFormArray(): FormArray {
    return this.form().get('users') as FormArray;
  }

  close() {
    this.modalCtrl.dismiss();
  }

  changeRole(index: number, role: string) {
    this.usersFormArray.at(index).get('role')?.setValue(role);
  }
}
