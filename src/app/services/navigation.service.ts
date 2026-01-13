import { NavController } from '@ionic/angular/standalone';
import { signal, inject, Injectable } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  // services
  private navCtrl = inject(NavController);

  // signals
  private routerOutlet = signal<IonRouterOutlet | undefined>(undefined);

  setRouterOutlet(outlet: IonRouterOutlet | undefined): void {
    this.routerOutlet.set(outlet);
  }

  private canGoBack(): boolean {
    const outlet = this.routerOutlet();
    return outlet?.canGoBack() ?? false;
  }

  /**
   * Navigates back if possible, otherwise navigates to the fallback route
   * @param fallbackRoute - The route to navigate to if there's no navigation history
   */
  back(fallbackRoute = '/'): void {
    if (this.canGoBack()) {
      this.navCtrl.back();
    } else {
      this.navCtrl.navigateRoot(fallbackRoute, { animated: true, animationDirection: 'back' });
    }
  }

  navigateForward(route: string, replaceUrl = false, state?: any): Promise<boolean> {
    return this.navCtrl.navigateForward(route, {
      replaceUrl,
      animated: true,
      animationDirection: 'forward',
      ...(state && { state })
    });
  }

  navigateBack(route: string, replaceUrl = false): Promise<boolean> {
    return this.navCtrl.navigateBack(route, {
      replaceUrl,
      animated: true,
      animationDirection: 'back'
    });
  }

  navigateRoot(route: string, animationDirection: 'forward' | 'back' = 'forward'): Promise<boolean> {
    return this.navCtrl.navigateRoot(route, {
      animated: true,
      animationDirection
    });
  }
}
