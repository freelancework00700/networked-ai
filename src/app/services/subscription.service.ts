import { Injectable, signal, inject } from '@angular/core';
import { BaseApiService } from '@/services/base-api.service';
import { SubscriptionPlan } from '@/interfaces/event';
import { AuthService } from '@/services/auth.service';

export interface SubscriptionPlanApiResponse {
  success?: boolean;
  message?: string;
  data?: Array<{
    id: string;
    name: string;
    description?: string;
    plan_benefits?: string[];
    is_sponsor: boolean;
    active: boolean;
    prices: Array<{
      id: string;
      amount: string;
      interval: 'month' | 'year';
      active: boolean;
    }>;
    events?: any[];
    total_subscribers: number;
    event_ids?: string[];
  }>;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService extends BaseApiService {
  private authService = inject(AuthService);
  plans = signal<SubscriptionPlan[]>([]);

  /**
   * Fetch subscription plans from API for current user
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const currentUser = this.authService.currentUser();
      if (!currentUser?.id) {
        console.warn('No current user found, cannot fetch subscription plans');
        this.plans.set([]);
        return [];
      }

      const response: any = await this.get<SubscriptionPlanApiResponse>(`/subscription/plan/user/${currentUser.id}`);
      
      // Extract plans from response
      const plansData = response?.data || [];

      if (!Array.isArray(plansData) || plansData.length === 0) {
        console.warn('No subscription plans found');
        this.plans.set([]);
        return [];
      }

      // Transform to SubscriptionPlan format
      const plans: SubscriptionPlan[] = plansData.map((plan) => {
        const priceRange = this.formatPriceRange(plan.prices || []);
        
        return {
          product_id: plan.id,
          name: plan.name,
          description: plan.description,
          type: plan.is_sponsor ? 'sponsor' : 'event',
          is_sponsor: plan.is_sponsor,
          active: plan.active,
          subscribers: plan.total_subscribers || 0,
          priceRange: priceRange,
          plan_benefits: plan.plan_benefits
        };
      });

      this.plans.set(plans);
      return plans;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  /**
   * Format price range from prices array
   */
  private formatPriceRange(prices: Array<{ amount: string; interval: string }>): string {
    if (prices.length === 0) return '';
    
    const monthlyPrice = prices.find(p => p.interval === 'month');
    const yearlyPrice = prices.find(p => p.interval === 'year');

    const parts: string[] = [];
    
    if (monthlyPrice) {
      parts.push(`$${parseFloat(monthlyPrice.amount).toFixed(0)}/m`);
    }
    
    if (yearlyPrice) {
      parts.push(`$${parseFloat(yearlyPrice.amount).toFixed(0)}/y`);
    }

    return parts.join(' / ') || '';
  }
}
