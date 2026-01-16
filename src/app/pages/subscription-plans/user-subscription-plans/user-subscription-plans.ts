import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { ActivatedRoute } from '@angular/router';
import { ModalService } from '@/services/modal.service';
import { EventService } from '@/services/event.service';
import { ToasterService } from '@/services/toaster.service';
import { NavigationService } from '@/services/navigation.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ISubscription } from '@/components/card/subscription-card';
import { PlanData, SubscriptionService } from '@/services/subscription.service';
import { PlanPreview } from '@/pages/subscription-plans/plan-preview/plan-preview';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { IonHeader, IonToolbar, IonContent, IonIcon, NavController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, signal, computed, OnInit, OnDestroy } from '@angular/core';



@Component({
  selector: 'user-subscription-plans',
  templateUrl: './user-subscription-plans.html',
  styleUrl: './user-subscription-plans.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    IonIcon,
    IonHeader,
    IonToolbar,
    IonContent,
    CommonModule,
    PlanPreview,
    SegmentButton,
    ReactiveFormsModule,
  ]
})
export class UserSubscriptionPlans implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private subscriptionService = inject(SubscriptionService);
  private eventService = inject(EventService);
  private toasterService = inject(ToasterService);
  private navCtrl = inject(NavController);
  private route = inject(ActivatedRoute);
  private modalService = inject(ModalService);
  private navigationService = inject(NavigationService);
  isLoading = signal<boolean>(false);
  plans = signal<PlanData[]>([]);
  selectedPlanIndex = signal<number>(0);
  events = signal<any[]>([]);
  selectedPlanInterval = signal<'month' | 'year'>('month');
  planTypeFilter = signal<'event' | 'sponsor'>('event');
  isDropdownOpen = signal<boolean>(false);

  // Computed properties
  filteredPlans = computed(() => {
    const filter = this.planTypeFilter();
    const allPlans = this.plans();
    
    if (filter === 'event') return allPlans.filter(plan => !plan.is_sponsor);
    return allPlans.filter(plan => plan.is_sponsor);
  });

  currentPlan = computed(() => {
    const plansList = this.filteredPlans();
    const index = this.selectedPlanIndex();
    return plansList[index] || null;
  });

  hasMultiplePlans = computed(() => this.filteredPlans().length > 1);

  hasBothPlanTypes = computed(() => {
    const allPlans = this.plans();
    const hasEvent = allPlans.some(p => !p.is_sponsor);
    const hasSponsor = allPlans.some(p => p.is_sponsor);
    return hasEvent && hasSponsor;
  });

  planTabs = computed<SegmentButtonItem[]>(() => {
    return this.filteredPlans().map((plan, index) => ({
      value: index.toString(),
      label: plan.name
    }));
  });

  planForm = computed(() => {
    const plan = this.currentPlan();
    if (!plan) return this.fb.group({});

    const monthlyPrice = plan.prices.find(p => p.interval === 'month');
    const annualPrice = plan.prices.find(p => p.interval === 'year');

    return this.fb.group({
      name: [plan.name],
      description: [plan.description || ''],
      monthlyPrice: [monthlyPrice ? parseFloat(monthlyPrice.amount) : 0],
      annualSubscription: [!!annualPrice],
      discountPercentage: [0],
      discountType: ['percentage'],
      is_sponsor: [plan.is_sponsor],
      plan_benefits: [plan.plan_benefits || []],
      event_ids: [plan.event_ids || []]
    });
  });

  benefits = computed(() => {
    const plan = this.currentPlan();
    if (!plan || !plan.plan_benefits) return [];
    return plan.plan_benefits.map((text, index) => ({
      id: `benefit-${index}`,
      text
    }));
  });

  selectedEvents = computed(() => {
    const plan = this.currentPlan();
    return plan?.event_ids || [];
  });

  // Get events from current plan (they're included in API response)
  currentPlanEvents = computed(() => {
    const plan = this.currentPlan();
    if (!plan || !plan.events) return [];
    // Transform events to the format expected by plan-preview
    return plan.events.map(event => this.transformEventForPlanPreview(event));
  });

  // Get actual annual price from prices array
  annualPriceValue = computed(() => {
    const plan = this.currentPlan();
    if (!plan) return 0;
    const annualPrice = plan.prices.find(p => p.interval === 'year');
    return annualPrice ? parseFloat(annualPrice.amount) : 0;
  });

  // Get selected price based on interval
  selectedPriceValue = computed(() => {
    const interval = this.selectedPlanInterval();
    if (interval === 'year') {
      return this.annualPriceValue();
    }
    return this.monthlyPriceValue();
  });

  // Check if annual subscription is available
  hasAnnualSubscription = computed(() => {
    const plan = this.currentPlan();
    return plan ? !!plan.prices.find(p => p.interval === 'year') : false;
  });

  monthlyPriceValue = computed(() => {
    const plan = this.currentPlan();
    if (!plan) return 0;
    const monthlyPrice = plan.prices.find(p => p.interval === 'month');
    return monthlyPrice ? parseFloat(monthlyPrice.amount) : 0;
  });

  discountValue = computed(() => {
    const plan = this.currentPlan();
    if (!plan) return 0;
    const monthlyPrice = plan.prices.find(p => p.interval === 'month');
    const annualPrice = plan.prices.find(p => p.interval === 'year');
    if (!monthlyPrice || !annualPrice) return 0;
    const annualBase = parseFloat(monthlyPrice.amount) * 12;
    const annualActual = parseFloat(annualPrice.amount);
    const discount = ((annualBase - annualActual) / annualBase) * 100;
    return Math.round(discount);
  });

  discountType = computed(() => {
    return 'percentage' as 'percentage' | 'amount';
  });

  planType = computed(() => {
    const plan = this.currentPlan();
    return plan?.is_sponsor ? 'sponsor' : 'event';
  });

  selectedTabValue = computed(() => {
    return this.selectedPlanIndex().toString();
  });

  // Get selected price ID based on selected interval
  currentPriceId = computed(() => {
    const plan = this.currentPlan();
    if (!plan) return '';
    const interval = this.selectedPlanInterval();
    const price = plan.prices.find(p => p.interval === interval);
    return price?.id || '';
  });

  // Get selected price value for display
  displayPriceValue = computed(() => {
    const interval = this.selectedPlanInterval();
    if (interval === 'year') {
      return this.annualPriceValue();
    }
    return this.monthlyPriceValue();
  });

  // Get selected price period for display
  displayPricePeriod = computed(() => {
    const interval = this.selectedPlanInterval();
    return interval === 'year' ? '/year' : '/month';
  });

  // Get current subscription (first one from subscriptions array)
  currentSubscription = computed(() => {
    const plan = this.currentPlan();
    if (!plan) return null;
    const interval = this.selectedPlanInterval();
    const price = plan.prices.find(p => p.interval === interval);
    if (!price || !price.subscriptions || price.subscriptions.length === 0) return null;
    return price.subscriptions[0];
  });

  // Check if current selected price has an active subscription
  hasActiveSubscription = computed(() => {
    const subscription = this.currentSubscription();
    return !!subscription;
  });

  // Check if subscription should be disabled (cancel_at_end_date is true)
  isSubscriptionCanceled = computed(() => {
    const subscription = this.currentSubscription();
    return subscription?.cancel_at_end_date === true;
  });

  // Get current subscription ID for unsubscribe
  currentSubscriptionId = computed(() => {
    const subscription = this.currentSubscription();
    return subscription?.id || null;
  });

  // Transform current plan to ISubscription format for subscription card
  subscriptionCardData = computed<ISubscription | null>(() => {
    const plan = this.currentPlan();
    const subscription = this.currentSubscription();
    if (!plan || !subscription) return null;

    const interval = this.selectedPlanInterval();
    const price = plan.prices.find(p => p.interval === interval);
    if (!price) return null;

    const priceDisplay = `$${parseFloat(price.amount).toFixed(2)} /${interval === 'year' ? 'y' : 'm'}`;
    const endDate = subscription.end_date ? new Date(subscription.end_date) : null;

    // For creator name, we'll use a placeholder since owner info isn't in plan data
    // In a real scenario, you might want to fetch owner details by owner_id
    const creatorName = 'Plan Creator'; // TODO: Fetch owner name from owner_id if needed

    return {
      id: subscription.id,
      type: plan.is_sponsor ? 'sponsor' : 'event',
      planName: plan.name || 'Unknown Plan',
      creatorName: creatorName,
      renewDate: endDate,
      price: priceDisplay
    } as ISubscription;
  });

  // Get subscription end date
  subscriptionEndDate = computed(() => {
    const subscription = this.currentSubscription();
    return subscription?.end_date || null;
  });

  // Format end date for display
  formattedEndDate = computed(() => {
    const endDate = this.subscriptionEndDate();
    if (!endDate) return '';
    const date = new Date(endDate);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  });

  dropdownOptions = computed(() => {
    const allPlans = this.plans();
    const currentFilter = this.planTypeFilter();
    const options: Array<{
      type: 'event' | 'sponsor';
      label: string;
      iconClass: string;
      iconSrc?: string;
      checkColor: string;
      isActive: boolean;
    }> = [];

    if (allPlans.some(p => !p.is_sponsor)) {
      options.push({
        type: 'event',
        label: 'Show Event Subscription Plans',
        iconClass: 'pi pi-crown text-white text-xl',
        checkColor: '#2b5bde',
        isActive: currentFilter === 'event'
      });
    }

    if (allPlans.some(p => p.is_sponsor)) {
      options.push({
        type: 'sponsor',
        label: 'Show Sponsor Subscription Plans',
        iconClass: '',
        iconSrc: '/assets/svg/subscription/sponsorIcon.svg',
        checkColor: '#f5bc61',
        isActive: currentFilter === 'sponsor'
      });
    }

    return options;
  });


  async ngOnInit(): Promise<void> {
    const planId = this.route.snapshot.paramMap.get('planId');
    if (planId) {
      // Load plan by ID using API
      await this.loadPlanById(planId);
    } else {
      const userId = this.route.snapshot.paramMap.get('userId');
      if (!userId) {
        this.toasterService.showError('User ID or Plan ID is required');
        this.navCtrl.back();
        return;
      }
      await this.loadPlans(userId);
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  private handleClickOutside = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-container')) {
      this.isDropdownOpen.set(false);
    }
  };

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleClickOutside);
  }

  async loadPlanById(planId: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const planData = await this.subscriptionService.getPlanById(planId);
      if (!planData) {
        this.toasterService.showError('Subscription plan not found');
        this.navCtrl.back();
        return;
      }
      
      // Transform to PlanData format
      const transformedPlan: PlanData = {
        id: planData.id || '',
        name: planData.name || '',
        description: planData.description || '',
        plan_benefits: planData.plan_benefits || [],
        is_sponsor: planData.is_sponsor || false,
        active: planData.active !== false,
        prices: (planData.prices || []).map((price: any) => ({
          id: price.id || '',
          amount: price.amount || '0.00',
          interval: price.interval || 'month',
          active: price.active !== false,
          subscriptions: price.subscriptions || []
        })),
        events: planData.events || [],
        total_subscribers: planData.total_subscribers || 0,
        event_ids: planData.event_ids || []
      };
      
      this.plans.set([transformedPlan]);
      this.selectedPlanIndex.set(0);
      this.planTypeFilter.set(transformedPlan.is_sponsor ? 'sponsor' : 'event');
    } catch (error) {
      console.error('Error loading subscription plan by ID:', error);
      this.toasterService.showError('Failed to load subscription plan');
      this.navCtrl.back();
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadPlans(userId: string): Promise<void> {
    this.isLoading.set(true);
    try {
      const plansData = await this.subscriptionService.getSubscriptionPlansByUserId(userId);
      this.plans.set(plansData as PlanData[] || []);

      if (!plansData || plansData.length === 0) {
        this.toasterService.showError('No subscription plans found');
        this.navCtrl.back();
        return;
      }

      // Events are already included in the API response, no need to fetch separately
    } catch (error) {
      console.error('Error loading subscription plans:', error);
      this.toasterService.showError('Failed to load subscription plans');
      this.navCtrl.back();
    } finally {
      this.isLoading.set(false);
    }
  }


  private transformEventForPlanPreview(event: any): any {
    if (!event.start_date) {
      // Parse address to extract city, state, country
      const addressParts = event.address ? event.address.split(',') : [];
      const city = addressParts.length > 1 ? addressParts[0].trim() : '';
      const state = addressParts.length > 2 ? addressParts[1].trim() : '';
      const country = addressParts.length > 3 ? addressParts[2].trim() : addressParts[addressParts.length - 1]?.trim() || '';
      
      return {
        id: event.id || '',
        title: event.title || '',
        date: '',
        dayOfWeek: '',
        day: '',
        location: this.eventService.formatLocation(event.address, city, state, country),
        time: '',
        organization: 'Networked AI',
        image: event.thumbnail_url || event.image_url || ''
      };
    }

    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : null;

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = daysOfWeek[startDate.getDay()];
    const day = startDate.getDate().toString();
    const dateStr = startDate.toISOString().split('T')[0];

    const startTime = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    let timeStr = startTime;
    if (endDate) {
      const endTime = endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      timeStr = `${startTime} - ${endTime}`;
    }

    // Parse address to extract city, state, country
    const addressParts = event.address ? event.address.split(',') : [];
    const city = addressParts.length > 1 ? addressParts[0].trim() : '';
    const state = addressParts.length > 2 ? addressParts[1].trim() : '';
    const country = addressParts.length > 3 ? addressParts[2].trim() : addressParts[addressParts.length - 1]?.trim() || '';

    return {
      id: event.id || '',
      title: event.title || '',
      date: dateStr,
      dayOfWeek,
      day,
      location: this.eventService.formatLocation(event.address, city, state, country),
      time: timeStr,
      organization: 'Networked AI',
      image: event.thumbnail_url || event.image_url || ''
    };
  }

  onPlanTabChange(value: string): void {
    const index = parseInt(value, 10);
    const filtered = this.filteredPlans();
    if (!isNaN(index) && index >= 0 && index < filtered.length) {
      this.selectedPlanIndex.set(index);
    }
  }

  onPlanTypeFilterChange(filter: 'event' | 'sponsor'): void {
    this.planTypeFilter.set(filter);
    this.selectedPlanIndex.set(0);
    this.isDropdownOpen.set(false);
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  getFilterLabel(): string {
    const filter = this.planTypeFilter();
    if (filter === 'event') return 'Show Event Subscription Plans';
    if (filter === 'sponsor') return 'Show Sponsor Subscription Plans';
    return 'Show All Subscription Plans';
  }

  onPlanSelected(interval: 'annual' | 'monthly'): void {
    const newInterval = interval === 'annual' ? 'year' : 'month';
    // Always update to ensure computed signals refresh
    this.selectedPlanInterval.set(newInterval);
  }

  async subscribe(): Promise<void> {
    const plan = this.currentPlan();
    if (!plan) return;

    const priceId = this.currentPriceId();
    if (!priceId) {
      this.toasterService.showError('Please select a pricing plan');
      return;
    }

    this.isLoading.set(true);
    try {
      const response = await this.subscriptionService.createSubscriptionPaymentIntent(priceId);
      
      if (response?.client_secret) {
        await this.openPaymentModal(response.client_secret, plan.name, response);
      } else {
        this.toasterService.showError('Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      this.toasterService.showError(error?.message || 'Failed to initialize payment');
    } finally {
      this.isLoading.set(false);
    }
  }

  async openPaymentModal(clientSecret: string, planName: string, paymentIntentResponse?: any): Promise<void> {
    const result = await this.modalService.openSubscriptionPaymentModal({
      clientSecret,
      amount: this.displayPriceValue(),
      description: `Subscription to ${planName}`
    });

    if (result?.success) {
      // Store subscription info if available
      if (paymentIntentResponse?.subscription_id) {
        console.log('Subscription ID:', paymentIntentResponse.subscription_id);
        // You can store this subscription_id for future reference
      }
      
      // Get plan ID for sharing
      const plan = this.currentPlan();
      const planId = plan?.id;

      // Open confirmation modal
      const confirmResult = await this.modalService.openConfirmModal({
        iconName: 'pi-check',
        iconBgColor: '#F5BC61',
        title: 'Subscription Confirmed!',
        description: "You'll receive notifications when the host adds new events to the subscription.",
        confirmButtonLabel: 'Done',
        shareButtonLabel: 'Share',
        confirmButtonColor: 'primary',
        iconPosition: 'center',
        onShare: async () => {
          await this.modalService.close();
          if (planId) {
            await this.modalService.openShareModal(planId, 'Event');
          }
        },
        onConfirm: async () => {
          this.navigationService  .back();
        }
      });
    }
  }

  async onUnsubscribe(subscriptionId: string): Promise<void> {
    if (!subscriptionId) return;

    const plan = this.currentPlan();
    const planName = plan?.name || 'this plan';
    const endDate = this.formattedEndDate();

    try {
      const result = await this.modalService.openUnsubscribeConfirmModal({
        planName,
        endDate,
        onConfirm: async () => {
          await this.subscriptionService.cancelSubscription(subscriptionId);
          
          const userId = this.route.snapshot.paramMap.get('userId');
          if (userId) {
            await this.loadPlans(userId);
          }
        }
      });

      if (result?.confirmed) {
        await this.showSubscriptionCancelledModal(endDate);
      }
    } catch (error: any) {
      console.error('Error in unsubscribe flow:', error);
      this.toasterService.showError(error?.message || 'Failed to cancel subscription');
    }
  }

  /**
   * Show subscription cancelled success modal
   */
  private async showSubscriptionCancelledModal(endDate: string): Promise<void> {
    await this.modalService.openConfirmModal({
      iconName: 'pi-check',
      iconBgColor: '#F5BC61',
      title: 'Subscription Cancelled',
      description: `You've cancelled your subscription. You'll still have full access to this plan until the next billing period on ${endDate}.`,
      confirmButtonLabel: 'Done',
      confirmButtonColor: 'primary',
      customColor: '#F5BC61',
      iconPosition: 'center',
      onConfirm: async () => {
        this.navigationService.back();
      }
    });
  }

  back(): void {
    this.navCtrl.back();
  }
}
