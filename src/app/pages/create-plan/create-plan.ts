import { CommonModule } from '@angular/common';
import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { InputTextModule } from 'primeng/inputtext';
import { PlanPreview } from './components/plan-preview';
import { ModalService } from '@/services/modal.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextInput } from '@/components/form/text-input';
import { NavController } from '@ionic/angular/standalone';
import { NumberInput } from '@/components/form/number-input';
import { ToggleInput } from '@/components/form/toggle-input';
import { TextAreaInput } from '@/components/form/text-area-input';
import { SubscriptionEventCard } from '@/components/card/subscription-event-card';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, computed, inject, signal, ChangeDetectionStrategy, OnInit, ChangeDetectorRef } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonFooter, IonReorderGroup, IonReorder, ItemReorderEventDetail } from '@ionic/angular/standalone';
interface Event {
  id: string;
  title: string;
  date: string;
  dayOfWeek: string;
  day: string;
  location: string;
  time: string;
  organization: string;
  image?: string;
}

@Component({
  selector: 'app-create-plan',
  imports: [
    Chip,
    Button,
    IonHeader,
    IonFooter,
    TextInput,
    IonContent,
    IonToolbar,
    IonReorder,
    PlanPreview,
    NumberInput,
    ToggleInput,
    CommonModule,
    TextAreaInput,
    InputTextModule,
    IonReorderGroup,
    RadioButtonModule,
    ReactiveFormsModule,
    SubscriptionEventCard
  ],
  styleUrl: './create-plan.scss',
  templateUrl: './create-plan.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePlan implements OnInit {
  fb = inject(FormBuilder);
  navCtrl = inject(NavController);
  cdr = inject(ChangeDetectorRef);
  modalService = inject(ModalService);

  titleValue = signal<string>('');
  currentStep = signal<number>(1);
  conversation = signal<any[]>([]);
  discountValue = signal<number>(0);
  steps = signal<number[]>([1, 2, 3]);
  isLaunching = signal<boolean>(false);
  selectedEvents = signal<string[]>([]);
  monthlyPriceValue = signal<number>(0);
  showDescriptionEditor = signal<boolean>(false);
  discountType = signal<'percentage' | 'amount'>('percentage');

  planForm = signal<FormGroup<any>>(
    this.fb.group<any>({
      title: this.fb.control<string | null>(null, [Validators.required]),
      monthlyPrice: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      description: this.fb.control<string | null>(null),
      benefits: this.fb.control<string[] | null>([]),
      annualSubscription: this.fb.control<boolean | null>(false),
      discountPercentage: this.fb.control<number | null>(10),
      discountType: this.fb.control<'percentage' | 'amount' | null>('percentage'),
      annualPrice: this.fb.control<number | null>(null),
      selectedEvents: this.fb.control<string[] | null>([]),
      planType: this.fb.control<'event' | 'sponsor' | null>('sponsor', [Validators.required])
    })
  );

  benefits = signal<any[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);

  events = signal<any[]>([
    {
      id: '1',
      title: 'Atlanta Makes Me Laugh',
      date: '2024-09-12',
      dayOfWeek: 'Fri',
      day: '12',
      location: 'Atlanta, GA',
      time: '12:00PM - 02:30PM',
      organization: 'Networked AI',
      image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '2',
      title: 'Networking Event',
      date: '2024-09-27',
      dayOfWeek: 'Fri',
      day: '27',
      location: 'Atlanta, GA',
      time: '10:00AM - 12:00PM',
      organization: 'Networked AI',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: '3',
      title: 'Tech Meetup',
      date: '2024-10-05',
      dayOfWeek: 'Sat',
      day: '5',
      location: 'Atlanta, GA',
      time: '2:00PM - 4:00PM',
      organization: 'Networked AI',
      image: 'https://images.unsplash.com/photo-1444840535719-195841cb6e2b?auto=format&fit=crop&w=800&q=80'
    }
  ]);

  isCustomize = computed(() => this.showDescriptionEditor());
  stepHeading = computed(() => {
    const step = this.currentStep();
    switch (step) {
      case 1:
        return 'Plan Details';
      case 2:
        return 'Include Events';
      case 3:
        return 'Preview';
      default:
        return 'Plan Details';
    }
  });

  buttonLabel = computed(() => {
    const step = this.currentStep();
    const selectedCount = this.selectedEvents().length;
    switch (step) {
      case 1:
        return 'Next';
      case 2:
        return selectedCount > 0 ? `Next (${selectedCount})` : 'Next';
      case 3:
        return 'Launch';
      default:
        return 'Next';
    }
  });

  clearButtonLabel = computed(() => {
    const count = this.selectedEvents().length;
    return count > 0 ? 'Clear Selection' : 'Skip for Now';
  });

  isNextButtonDisabled = computed(() => {
    return this.currentStep() === 2 && this.selectedEvents().length === 0;
  });

  primaryButton = computed(() => {
    const step = this.currentStep();
    const hasIcon = step === 3;
    const planType = this.planForm().get('planType')?.value;
    const iconPath = hasIcon ? (planType === 'sponsor' ? 'assets/svg/launch-black.svg' : 'assets/svg/launch.svg') : '';
    return {
      label: this.buttonLabel(),
      icon: iconPath,
      disabled: step === 2 ? this.isNextButtonDisabled() : false,
      clickHandler: () => this.handleButtonClick(),
      customColor: planType === 'event' ? '#2B5BDE' : undefined
    };
  });

  secondaryButton = computed(() => {
    const step = this.currentStep();
    return {
      label: step === 1 ? 'Cancel' : step === 2 ? this.clearButtonLabel() : 'Edit',
      icon: step === 3 ? 'assets/svg/editIconBlack.svg' : '',
      color: 'secondary' as const,
      clickHandler: step === 1 ? () => this.previousStep() : step === 2 ? () => this.handleClearButtonClick() : () => this.currentStep.set(1)
    };
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

  bannerColors = computed(() => {
    const planType = this.planForm().get('planType')?.value;
    if (planType === 'event') {
      return {
        border: '#2B5BDE',
        background: '#EFF6FF',
        badge: '#2B5BDE'
      };
    }
    return {
      border: '#F5BC61',
      background: '#FFFBEB',
      badge: '#F5BC61'
    };
  });

  isSponsorPlan = computed(() => {
    return this.planForm().get('planType')?.value === 'sponsor';
  });

  readonly SPONSOR_GRADIENT = 'linear-gradient(90deg, #9E8F76 0%, #7A6A50 14.28%, #F6D9AB 24.09%, #9D7F4E 40.5%, #C9A770 60.46%, #796A52 86.52%)';

  discountTypeOptions = computed(() => {
    return [
      {
        type: 'percentage' as const,
        badgeText: `${this.discountPercentage()}% OFF!`,
        label: 'Show % Discount',
        inputId: 'discount-percentage'
      },
      {
        type: 'amount' as const,
        badgeText: `SAVE $${Math.round(this.amountSaved())}!`,
        label: 'Show Amount Saved',
        inputId: 'discount-amount'
      }
    ];
  });

  ngOnInit(): void {
    this.planForm()
      .get('monthlyPrice')
      ?.valueChanges.subscribe((value) => {
        this.monthlyPriceValue.set(value || 0);
      });

    this.planForm()
      .get('discountPercentage')
      ?.valueChanges.subscribe((value) => {
        this.discountValue.set(value || 0);
      });

    this.planForm()
      .get('title')
      ?.valueChanges.subscribe((value) => {
        this.titleValue.set(value || '');
      });

    this.planForm()
      .get('discountType')
      ?.valueChanges.subscribe((value) => {
        if (value === 'percentage' || value === 'amount') {
          this.discountType.set(value);
        }
      });

    const form = this.planForm();
    this.monthlyPriceValue.set(form.get('monthlyPrice')?.value || 0);
    this.discountValue.set(form.get('discountPercentage')?.value || 10);
    this.titleValue.set(form.get('title')?.value || '');

    const formSelectedEvents = form.get('selectedEvents')?.value || [];
    this.selectedEvents.set(formSelectedEvents);

    const formDiscountType = form.get('discountType')?.value;
    if (formDiscountType === 'percentage' || formDiscountType === 'amount') {
      this.discountType.set(formDiscountType);
    }
  }

  getBannerBorderStyle(discountType: 'percentage' | 'amount', isSelected: boolean): string {
    if (this.isSponsorPlan()) {
      return isSelected ? this.SPONSOR_GRADIENT : '#D1D5DB';
    }
    return isSelected ? this.bannerColors().border : '#D1D5DB';
  }

  getBannerBadgeStyle(): string {
    return this.isSponsorPlan() ? this.SPONSOR_GRADIENT : this.bannerColors().badge;
  }

  isAnnualSubscriptionEnabled = computed(() => {
    const title = this.titleValue();
    const monthlyPrice = this.monthlyPriceValue();
    const titleValid = title && title.trim().length > 0;
    const priceValid = monthlyPrice > 0;
    return titleValid && priceValid;
  });

  groupedEvents = computed(() => {
    const events = this.events();
    const grouped: { [key: string]: Event[] } = {};

    events.forEach((event) => {
      const date = new Date(event.date);
      const month = date.toLocaleString('default', { month: 'long' });
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(event);
    });

    return grouped;
  });

  groupedEventsKeys = computed(() => {
    return Object.keys(this.groupedEvents());
  });

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    } else {
      this.navCtrl.back();
    }
  }

  nextStep(): void {
    const step = this.currentStep();
    if (step === 1) {
      const form = this.planForm();
      if (!form.get('title')?.valid || !form.get('monthlyPrice')?.valid) {
        form.get('title')?.markAsTouched();
        form.get('monthlyPrice')?.markAsTouched();
        return;
      }
      this.currentStep.set(2);
    } else if (step === 2) {
      this.currentStep.set(3);
    }
  }

  handleButtonClick(): void {
    const step = this.currentStep();
    if (step === 3) {
      this.launchPlan();
    } else {
      this.nextStep();
    }
  }

  addBenefit(): void {
    const newBenefit: any = {
      id: Date.now().toString(),
      text: ''
    };
    this.benefits.set([...this.benefits(), newBenefit]);
  }

  removeBenefit(index: number): void {
    const updated = this.benefits().filter((_, i) => i !== index);
    this.benefits.set(updated);
    this.planForm().patchValue({ benefits: updated.map((b) => b.text) });
  }

  updateBenefit(index: number, text: string): void {
    const updated = [...this.benefits()];
    updated[index] = { ...updated[index], text };
    this.benefits.set(updated);
    this.planForm().patchValue({ benefits: updated.map((b) => b.text) });
  }

  toggleEventSelection(eventId: string): void {
    const selected = this.selectedEvents();
    const index = selected.indexOf(eventId);

    let newSelected: string[];
    if (index > -1) {
      newSelected = selected.filter((id) => id !== eventId);
    } else {
      newSelected = [...selected, eventId];
    }

    this.selectedEvents.set(newSelected);
    this.planForm().patchValue({ selectedEvents: newSelected });
  }

  clearSelection(): void {
    this.selectedEvents.set([]);
    this.planForm().patchValue({ selectedEvents: [] });
  }

  handleClearButtonClick(): void {
    if (this.selectedEvents().length > 0) {
      this.clearSelection();
    } else {
      this.nextStep();
    }
  }

  setDiscount(percentage: number): void {
    const form = this.planForm();
    const control = form.get('discountPercentage');
    if (control) {
      control.setValue(percentage);
      control.markAsTouched();
      this.discountValue.set(percentage);
    }
  }

  setDiscountType(type: 'percentage' | 'amount'): void {
    this.discountType.set(type);
    this.planForm().patchValue({ discountType: type });
  }

  getFieldValue(fieldName: string): any {
    return this.planForm().get(fieldName)?.value;
  }

  launchPlan(): void {
    this.isLaunching.set(true);
    setTimeout(() => {
      this.isLaunching.set(false);
      const planType = this.planForm().get('planType')?.value;
      const color = planType === 'event' ? '#2B5BDE' : '#F5BC61';
      this.modalService.openConfirmModal({
        title: 'Subscription Published!',
        description: 'Your subscription plan is now live!',
        confirmButtonLabel: 'Done',
        cancelButtonLabel: 'Share',
        confirmButtonColor: 'primary',
        icon: 'assets/svg/launch.svg',
        iconBgColor: color,
        customColor: color
      });
    }, 3000);
  }

  handleGenerateClick(): void {
    if (this.showDescriptionEditor()) {
      this.openAIPromptModal();
    } else {
      this.generateDescription();
    }
  }

  generateDescription(): void {
    const form = this.planForm();
    const descriptionControl = form.get('description');

    if (descriptionControl) {
      const generatedDescription = 'This is a generated plan description. You can customize this content to better match your plan details.';
      descriptionControl.setValue(generatedDescription);
      descriptionControl.markAsTouched();
      this.showDescriptionEditor.set(true);
    }
  }

  async openAIPromptModal(): Promise<void> {
    const data = await this.modalService.openAIPromptModal(this.conversation());

    if (data) {
      if (data.type === 'value' && data.data) {
        const form = this.planForm();
        const descriptionControl = form.get('description');
        if (descriptionControl) {
          descriptionControl.setValue(data.data);
          descriptionControl.markAsTouched();
        }
      } else if (data.type === 'data' && data.data) {
        this.conversation.set(data.data);
      }
    }
  }

  reorderBenefits(event: CustomEvent<ItemReorderEventDetail>): void {
    const benefits = [...this.benefits()];
    const movedItem = benefits.splice(event.detail.from, 1)[0];
    benefits.splice(event.detail.to, 0, movedItem);
    this.benefits.set(benefits);
    this.planForm().patchValue({ benefits: benefits.map((b) => b.text) });
    event.detail.complete();
  }
}
