import { Avatar } from 'primeng/avatar';
import { IUser } from '@/interfaces/IUser';
import { AvatarGroup } from 'primeng/avatargroup';
import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'avatar-group',
  imports: [Avatar, AvatarGroup],
  styleUrl: './avatar-group.scss',
  templateUrl: './avatar-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarGroupComponent {
  users = input<IUser[]>([]);
  size = input<'normal' | 'large' | 'xlarge'>('large');
  shape = input<'square' | 'circle'>('circle');
  maxVisible = input<number>(5);
  showOverflow = input<boolean>(true);

  getVisibleUsers(): IUser[] {
    const allUsers = this.users();
    const totalUsers = allUsers.length;
    if (totalUsers > 5) {
      return allUsers.slice(0, 4);
    }
    return allUsers.slice(0, this.maxVisible());
  }

  trackByUser(index: number, user: IUser): string {
    return user.id || `user-${index}`;
  }

  getRemainingCount(): number {
    const allUsers = this.users();
    const totalUsers = allUsers.length;

    if (totalUsers > 5) {
      return totalUsers - 4;
    }

    const remaining = totalUsers - this.maxVisible();
    return remaining > 0 ? remaining : 0;
  }

  shouldShowOverflow(): boolean {
    const allUsers = this.users();
    return this.showOverflow() && allUsers.length > 5;
  }

  getUserImage(user: IUser): string {
    return (user.image_url as string) || user.thumbnail_url || 'assets/images/profile.jpeg';
  }
}
