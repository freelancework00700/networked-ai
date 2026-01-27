import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { IonIcon } from '@ionic/angular/standalone';
import { SubscriptionPlan } from '@/interfaces/event';
import { ModalService } from '@/services/modal.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ControlContainer, FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, OnInit, input, computed, signal, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'subscription-input',
  templateUrl: './subscription-input.html',
  styleUrl: './subscription-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToggleSwitchModule, ReactiveFormsModule, CommonModule, Button, IonIcon],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class SubscriptionInput implements OnInit {
  private fb = inject(FormBuilder);
  private parentContainer = inject(ControlContainer);
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);

  controlName = 'is_subscription';
  subscriptionIdsControlName = 'plan_ids';

  // Inputs
  plans = input<SubscriptionPlan[]>([]);
  onCreateSubscription = input<() => void>();
  subscriberExclusiveMode = input<boolean>(false);

  selectedPlanIds = signal<string[]>([]);

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get isEnabled(): boolean {
    const control = this.parentFormGroup.get(this.controlName);
    return control?.value === true;
  }

  get selectedSubscriptionIds(): string[] {
    const control = this.parentFormGroup.get(this.subscriptionIdsControlName);
    return control?.value || [];
  }

  selectedPlans = computed(() => {
    const selectedIds = this.selectedPlanIds();
    return this.plans().filter((plan) => selectedIds.includes(plan.product_id));
  });

  hasPlans = computed(() => this.plans().length > 0);
  showCreateSubscription = computed(() => this.isEnabled && !this.hasPlans());
  hasSelectedPlans = computed(() => this.selectedPlans().length > 0);
  isSubscriberExclusiveMode = computed(() => this.subscriberExclusiveMode());

  ngOnInit(): void {
    if (!this.parentFormGroup.get(this.controlName)) {
      this.parentFormGroup.addControl(this.controlName, this.fb.control(false));
    }
    if (!this.parentFormGroup.get(this.subscriptionIdsControlName)) {
      this.parentFormGroup.addControl(this.subscriptionIdsControlName, this.fb.control([]));
    }

    // In subscriber exclusive mode, automatically enable the control
    if (this.isSubscriberExclusiveMode()) {
      const control = this.parentFormGroup.get(this.controlName);
      if (control) {
        control.setValue(true, { emitEvent: false });
      }
    }

    // Initialize selected plan IDs from form
    const selectedIds = this.selectedSubscriptionIds;
    this.selectedPlanIds.set(selectedIds);

    const control = this.parentFormGroup.get(this.controlName);
    if (control && !this.isSubscriberExclusiveMode()) {
      control.valueChanges.subscribe((value) => {
        if (!value) {
          const subscriptionControl = this.parentFormGroup.get(this.subscriptionIdsControlName);
          if (subscriptionControl) {
            subscriptionControl.setValue([]);
            this.selectedPlanIds.set([]);
          }
        }
      });
    }

    // Watch for changes in subscription IDs
    const subscriptionControl = this.parentFormGroup.get(this.subscriptionIdsControlName);
    if (subscriptionControl) {
      subscriptionControl.valueChanges.subscribe((value: string[]) => {
        this.selectedPlanIds.set(value || []);
        this.cdr.markForCheck();
      });
    }
  }

  async openSubscriptionSelect(): Promise<void> {
    const selectedPlanIds = await this.modalService.openSubscriptionPlansModal(this.plans(), this.selectedPlanIds());

    if (selectedPlanIds) {
      const subscriptionControl = this.parentFormGroup.get(this.subscriptionIdsControlName);
      if (subscriptionControl) {
        subscriptionControl.setValue(selectedPlanIds);
        subscriptionControl.markAsTouched();
        this.selectedPlanIds.set(selectedPlanIds);
        this.cdr.markForCheck();
      }
    }
  }

  removePlan(planId: string): void {
    const currentIds = this.selectedPlanIds();
    const updatedIds = currentIds.filter((id) => id !== planId);
    const subscriptionControl = this.parentFormGroup.get(this.subscriptionIdsControlName);
    if (subscriptionControl) {
      subscriptionControl.setValue(updatedIds);
      this.selectedPlanIds.set(updatedIds);
      this.cdr.markForCheck();
    }
  }

  getPlanTypeClass(plan: SubscriptionPlan): string {
    if (plan.type === 'sponsor') {
      return 'bg-amber-100 border-amber-300';
    }
    return 'bg-blue-100 border-blue-300';
  }

  getPlanIconColor(plan: SubscriptionPlan): string {
    if (plan.type === 'sponsor') {
      return 'text-amber-600';
    }
    return 'text-blue-600';
  }

  handleCreateSubscription(): void {
    const onCreate = this.onCreateSubscription();
    if (onCreate) {
      onCreate();
    }
  }
}
