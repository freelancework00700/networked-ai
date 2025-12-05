import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { TextInput } from '@/components/form/text-input';
import { NumberInput } from '@/components/form/number-input';
import { ModalController, IonChip } from '@ionic/angular/standalone';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, inject, ChangeDetectionStrategy, signal, OnInit, Input } from '@angular/core';

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
  imports: [CommonModule, ReactiveFormsModule, Button, TextInput, NumberInput, IonChip]
})
export class PromoCodeForm implements OnInit {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);

  @Input() initialData?: Partial<PromoCodeFormData> | null;

  promoForm = signal<FormGroup>(
    this.fb.group({
      promoCode: ['', [Validators.required]],
      promotion_type: ['fixed', [Validators.required]],
      promoPresent: ['', [Validators.required]],
      capped_amount: [null],
      redemption_limit: [null],
      max_use_per_user: [1]
    })
  );
  promotionType = signal<'percentage' | 'fixed'>('fixed');

  ngOnInit(): void {
    const data = this.initialData;
    const initialType = data?.promotion_type || 'fixed';
    this.promotionType.set(initialType);

    const form = this.promoForm();

    form.patchValue({
      promoCode: data?.promoCode || '',
      promotion_type: initialType,
      promoPresent: data?.promoPresent || '',
      capped_amount: data?.capped_amount || null,
      redemption_limit: data?.redemption_limit || null,
      max_use_per_user: data?.max_use_per_user || 1
    });

    // Watch promotion type changes
    const typeControl = form.get('promotion_type');
    if (typeControl) {
      typeControl.valueChanges.subscribe((value) => {
        if (value === 'percentage' || value === 'fixed') {
          this.promotionType.set(value);
          // Reset promoPresent when type changes
          const promoPresentControl = form.get('promoPresent');
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
