import { Routes } from '@angular/router';
import { PlanEvents } from '@/pages/subscription-plans/plan-events';
import { ManagePlan } from '@/pages/subscription-plans/manage-plan';
import { PlanSubscribers } from '@/pages/subscription-plans/plan-subscribers';
import { CreatePlan } from '@/pages/subscription-plans/create-plan/create-plan';
import { SubscriptionPlans } from '@/pages/subscription-plans/subscription-plans';
import { UserSubscriptionPlans } from '@/pages/subscription-plans/user-subscription-plans';
import { MySubscriptions } from '@/pages/subscription-plans/my-subscriptions/my-subscriptions';

export default [
  { path: 'create', component: CreatePlan },
  { path: '', component: MySubscriptions },
  { path: 'plans', component: SubscriptionPlans },
  { path: 'manage/:planId', component: ManagePlan },
  { path: ':planId/events', component: PlanEvents },
  { path: ':planId/subscribers', component: PlanSubscribers },
  { path: 'user/:userId', component: UserSubscriptionPlans },
  { path: ':planId', component: UserSubscriptionPlans }
] as Routes;
