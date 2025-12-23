import { SelectModule } from 'primeng/select';
import { ModalService } from '@/services/modal.service';
import { IonHeader, IonToolbar } from '@ionic/angular/standalone';
import { FormGroup, FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Input, inject, signal, OnInit, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'manage-role-modal',
  styleUrl: './manage-role-modal.scss',
  templateUrl: './manage-role-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, SelectModule, ReactiveFormsModule]
})
export class ManageRoleModal implements OnInit {
  // services
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);

  // inputs
  @Input() users: any[] = [];
  @Input() eventId: string = '';

  // signals
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
    this.modalService.close();
  }

  changeRole(index: number, role: string) {
    this.usersFormArray.at(index).get('role')?.setValue(role);
  }
}
