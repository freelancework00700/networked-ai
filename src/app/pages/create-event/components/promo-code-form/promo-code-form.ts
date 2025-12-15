import { CommonModule } from '@angular/common';
import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { TextInput } from '@/components/form/text-input';
import { ModalController } from '@ionic/angular/standalone';
import { NumberInput } from '@/components/form/number-input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, ChangeDetectionStrategy, signal, Input } from '@angular/core';

export interface PromoCodeFormData {
  promoCode: string;
  promotion_type: 'percentage' | 'fixed';
  promoPresent: string;
  capped_amount?: string | null;
  redemption_limit?: number | null;
  max_use_per_user?: number;
}

@Component({
  selector: 'promo-code-form',
  templateUrl: './promo-code-form.html',
  styleUrl: './promo-code-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, Button, TextInput, NumberInput, Chip]
})
export class PromoCodeForm {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);

  @Input() initialData?: Partial<PromoCodeFormData> | null;

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

    this.modalCtrl.dismiss(form.value, 'save');
  }

  close(): void {
    this.modalCtrl.dismiss(null, 'cancel');
  }
}
