import { Button } from '@/components/form/button';
import { Component, inject } from '@angular/core';
import { ModalService } from '@/services/modal.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextInput } from '@/components/form/text-input';
import { ModalController } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'report-modal',
  standalone: true,
  imports: [Button, RadioButtonModule, ReactiveFormsModule, TextInput],
  templateUrl: './report-modal.html',
  styleUrls: ['./report-modal.scss']
})
export class ReportModal {
  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);
  private modalService = inject(ModalService);

  reportReasons: string[] = [
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

  reportForm: FormGroup = this.fb.group({
    reason: [null, Validators.required],
    additionalComment: ['']
  });

  submitReport() {
    if (this.reportForm.valid) {
      this.modalCtrl.dismiss(true, 'report');
      this.modalService.close();
    } else {
      this.reportForm.markAllAsTouched();
    }
  }

  close(): void {
    this.modalCtrl.dismiss(false, 'report');
    this.modalService.close();
  }
}
