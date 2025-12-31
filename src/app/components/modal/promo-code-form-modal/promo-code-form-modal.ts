import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { NumberInput } from '@/components/form/number-input';
import { IonHeader, IonFooter, IonContent, IonToolbar } from '@ionic/angular/standalone';
import { FormGroup, Validators, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Input, inject, signal, Component, ChangeDetectionStrategy } from '@angular/core';

export interface PromoCodeFormModalData {
  promoCode: string;
  promoPresent: string;
  max_use_per_user?: number;
  capped_amount?: string | null;
  redemption_limit?: number | null;
  promotion_type: 'percentage' | 'fixed';
}

@Component({
  selector: 'promo-code-form-modal',
  styleUrl: './promo-code-form-modal.scss',
  templateUrl: './promo-code-form-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Chip, Button, IonFooter, TextInput, IonHeader, IonToolbar, IonContent, NumberInput, ReactiveFormsModule]
})
export class PromoCodeFormModal {
  // services
  private fb = inject(FormBuilder);
  private modalService = inject(ModalService);

  // inputs
  @Input() initialData?: Partial<PromoCodeFormModalData> | null;

  // signals
  promoForm = signal<FormGroup>(
    this.fb.group({
      promotion_type: ['fixed', [Validators.required]],
      capped_amount: [null]
    })
  );
  promotionType = signal<'percentage' | 'fixed'>('fixed');

  ionViewWillEnter(): void {
    if (this.initialData) {
      this.promotionType.set(this.initialData.promotion_type as 'percentage' | 'fixed');
      this.promoForm().patchValue({
        ...this.initialData
      });
    }

    // Watch promotion type changes
    const typeControl = this.promoForm().get('promotion_type');
    if (typeControl) {
      typeControl.valueChanges.subscribe((value) => {
        if (value === 'percentage' || value === 'fixed') {
          this.promotionType.set(value);
          // Reset promoPresent when type changes
          const promoPresentControl = this.promoForm().get('promoPresent');
          if (promoPresentControl) {
            promoPresentControl.setValue('');
          }
        }
      });
    }
  }

  setPromotionType(type: 'percentage' | 'fixed'): void {
    this.promotionType.set(type);
    const form = this.promoForm();
    const typeControl = form.get('promotion_type');
    if (typeControl) {
      typeControl.setValue(type);
    }
  }

  savePromoCode(): void {
    const form = this.promoForm();

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.modalService.close(form.value, 'save');
  }

  close(): void {
    this.modalService.close(null, 'cancel');
  }
}
