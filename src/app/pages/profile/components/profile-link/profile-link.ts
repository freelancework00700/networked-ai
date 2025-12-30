import { IonIcon } from '@ionic/angular/standalone';
import { signal, Component, ChangeDetectionStrategy, computed, inject, input } from '@angular/core';
import { AuthService } from '@/services/auth.service';
import { IAuthUser } from '@/interfaces/IAuth';

interface SocialLink {
  type: 'website' | 'facebook' | 'twitter' | 'instagram' | 'snapchat' | 'linkedin' | 'phone';
  icon: string;
  value: string;
}

@Component({
  imports: [IonIcon],
  selector: 'profile-link',
  styleUrl: './profile-link.scss',
  templateUrl: './profile-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileLink {
  private authService = inject(AuthService);

  isExpanded = signal(false);
  currentUser = input<IAuthUser | null>(null);

  private readonly socialConfigs = [
    { type: 'website', icon: 'globe-outline', key: 'website' },
    { type: 'facebook', icon: 'logo-facebook', key: 'facebook' },
    { type: 'twitter', icon: 'logo-twitter', key: 'twitter' },
    { type: 'instagram', icon: 'logo-instagram', key: 'instagram' },
    { type: 'snapchat', icon: 'logo-snapchat', key: 'snapchat' },
    { type: 'linkedin', icon: 'logo-linkedin', key: 'linkedin' }
  ] as const;

  socialLinks = computed(() => {
    const user = this.currentUser();
    if (!user) return [];

    const links: SocialLink[] = [];

    if (user.mobile?.trim()) {
      links.push({
        type: 'phone',
        icon: 'call-outline',
        value: user.mobile.trim()
      });
    }

    if (user.socials) {
      for (const config of this.socialConfigs) {
        const value = user.socials[config.key];
        if (value?.trim()) {
          links.push({
            type: config.type,
            icon: config.icon,
            value: value.trim()
          });
        }
      }
    }
    return links;
  });

  linksCount = computed(() => this.socialLinks().length);

  toggleLinks(): void {
    this.isExpanded.update((value) => !value);
  }
}