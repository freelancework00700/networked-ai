import { Routes } from '@angular/router';
import { PlanEvents } from '@/pages/subscription-plans/plan-events';
import { ManagePlan } from '@/pages/subscription-plans/manage-plan';
import { PlanSubscribers } from '@/pages/subscription-plans/plan-subscribers';
import { CreatePlan } from '@/pages/subscription-plans/create-plan/create-plan';
import { SubscriptionPlans } from '@/pages/subscription-plans/subscription-plans';
import { UserSubscriptionPlans } from '@/pages/subscription-plans/user-subscription-plans';
import { MySubscriptions } from '@/pages/subscription-plans/my-subscriptions/my-subscriptions';
import { authGuard } from '@/guards/auth.guard';

export default [
  { path: 'create', component: CreatePlan, canActivate: [authGuard] },
  { path: '', component: MySubscriptions, canActivate: [authGuard] },
  { path: 'plans', component: SubscriptionPlans, canActivate: [authGuard] },
  { path: 'manage/:planId', component: ManagePlan, canActivate: [authGuard] },
  { path: ':planId/events', component: PlanEvents, canActivate: [authGuard] },
  { path: ':planId/subscribers', component: PlanSubscribers, canActivate: [authGuard] },
  { path: 'user/:userId', component: UserSubscriptionPlans, canActivate: [authGuard] },
  { path: ':planId', component: UserSubscriptionPlans, canActivate: [authGuard] }
] as Routes;
