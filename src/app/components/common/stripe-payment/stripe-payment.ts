import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { environment } from 'src/environments/environment';
import { ModalController } from '@ionic/angular/standalone';
import { StripeElementsOptions, StripePaymentElementOptions } from '@stripe/stripe-js';
import { StripePaymentSuccessEvent, StripePaymentErrorEvent } from '@/services/stripe.service';
import { injectStripe, StripePaymentElementComponent, StripeElementsDirective } from 'ngx-stripe';
import { output, signal, computed, effect, inject, Component, ViewChild, ChangeDetectionStrategy, Input } from '@angular/core';
@Component({
  selector: 'app-stripe-payment',
  styleUrl: './stripe-payment.scss',
  templateUrl: './stripe-payment.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, StripeElementsDirective, StripePaymentElementComponent, Button]
})
export class StripePaymentComponent {
  @ViewChild(StripePaymentElementComponent)
  paymentElement!: StripePaymentElementComponent;

  stripe = injectStripe(environment.stripePublishableKey);
  modalCtrl = inject(ModalController);

  // Inputs
  @Input() clientSecretInput = '';
  @Input() showButtons = false;
  @Input() isModalMode = false;

  paymentSuccess = output<StripePaymentSuccessEvent>();
  paymentError = output<StripePaymentErrorEvent>();
  paymentProcessing = output<boolean>();

  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  clientSecret = signal<string>('');
  stripePaymentIntentId = signal<string>('');
  isProcessingPayment = signal<boolean>(false);

  // Computed signal for elementsOptions that updates when clientSecret changes
  elementsOptions = computed<StripeElementsOptions | null>(() => {
    const secret = this.clientSecret();
    if (!secret || secret.trim() === '') {
      return null;
    }
    return {
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
            border: '1px solid #c73838'
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
      },
      clientSecret: secret
    };
  });

  paymentElementOptions: StripePaymentElementOptions = {
    layout: {
      type: 'tabs',
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: false
    }
  };

  constructor() {
    effect(() => {
      const secret = this.clientSecretInput;
      if (secret && secret.trim() !== '') {
        this.clientSecret.set(secret);
      } else {
        this.clientSecret.set('');
      }
    });
  }

  getPaymentIntentId(): string {
    return this.stripePaymentIntentId();
  }

  async processPayment(billingDetails?: { name: string; email: string }): Promise<boolean> {
    if (!this.paymentElement || !this.paymentElement.elements) {
      this.errorMessage.set('Payment element is not ready');
      return false;
    }

    if (this.isLoading() || this.isProcessingPayment()) {
      return false;
    }

    this.isProcessingPayment.set(true);
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
              this.isProcessingPayment.set(false);
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
                  // Store payment intent ID from the result
                  if (result.paymentIntent.id) {
                    this.stripePaymentIntentId.set(result.paymentIntent.id);
                  }
                  this.paymentSuccess.emit({
                    success: true,
                    paymentIntentId: result.paymentIntent.id,
                    paymentIntent: result.paymentIntent
                  });
                  if (this.isModalMode) {
                    this.modalCtrl.dismiss({ success: true }, 'success');
                  }
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
              this.isProcessingPayment.set(false);
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
      this.isProcessingPayment.set(false);
      this.paymentProcessing.emit(false);
      this.paymentError.emit({
        success: false,
        error: error?.message || 'An unexpected error occurred'
      });
      return false;
    }
  }

  async closeModal(): Promise<void> {
    await this.modalCtrl.dismiss(null, 'cancel');
  }
}
