import { Component, ChangeDetectionStrategy, inject, OnInit, signal, Input } from '@angular/core';
import { IonIcon, PopoverController } from '@ionic/angular/standalone';
import { LocalStorageService, KEYS } from '@/services/localstorage.service';

export interface PopoverItem {
  label: string;
  icon?: string;
  avatar?: string;
  type?: 'account' | 'add-account' | 'sign-out' | 'menu';
  data?: any;
}

export type PopoverType = 'accounts' | 'menu';

@Component({
  selector: 'list-popover',
  styleUrl: './list-popover.scss',
  templateUrl: './list-popover.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonIcon]
})
export class ListPopover implements OnInit {
  @Input() type!: PopoverType;

  displayItems = signal<PopoverItem[]>([]);
  activeAccountId = signal<string | null>(null);

  private popoverCtrl = inject(PopoverController);
  private localStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    if (this.type === 'accounts') {
      this.loadAccounts();
    } else {
      this.loadMenuItems();
    }
  }

  private loadAccounts(): void {
    const usersJson = this.localStorageService.getItem(KEYS.USERS);
    const accountList: PopoverItem[] = [];

    let firstUserId: string | null = null;

    if (usersJson) {
      try {
        const users = JSON.parse(usersJson);
        if (Array.isArray(users) && users.length > 0) {
          firstUserId = users[0].id || null;

          users.forEach((user: any) => {
            accountList.push({
              label: user.name || user.username,
              icon: 'pi-user',
              type: 'account',
              data: user,
              avatar: user.thumbnail_url
            });
          });
        }
      } catch (error) {
        console.error('Error parsing users from localStorage:', error);
      }
    }

    this.activeAccountId.set(firstUserId);

    accountList.push({
      label: 'Add Account',
      icon: 'pi-plus',
      type: 'add-account'
    });

    accountList.push({
      label: 'Sign out',
      icon: 'pi-sign-out',
      type: 'sign-out'
    });

    this.displayItems.set(accountList);
  }

  isActiveAccount(item: PopoverItem): boolean {
    if (item.type !== 'account' || !item.data?.id) return false;
    return item.data.id === this.activeAccountId();
  }

  private loadMenuItems(): void {
    const menuItems: PopoverItem[] = [
      { label: 'Favorites', icon: 'pi-heart', type: 'menu' },
      { label: 'Settings', icon: 'pi-cog', type: 'menu' }
    ];
    this.displayItems.set(menuItems);
  }

  async onItemClick(item: PopoverItem): Promise<void> {
    if (item.type === 'add-account') {
      await this.popoverCtrl.dismiss({ addAccount: true });
    } else if (item.type === 'sign-out') {
      await this.popoverCtrl.dismiss({ signOut: true });
    } else if (item.type === 'account') {
      await this.popoverCtrl.dismiss({ account: item.data || item });
    } else {
      await this.popoverCtrl.dismiss({ menuItem: item });
    }
  }
}