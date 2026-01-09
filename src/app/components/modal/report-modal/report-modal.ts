import { Button } from '@/components/form/button';
import { ReportReason } from '@/interfaces/IFeed';
import { FeedService } from '@/services/feed.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextInput } from '@/components/form/text-input';
import { inject, signal, Component, Input, OnInit } from '@angular/core';
import { IonHeader, IonFooter, IonToolbar, IonSpinner, ModalController } from '@ionic/angular/standalone';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'report-modal',
  styleUrl: './report-modal.scss',
  templateUrl: './report-modal.html',
  imports: [Button, TextInput, IonHeader, IonFooter, IonToolbar, RadioButtonModule, ReactiveFormsModule, IonSpinner]
})
export class ReportModal implements OnInit {
  // services
  private fb = inject(FormBuilder);
  private feedService = inject(FeedService);
  private modalCtrl = inject(ModalController);

  @Input() type: 'Post' | 'Event' | 'Comment' = 'Post';
  
  // signals
  form = signal<FormGroup>(
    this.fb.group({
      additionalComment: [''],
      reason_id: [null, Validators.required]
    })
  );

  reasons = signal<ReportReason[]>([]);
  isLoading = signal<boolean>(false);

  async ngOnInit() {
    await this.loadReportReasons();
  }

  async loadReportReasons() {
    try {
      this.isLoading.set(true);
      const response = await this.feedService.getReportReasons();
      const sortedReasons = (response.data || []).sort((a, b) => a.order - b.order);
      this.reasons.set(sortedReasons);
      if (sortedReasons.length > 0) {
        this.form().patchValue({ reason_id: sortedReasons[0].id });
      }
    } catch (error) {
      console.error('Error loading report reasons:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  submitReport() {
    if (this.form().valid) {
      const formValue = this.form().getRawValue();
      this.modalCtrl.dismiss({
        reason_id: formValue.reason_id,
        reason: formValue.additionalComment || undefined
      });
    } else {
      this.form().markAllAsTouched();
    }
  }

  close(): void {
    this.modalCtrl.dismiss(null);
  }
}
