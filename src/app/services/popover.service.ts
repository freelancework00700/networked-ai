import { inject, Injectable } from "@angular/core";
import { PopoverController } from "@ionic/angular/standalone";
import { ProfileOptionsPopover } from "@/components/popover/profile-options-popover";
import { AccountSwitcherPopover } from "@/components/popover/account-switcher-popover";

@Injectable({ providedIn: 'root' })
export class PopoverService {
    // services
    private popoverCtrl = inject(PopoverController);

    async openProfileOptionsPopover(event: Event, isViewingOtherProfile: boolean = false, user?: any): Promise<void> {
        const popover = await this.popoverCtrl.create({
            mode: 'md',
            event: event as MouseEvent,
            cssClass: 'common-popover-css',
            component: ProfileOptionsPopover,
            componentProps: {
                isViewingOtherProfile,
                user
            }
        });

        await popover.present();
        await popover.onDidDismiss();
    }

    async openAccountSwitcherPopover(event: Event): Promise<void> {
        const popover = await this.popoverCtrl.create({
            mode: 'md',
            event: event as MouseEvent,
            cssClass: 'common-popover-css',
            component: AccountSwitcherPopover
        });

        await popover.present();
        await popover.onDidDismiss();
    }

    async close(): Promise<void> {
        await this.popoverCtrl.dismiss();
    }
}   