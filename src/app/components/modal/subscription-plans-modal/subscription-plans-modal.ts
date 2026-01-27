import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { SubscriptionPlan } from '@/interfaces/event';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormControl } from '@angular/forms';
import { IonHeader, IonFooter, IonToolbar, IonContent, ModalController } from '@ionic/angular/standalone';
import { SubscriptionCard, ISubscription } from '@/components/card/subscription-card/subscription-card';
import { Component, inject, ChangeDetectionStrategy, signal, computed, Input, OnInit } from '@angular/core';

@Component({
  selector: 'subscription-plans-select-modal',
  templateUrl: './subscription-plans-modal.html',
  styleUrl: './subscription-plans-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonHeader, IonFooter, IonToolbar, IonContent, ReactiveFormsModule, CommonModule, SubscriptionCard]
})
export class SubscriptionPlansModal implements OnInit {
  private modalCtrl = inject(ModalController);
  private fb = inject(FormBuilder);

  @Input() plans: SubscriptionPlan[] = [];
  @Input() selectedPlanIds: string[] = [];

  form: FormGroup;
  selectedCount = signal<number>(0);

  eventPlans = computed(() => {
    return this.plans.filter((plan) => !plan.type || plan.type === 'event');
  });

  sponsorPlans = computed(() => {
    return this.plans.filter((plan) => plan.type === 'sponsor');
  });

  constructor() {
    this.form = this.fb.group({
      selectedPlans: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const selectedIds = this.selectedPlanIds || [];
    const plansArray = this.fb.array(
      this.plans.map((plan) =>
        this.fb.group({
          product_id: [plan.product_id],
          selected: [selectedIds.includes(plan.product_id)]
        })
      )
    );
    this.form.setControl('selectedPlans', plansArray);
    this.updateSelectedCount();
  }

  get selectedPlansFormArray(): FormArray {
    return this.form.get('selectedPlans') as FormArray;
  }

  getPlanControl(planId: string): FormControl<boolean> | null {
    const planGroup = this.selectedPlansFormArray.controls.find((control: any) => control.value.product_id === planId);
    return (planGroup?.get('selected') as FormControl<boolean>) || null;
  }

  convertPlanToSubscription(plan: SubscriptionPlan): ISubscription {
    return {
      id: plan.product_id,
      type: plan.type || 'event',
      name: plan.name,
      subscribers: plan.subscribers,
      priceRange: plan.priceRange
    };
  }

  isPlanSelected(planId: string): boolean {
    const control = this.getPlanControl(planId);
    return control?.value || false;
  }

  togglePlan(planId: string): void {
    const control = this.getPlanControl(planId);
    if (control) {
      const currentValue = control.value;
      control.setValue(!currentValue);
      this.updateSelectedCount();
    }
  }

  updateSelectedCount(): void {
    const selected = this.selectedPlansFormArray.controls.filter((control: any) => control.value.selected === true).length;
    this.selectedCount.set(selected);
  }

  save(): void {
    const selectedPlanIds = this.selectedPlansFormArray.controls
      .filter((control: any) => control.value.selected === true)
      .map((control: any) => control.value.product_id);
    this.modalCtrl.dismiss(selectedPlanIds);
  }

  close(): void {
    this.modalCtrl.dismiss();
  }
}
