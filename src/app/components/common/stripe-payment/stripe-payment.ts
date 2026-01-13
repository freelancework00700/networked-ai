import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { StripeElementsOptions, StripePaymentElementOptions } from '@stripe/stripe-js';
import { injectStripe, StripePaymentElementComponent, StripeElementsDirective } from 'ngx-stripe';
import { StripeService, StripePaymentSuccessEvent, StripePaymentErrorEvent } from '@/services/stripe.service';
import { input, output, signal, inject, Component, ViewChild, ChangeDetectionStrategy, OnInit } from '@angular/core';
@Component({
  selector: 'app-stripe-payment',
  styleUrl: './stripe-payment.scss',
  templateUrl: './stripe-payment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, StripeElementsDirective, StripePaymentElementComponent]
})
export class StripePaymentComponent implements OnInit {
  @ViewChild(StripePaymentElementComponent)
  paymentElement!: StripePaymentElementComponent;

  stripe = injectStripe(environment.stripe_key);
  stripeService = inject(StripeService);

  // Inputs
  amount = input.required<number>();
  currency = input<string>('usd');
  description = input<string>('');
  metadata = input<Record<string, string>>({});
  showBillingAddress = input<boolean>(true);
  requiredBillingAddress = input<boolean>(false);
  
  // Payment Intent inputs
  eventId = input<string>('');
  subtotal = input<number>(0);
  total = input<number>(0);

  // Outputs
  paymentSuccess = output<StripePaymentSuccessEvent>();
  paymentError = output<StripePaymentErrorEvent>();
  paymentProcessing = output<boolean>();

  // State
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  clientSecret = signal<string>('');
  stripePaymentIntentId = signal<string>('');

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
    appearance: {
      theme: 'flat',
      variables: {
        colorPrimary: '#f5bc61',
        colorBackground: '#ffffff',
        colorDanger: '#c73838',
        colorTextSecondary: '#767676',
        colorTextPlaceholder: '#a3a3a3',
        borderRadius: '8px',
        spacingUnit: '4px',
        fontSizeBase: '14px',
        spacingGridRow: '16px'
      },
      rules: {
        '.Input': {
          border: '1px solid #dbdbdb',
          color: '#191919',
          backgroundColor: '#ffffff',
          boxShadow: 'none',
          transition: 'border-color 0.2s ease'
        },
        '.Input:focus': {
          border: '1px solid #191919',
          boxShadow: 'none',
          outline: 'none'
        },
        '.Input:hover': {
          border: '1px solid #191919'
        },
        '.Input--invalid': {
          border: '1px solid #c73838',
        },
        '.Select': {
          border: '1px solid #dbdbdb',
          backgroundColor: '#ffffff'
        },
        '.Select:focus': {
          border: '1px solid #f5bc61',
          boxShadow: 'none'
        }
      }
    }
  };

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: false
    }
  };

  ngOnInit(): void {
    this.fetchPaymentIntent();
  }

  async fetchPaymentIntent(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const response = await this.stripeService.createPaymentIntent({
        event_id: this.eventId(),
        subtotal: this.subtotal(),
        total: this.total()
      });

      if (response?.client_secret) {
        this.clientSecret.set(response.client_secret);
        // Store stripe_payment_intent_id for use in create attendees API
        if (response.stripe_payment_intent_id) {
          this.stripePaymentIntentId.set(response.stripe_payment_intent_id);
        }
        this.elementsOptions = {
          locale: this.elementsOptions.locale,
          appearance: this.elementsOptions.appearance,
          clientSecret: response.client_secret
        };
      } else {
        this.errorMessage.set('Failed to initialize payment');
        this.paymentError.emit({
          success: false,
          error: 'Failed to initialize payment'
        });
      }
    } catch (error: any) {
      console.error('Error fetching payment intent:', error);
      this.errorMessage.set(error?.message || 'Failed to initialize payment');
      this.paymentError.emit({
        success: false,
        error: error?.message || 'Failed to initialize payment'
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  getPaymentIntentId(): string {
    return this.stripePaymentIntentId();
  }

  async processPayment(billingDetails?: { name: string; email: string }): Promise<boolean> {
    if (!this.paymentElement || !this.paymentElement.elements) {
      this.errorMessage.set('Payment element is not ready');
      return false;
    }

    if (this.isLoading()) {
      return false;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.paymentProcessing.emit(true);

    try {
      return new Promise<boolean>((resolve) => {
        this.stripe
          .confirmPayment({
            elements: this.paymentElement.elements,
            confirmParams: {
              payment_method_data: {
                billing_details: {
                  name: billingDetails?.name || '',
                  email: billingDetails?.email || ''
                }
              }
            },
            redirect: 'if_required'
          })
          .subscribe({
            next: (result) => {
              this.isLoading.set(false);
              this.paymentProcessing.emit(false);

              if (result.error) {
                this.errorMessage.set(result.error.message || 'Payment failed');
                this.paymentError.emit({
                  success: false,
                  error: result.error.message || 'Payment failed'
                });
                resolve(false);
              } else {
                if (result.paymentIntent?.status === 'succeeded') {
                  this.paymentSuccess.emit({
                    success: true,
                    paymentIntentId: result.paymentIntent.id,
                    paymentIntent: result.paymentIntent
                  });
                  resolve(true);
                } else {
                  this.errorMessage.set('Payment was not completed');
                  this.paymentError.emit({
                    success: false,
                    error: 'Payment was not completed'
                  });
                  resolve(false);
                }
              }
            },
            error: (error) => {
              console.error('Stripe error:', error);
              this.errorMessage.set(error?.message || 'Payment processing failed');
              this.isLoading.set(false);
              this.paymentProcessing.emit(false);
              this.paymentError.emit({
                success: false,
                error: error?.message || 'Payment processing failed'
              });
              resolve(false);
            }
          });
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      this.errorMessage.set(error?.message || 'An unexpected error occurred');
      this.isLoading.set(false);
      this.paymentProcessing.emit(false);
      this.paymentError.emit({
        success: false,
        error: error?.message || 'An unexpected error occurred'
      });
      return false;
    }
  }
}
