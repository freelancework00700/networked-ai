import { Button } from '@/components/form/button';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { signal, inject, Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'onboarding',
  imports: [IonContent, Button],
  styleUrl: './onboarding.scss',
  templateUrl: './onboarding.html'
})
export class Onboarding {
  // services
  navCtrl = inject(NavController);

  // signals
  currentSlide = signal(0);

  // view child
  @ViewChild('swiperContainer') swiperContainer?: ElementRef<HTMLDivElement>;

  goToSlide(index: number) {
    if (index >= 0 && index <= 2 && this.swiperContainer?.nativeElement) {
      this.currentSlide.set(index);
      const container = this.swiperContainer.nativeElement;
      const slideWidth = container.clientWidth;
      container.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
    }
  }

  completeOnboarding() {
    // set onboarded flag in localStorage
    localStorage.setItem('onboarded', 'true');

    // navigate to login page
    this.navCtrl.navigateForward('/login');
  }
}
