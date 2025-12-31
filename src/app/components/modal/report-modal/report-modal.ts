import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextInput } from '@/components/form/text-input';
import { inject, signal, Component, Input } from '@angular/core';
import { IonHeader, IonFooter, IonToolbar } from '@ionic/angular/standalone';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'report-modal',
  styleUrl: './report-modal.scss',
  templateUrl: './report-modal.html',
  imports: [Button, TextInput, IonHeader, IonFooter, IonToolbar, RadioButtonModule, ReactiveFormsModule]
})
export class ReportModal {
  // services
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);

  @Input() type: 'Post' | 'Event' = 'Post';
  // signals
  form = signal<FormGroup>(
    this.fb.group({
      additionalComment: [''],
      reason: [null, Validators.required]
    })
  );

  reasons = [
    'Violent event',
    'Hateful or abusive event',
    'Harassment or bullying',
    'Harmful or dangerous acts',
    'Misinformation',
    'Child abuse',
    'Promotes terrorism',
    'Legal issues',
    'Spam or misleading',
    'Others'
  ];

  submitReport() {
    if (this.form().valid) {
      this.modalService.close(true, 'report');
    } else {
      this.form().markAllAsTouched();
    }
  }

  close(): void {
    this.modalService.close(false, 'report');
  }
}
