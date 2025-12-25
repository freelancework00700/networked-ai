import {
  input,
  OnInit,
  inject,
  signal,
  computed,
  ViewChild,
  OnDestroy,
  Component,
  ElementRef,
  AfterViewChecked,
  ChangeDetectionStrategy
} from '@angular/core';
import { Swiper } from 'swiper';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { EventCard } from '@/components/card/event-card';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'plan-preview',
  styleUrl: './plan-preview.scss',
  templateUrl: './plan-preview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EventCard, RadioButtonModule, ReactiveFormsModule]
})
export class PlanPreview implements AfterViewChecked, OnDestroy, OnInit {
  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef<HTMLDivElement>;

  planForm = input.required<FormGroup>();
  benefits = input.required<any[]>();
  selectedEvents = input.required<string[]>();
  discountType = input.required<'percentage' | 'amount'>();
  events = input.required<any[]>();
  monthlyPriceValue = input.required<number>();
  discountValue = input.required<number>();
  planType = input<'event' | 'sponsor' | null>(null);

  swiper?: Swiper;
  isDescriptionExpanded = signal<boolean>(false);
  selectedPlan = signal<'annual' | 'monthly'>('monthly');

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
    this.planControl.valueChanges.subscribe((value: 'annual' | 'monthly' | null) => {
      if (value) {
        this.selectedPlan.set(value);
      }
    });
  }

  ngAfterViewChecked(): void {
    if (!this.hasMultipleEvents()) {
      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = undefined;
      }
      return;
    }

    if (!this.swiperEl?.nativeElement) return;
    if (this.selectedEvents().length === 0) {
      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = undefined;
      }
      return;
    }

    if (this.swiper) {
      requestAnimationFrame(() => {
        this.swiper!.update();
      });
      return;
    }

    this.swiper = new Swiper(this.swiperEl.nativeElement, {
      slidesPerView: 'auto',
      spaceBetween: 12,
      allowTouchMove: true,
      observer: true,
      observeParents: true
    });
  }

  ngOnDestroy(): void {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = undefined;
    }
  }

  getFieldValue(fieldName: string): any {
    return this.planForm().get(fieldName)?.value;
  }

  getEventById(eventId: string): any | undefined {
    return this.events().find((e) => e.id === eventId);
  }

  convertToIEvent(event: any): any {
    return {
      date: event.date,
      day: event.day,
      views: '10',
      title: event.title,
      image: event.image || '',
      location: event.location,
      dayOfWeek: event.dayOfWeek,
      organization: event.organization
    };
  }

  toggleDescription(): void {
    this.isDescriptionExpanded.set(!this.isDescriptionExpanded());
  }

  selectPlan(plan: 'annual' | 'monthly'): void {
    this.selectedPlan.set(plan);
    this.planControl.setValue(plan);
  }
}
