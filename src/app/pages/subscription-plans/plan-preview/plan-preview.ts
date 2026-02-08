import {
  input,
  output,
  OnInit,
  signal,
  computed,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicSlides } from '@ionic/angular/standalone';
import { RadioButtonModule } from 'primeng/radiobutton';
import { EventCard } from '@/components/card/event-card';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ISubscription, SubscriptionCard } from '@/components/card/subscription-card';

@Component({
  selector: 'plan-preview',
  styleUrl: './plan-preview.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './plan-preview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EventCard, RadioButtonModule, ReactiveFormsModule, SubscriptionCard]
})
export class PlanPreview implements OnInit {
  planForm = input.required<FormGroup>();
  benefits = input.required<any[]>();
  selectedEvents = input.required<string[]>();
  discountType = input.required<'percentage' | 'fixed'>();
  events = input.required<any[]>();
  monthlyPriceValue = input.required<number>();
  discountValue = input.required<number>();
  planType = input<'event' | 'sponsor' | null>(null);
  subscriptionCardData = input<ISubscription | null>(null); // Optional subscription card data

  // Output to emit selected plan interval
  planSelected = output<'annual' | 'monthly'>();

  isDescriptionExpanded = signal<boolean>(false);
  selectedPlan = signal<'annual' | 'monthly'>('monthly');

  swiperModules = [IonicSlides];
  planControl = new FormControl<'annual' | 'monthly'>('monthly');

  shouldShowReadMore = computed(() => {
    const description = this.getFieldValue('description');
    if (!description) return false;
    return description.length > 150;
  });

  getTruncatedDescription = computed(() => {
    const description = this.getFieldValue('description');
    if (!description) return '';
    if (!this.shouldShowReadMore() || this.isDescriptionExpanded()) {
      return description;
    }
    return description.substring(0, 150) + '...';
  });

  annualPrice = computed(() => {
    const monthlyPrice = this.monthlyPriceValue();
    const discount = this.discountValue();
    const annualBase = monthlyPrice * 12;
    const discountAmount = (annualBase * discount) / 100;
    return annualBase - discountAmount;
  });

  annualBasePrice = computed(() => {
    return this.monthlyPriceValue() * 12;
  });

  amountSaved = computed(() => {
    return this.annualBasePrice() - this.annualPrice();
  });

  discountPercentage = computed(() => {
    return this.discountValue();
  });

  hasMultipleEvents = computed(() => {
    return this.selectedEvents().length > 1;
  });

  hasAnnualPlan = computed(() => {
    return !!this.getFieldValue('annualSubscription');
  });

  planColors = computed(() => {
    const planType = this.planType();
    if (planType === 'event') {
      return {
        border: '#2B5BDE',
        background: '#EFF6FF',
        badge: '#2B5BDE',
        link: '#2B5BDE'
      };
    }
    return {
      border: '#F5BC61',
      background: '#FFFBEB',
      badge: '#F5BC61',
      link: '#F5BC61'
    };
  });

  availablePlans = computed(() => {
    const plans: Array<{
      type: 'annual' | 'monthly';
      label: string;
      price: number;
      period: string;
      inputId: string;
      showBadge: boolean;
    }> = [];

    if (this.getFieldValue('annualSubscription')) {
      plans.push({
        type: 'annual',
        label: 'Annual Plan',
        price: this.annualPrice(),
        period: '/year',
        inputId: 'annual-plan',
        showBadge: true
      });
    }

    plans.push({
      type: 'monthly',
      label: 'Monthly Plan',
      price: this.getFieldValue('monthlyPrice'),
      period: '/month',
      inputId: 'monthly-plan',
      showBadge: false
    });

    return plans;
  });

  ngOnInit(): void {
    // Sync signal with form control when value changes
    // This handles cases where form control is updated externally
    this.planControl.valueChanges.subscribe((value: 'annual' | 'monthly' | null) => {
      if (value && value !== this.selectedPlan()) {
        this.selectedPlan.set(value);
        // Emit output to notify parent component
        this.planSelected.emit(value);
      }
    });

    // Emit initial selection after view is initialized to sync with parent
    setTimeout(() => {
      this.planSelected.emit(this.selectedPlan());
    }, 0);
  }

  getFieldValue(fieldName: string): any {
    return this.planForm().get(fieldName)?.value;
  }

  getEventById(eventId: string): any | undefined {
    return this.events().find((e) => e.id === eventId);
  }

  toggleDescription(): void {
    this.isDescriptionExpanded.set(!this.isDescriptionExpanded());
  }

  selectPlan(plan: 'annual' | 'monthly'): void {
    // Always update and emit, even if already selected, to ensure parent is notified
    this.selectedPlan.set(plan);
    // Update form control - this will trigger valueChanges
    this.planControl.setValue(plan, { emitEvent: false }); // Prevent double emission
    // Emit the output event to notify parent component
    this.planSelected.emit(plan);
  }
}
