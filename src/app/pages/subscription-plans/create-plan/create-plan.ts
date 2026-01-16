import { IEvent } from '@/interfaces/event';
import { CommonModule } from '@angular/common';
import { Chip } from '@/components/common/chip';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@/components/form/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '@/services/auth.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { EventService } from '@/services/event.service';
import { ModalService } from '@/services/modal.service';
import { NavController } from '@ionic/angular/standalone';
import { TextInput } from '@/components/form/text-input';
import { ToasterService } from '@/services/toaster.service';
import { NumberInput } from '@/components/form/number-input';
import { ToggleInput } from '@/components/form/toggle-input';
import { TextAreaInput } from '@/components/form/text-area-input';
import { SubscriptionService } from '@/services/subscription.service';
import { PlanPreview } from '@/pages/subscription-plans/plan-preview';
import { SubscriptionEventCard } from '@/components/card/subscription-event-card';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Component, computed, inject, signal, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Input } from '@angular/core';
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
  @Input() planId?: string; // For editing existing plan
  SPONSOR_GRADIENT = 'linear-gradient(90deg, #9E8F76 0%, #7A6A50 14.28%, #F6D9AB 24.09%, #9D7F4E 40.5%, #C9A770 60.46%, #796A52 86.52%)';

  fb = inject(FormBuilder);
  navCtrl = inject(NavController);
  cdr = inject(ChangeDetectorRef);
  modalService = inject(ModalService);
  subscriptionService = inject(SubscriptionService);
  toasterService = inject(ToasterService);
  eventService = inject(EventService);
  authService = inject(AuthService);
  route = inject(ActivatedRoute);

  nameValue = signal<string>('');
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
      name: this.fb.control<string | null>(null, [Validators.required]),
      monthlyPrice: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      description: this.fb.control<string | null>(null),
      plan_benefits: this.fb.control<string[] | null>([]),
      annualSubscription: this.fb.control<boolean | null>(false),
      discountPercentage: this.fb.control<number | null>(10),
      discountType: this.fb.control<'percentage' | 'amount' | null>('percentage'),
      annualPrice: this.fb.control<number | null>(null),
      event_ids: this.fb.control<string[] | null>([]),
      is_sponsor: this.fb.control<boolean | null>(true, [Validators.required])
    })
  );

  benefits = signal<any[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);

  events = signal<Event[]>([]);
  isLoadingEvents = signal<boolean>(false);

  isCustomize = computed(() => this.showDescriptionEditor());
  stepHeading = computed(() => {
    const step = this.currentStep();
    switch (step) {
      case 1:
        return this.isSponsorPlan() ? 'Sponsorship Plan Details' : 'Plan Details';
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
    const isSponsor = this.planForm().get('is_sponsor')?.value ?? true;
    const iconPath = hasIcon ? (isSponsor ? 'assets/svg/launch-black.svg' : 'assets/svg/launch.svg') : '';
    return {
      label: this.buttonLabel(),
      icon: iconPath,
      disabled: step === 2 ? this.isNextButtonDisabled() : false,
      clickHandler: () => this.handleButtonClick(),
      customColor: !isSponsor ? '#2B5BDE' : undefined
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
    const isSponsor = this.planForm().get('is_sponsor')?.value ?? true;
    if (!isSponsor) {
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
    return this.planForm().get('is_sponsor')?.value ?? true;
  });

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

  async ngOnInit(): Promise<void> {
    // Read route parameters and query parameters
    const planIdFromRoute = this.route.snapshot.paramMap.get('id');
    const isSponsorParam = this.route.snapshot.queryParamMap.get('is_sponsor');
    const planIdParam = this.route.snapshot.queryParamMap.get('planId');
    
    // Use route param first, then query param for backward compatibility
    const planId = planIdFromRoute || planIdParam;
    
    // If planId is provided, load plan data for edit mode
    if (planId) {
      this.planId = planId;
      await this.loadPlanData(planId);
    } else if (isSponsorParam !== null) {
      // Only set is_sponsor if not in edit mode
      const isSponsor = isSponsorParam === 'true';
      this.planForm().patchValue({ is_sponsor: isSponsor });
    }

    // Load current user's events
    await this.loadEvents();

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
      .get('name')
      ?.valueChanges.subscribe((value) => {
        this.nameValue.set(value || '');
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
    this.nameValue.set(form.get('name')?.value || '');

    const formSelectedEvents = form.get('event_ids')?.value || [];
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
    const name = this.nameValue();
    const monthlyPrice = this.monthlyPriceValue();
    const nameValid = name && name.trim().length > 0;
    const priceValid = monthlyPrice > 0;
    return nameValid && priceValid;
  });

  groupedEvents = computed(() => {
    const events = this.events();
    const grouped: { [key: string]: Event[] } = {};

    events.forEach((event) => {
      if (!event.date) return; // Skip events without dates

      const date = new Date(event.date);
      if (isNaN(date.getTime())) return; // Skip invalid dates

      const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(event);
    });

    // Sort events within each month by date
    Object.keys(grouped).forEach((month) => {
      grouped[month].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });
    });

    return grouped;
  });

  /**
   * Transform IEvent from API to Event format for subscription-event-card
   */
  private transformEventToSubscriptionEvent(event: IEvent): Event {
    if (!event.start_date) {
      // Return empty event if no start date
      return {
        id: event.id || '',
        title: event.title || '',
        date: '',
        dayOfWeek: '',
        day: '',
        location: this.formatLocation(event),
        time: '',
        organization: this.getOrganization(event),
        image: this.getEventImage(event)
      };
    }

    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : null;

    // Format day of week (e.g., "Fri") using EventService approach
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[startDate.getDay()];

    // Format day (e.g., "12")
    const day = startDate.getDate().toString();

    // Format date string using ISO format
    const dateStr = startDate.toISOString().split('T')[0];

    // Format time range using EventService formatDateTime approach
    const startTime = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    let timeStr = startTime;
    if (endDate) {
      const endTime = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      timeStr = `${startTime} - ${endTime}`;
    }

    return {
      id: event.id || '',
      title: event.title || '',
      date: dateStr,
      dayOfWeek,
      day,
      location: this.formatLocation(event),
      time: timeStr,
      organization: this.getOrganization(event),
      image: this.getEventImage(event)
    };
  }

  /**
   * Format location from event data using EventService
   */
  private formatLocation(event: IEvent): string {
    const formatted = this.eventService.formatLocation(event.address, event.city, event.state, event.country);
    return formatted !== 'Location not specified' ? formatted : 'Location TBD';
  }

  /**
   * Get organization name from event participants
   */
  private getOrganization(event: IEvent): string {
    const hostParticipant = event.participants?.find((p) => p.role === 'Host');
    return hostParticipant?.user?.name || 'Networked AI';
  }

  /**
   * Get event image URL with fallback
   */
  private getEventImage(event: IEvent): string {
    return event.thumbnail_url || event.medias?.[0]?.media_url || event.medias?.[0]?.url || 'assets/images/profile.jpeg';
  }

  /**
   * Load plan data for edit mode
   */
  async loadPlanData(planId: string): Promise<void> {
    try {
      const planData = await this.subscriptionService.getPlanById(planId);

      if (!planData) {
        this.toasterService.showError('Plan not found');
        this.navCtrl.back();
        return;
      }

      const form = this.planForm();

      // Set basic plan information
      form.patchValue({
        name: planData.name || '',
        description: planData.description || '',
        is_sponsor: planData.is_sponsor ?? false
      });

      // Extract prices
      const prices = planData.prices || [];
      const monthlyPrice = prices.find((p: any) => p.interval === 'month');
      const yearlyPrice = prices.find((p: any) => p.interval === 'year');

      if (monthlyPrice) {
        const monthlyAmount = parseFloat(monthlyPrice.amount) || 0;
        form.patchValue({ monthlyPrice: monthlyAmount });
        this.monthlyPriceValue.set(monthlyAmount);
      }

      // Calculate discount if annual price exists
      if (monthlyPrice && yearlyPrice) {
        const monthlyAmount = parseFloat(monthlyPrice.amount) || 0;
        const yearlyAmount = parseFloat(yearlyPrice.amount) || 0;
        const annualBase = monthlyAmount * 12;
        const discount = annualBase - yearlyAmount;
        const discountPercentage = annualBase > 0 ? (discount / annualBase) * 100 : 0;

        form.patchValue({
          annualSubscription: true,
          annualPrice: yearlyAmount,
          discountPercentage: Math.round(discountPercentage),
          discountType: 'percentage'
        });
        this.discountValue.set(Math.round(discountPercentage));
      }

      // Set plan benefits
      const planBenefits = planData.plan_benefits || [];
      if (planBenefits.length > 0) {
        const benefitsArray = planBenefits.map((text: string, index: number) => ({
          id: (index + 1).toString(),
          text: text
        }));
        // Ensure at least 2 benefit slots
        while (benefitsArray.length < 2) {
          benefitsArray.push({
            id: (benefitsArray.length + 1).toString(),
            text: ''
          });
        }
        this.benefits.set(benefitsArray);
        form.patchValue({ plan_benefits: planBenefits });
      }

      // Set selected events
      const eventIds = planData.event_ids || [];
      form.patchValue({ event_ids: eventIds });
      this.selectedEvents.set(eventIds);

      // Update name value signal
      this.nameValue.set(planData.name || '');
    } catch (error) {
      console.error('Error loading plan data:', error);
      this.toasterService.showError('Failed to load plan data');
      this.navCtrl.back();
    }
  }

  /**
   * Load current user's events
   */
  async loadEvents(): Promise<void> {
    this.isLoadingEvents.set(true);
    try {
      const response = await this.eventService.getEvents({
        is_my_events: true,
        limit: 100 // Fetch a reasonable number of events
      });

      const apiEvents = response?.data?.data || [];
      const transformedEvents = apiEvents.map((event: IEvent) => this.transformEventToSubscriptionEvent(event));
      this.events.set(transformedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      this.events.set([]);
    } finally {
      this.isLoadingEvents.set(false);
    }
  }

  groupedEventsKeys = computed(() => {
    const grouped = this.groupedEvents();
    const keys = Object.keys(grouped);

    // Sort months chronologically
    return keys.sort((a, b) => {
      // Extract month and year from the key (e.g., "September 2024")
      const dateA = this.parseMonthYear(a);
      const dateB = this.parseMonthYear(b);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  });

  /**
   * Parse month and year string to Date object
   */
  private parseMonthYear(monthYear: string): Date | null {
    try {
      // Try to parse formats like "September 2024" or "September"
      const date = new Date(monthYear + ' 1');
      if (isNaN(date.getTime())) {
        // If that fails, try just the month name (assume current year)
        const date2 = new Date(monthYear + ' 1, ' + new Date().getFullYear());
        return isNaN(date2.getTime()) ? null : date2;
      }
      return date;
    } catch {
      return null;
    }
  }

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
      if (!form.get('name')?.valid || !form.get('monthlyPrice')?.valid) {
        form.get('name')?.markAsTouched();
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
    this.planForm().patchValue({ plan_benefits: updated.map((b) => b.text) });
  }

  updateBenefit(index: number, text: string): void {
    const updated = [...this.benefits()];
    updated[index] = { ...updated[index], text };
    this.benefits.set(updated);
    this.planForm().patchValue({ plan_benefits: updated.map((b) => b.text) });
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
    this.planForm().patchValue({ event_ids: newSelected });
  }

  clearSelection(): void {
    this.selectedEvents.set([]);
    this.planForm().patchValue({ event_ids: [] });
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

  async launchPlan(): Promise<void> {
    const form = this.planForm();

    // Validate form
    if (!form.valid) {
      form.markAllAsTouched();
      return;
    }

    this.isLaunching.set(true);

    try {
      // Get form values and ensure they are numbers
      const monthlyPrice = Number(form.get('monthlyPrice')?.value) || 0;
      const annualSubscription = form.get('annualSubscription')?.value || false;
      const discountPercentage = Number(form.get('discountPercentage')?.value) || 0;

      // Build prices array - ensure amounts are numbers
      const prices: Array<{ amount: number; interval: 'month' | 'year' }> = [
        {
          amount: Number(monthlyPrice),
          interval: 'month'
        }
      ];

      // Add annual price if annual subscription is enabled
      if (annualSubscription) {
        const annualBase = Number(monthlyPrice) * 12;
        const discountAmount = (annualBase * Number(discountPercentage)) / 100;
        const annualPrice = annualBase - discountAmount;
        prices.push({
          amount: Number(annualPrice),
          interval: 'year'
        });
      }

      // Get plan benefits from form
      const planBenefits = this.benefits()
        .map((b) => b.text)
        .filter((text) => text && text.trim().length > 0);

      // Build payload directly from form values
      const formValue = form.getRawValue();
      const payload = {
        name: formValue.name,
        description: formValue.description || '',
        prices,
        is_sponsor: formValue.is_sponsor ?? true,
        plan_benefits: planBenefits,
        event_ids: formValue.event_ids || []
      };

      let response;
      if (this.planId) {
        // Update existing plan
        response = await this.subscriptionService.updatePlan(this.planId, payload);
        this.toasterService.showSuccess(response?.message || 'Plan updated successfully');
      } else {
        // Create new plan
        response = await this.subscriptionService.createPlan(payload);
        this.toasterService.showSuccess(response?.message || 'Plan created successfully');
      }

      const isSponsorValue = this.planForm().get('is_sponsor')?.value ?? true;
      const color = !isSponsorValue ? '#2B5BDE' : '#F5BC61';

      await this.modalService.openConfirmModal({
        title: this.planId ? 'Subscription Updated!' : 'Subscription Published!',
        description: this.planId ? 'Your subscription plan has been updated!' : 'Your subscription plan is now live!',
        confirmButtonLabel: 'Done',
        cancelButtonLabel: 'Share',
        confirmButtonColor: 'primary',
        icon: 'assets/svg/launch.svg',
        iconBgColor: color,
        customColor: color
      });

      // Navigate back after successful creation/update
      this.navCtrl.back();
    } catch (error: any) {
      console.error('Error launching plan:', error);
      const errorMessage = error?.message || (this.planId ? 'Failed to update plan. Please try again.' : 'Failed to create plan. Please try again.');
      this.toasterService.showError(errorMessage);
    } finally {
      this.isLaunching.set(false);
    }
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
    this.planForm().patchValue({ plan_benefits: benefits.map((b) => b.text) });
    event.detail.complete();
  }
}
