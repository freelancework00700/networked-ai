import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ModalController } from '@ionic/angular/standalone';
import { SelectModal, SelectOption } from '@/components/modal/select-modal/select-modal';
import { ControlContainer, FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, inject, OnInit, input, computed } from '@angular/core';

export interface SubscriptionPlan {
  productId: string;
  name: string;
}

@Component({
  selector: 'subscription-input',
  templateUrl: './subscription-input.html',
  styleUrl: './subscription-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ToggleSwitchModule, ReactiveFormsModule, CommonModule, Button],
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
  private modalCtrl = inject(ModalController);

  controlName = 'include_as_subscription';
  subscriptionIdControlName = 'subscription_id';

  // Inputs
  plans = input<SubscriptionPlan[]>([]);
  onCreateSubscription = input<() => void>();

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get isEnabled(): boolean {
    const control = this.parentFormGroup.get(this.controlName);
    return control?.value === true;
  }

  get selectedSubscriptionId(): string | null {
    const control = this.parentFormGroup.get(this.subscriptionIdControlName);
    return control?.value || null;
  }

  get selectedPlanName(): string {
    const id = this.selectedSubscriptionId;
    if (!id) return '';
    const plan = this.plans().find((p) => p.productId === id);
    return plan?.name || '';
  }

  hasPlans = computed(() => this.plans().length > 0);
  showCreateSubscription = computed(() => this.isEnabled && !this.hasPlans());

  ngOnInit(): void {
    if (!this.parentFormGroup.get(this.controlName)) {
      this.parentFormGroup.addControl(this.controlName, this.fb.control(false));
    }
    if (!this.parentFormGroup.get(this.subscriptionIdControlName)) {
      this.parentFormGroup.addControl(this.subscriptionIdControlName, this.fb.control(null));
    }

    const control = this.parentFormGroup.get(this.controlName);
    if (control) {
      control.valueChanges.subscribe((value) => {
        if (!value) {
          const subscriptionControl = this.parentFormGroup.get(this.subscriptionIdControlName);
          if (subscriptionControl) {
            subscriptionControl.setValue(null);
          }
        }
      });
    }
  }

  async openSubscriptionSelect(): Promise<void> {
    const options: SelectOption[] = this.plans().map((plan) => ({
      value: plan.productId,
      label: plan.name
    }));

    const modal = await this.modalCtrl.create({
      component: SelectModal,
      backdropDismiss: true,
      cssClass: 'auto-hight-modal',
      componentProps: {
        title: 'Select Subscription',
        options: options,
        initialValue: this.selectedSubscriptionId
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      const subscriptionControl = this.parentFormGroup.get(this.subscriptionIdControlName);
      if (subscriptionControl) {
        subscriptionControl.setValue(data);
        subscriptionControl.markAsTouched();
      }
    }
  }

  handleCreateSubscription(): void {
    const onCreate = this.onCreateSubscription();
    if (onCreate) {
      onCreate();
    }
  }
}
