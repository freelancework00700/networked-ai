import { Routes } from '@angular/router';
import { SubscriptionPlans } from '@/pages/subscription-plans/subscription-plans';
import { CreatePlan } from '@/pages/subscription-plans/create-plan/create-plan';
import { MySubscriptions } from '@/pages/subscription-plans/my-subscriptions/my-subscriptions';
import { UserSubscriptionPlans } from '@/pages/subscription-plans/user-subscription-plans';

export default [
  { path: '', component: SubscriptionPlans },
  { path: 'create', component: CreatePlan },
  { path: 'edit/:id', component: CreatePlan },
  { path: 'list', component: MySubscriptions },
  { path: 'plans', component: SubscriptionPlans },
  { path: 'user/:userId', component: UserSubscriptionPlans },
  { path: ':planId', component: UserSubscriptionPlans },
] as Routes;
