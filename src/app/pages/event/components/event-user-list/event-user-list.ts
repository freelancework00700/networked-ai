import { IUser } from '@/interfaces/IUser';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { Searchbar } from '@/components/common/searchbar';
import { EmptyState } from '@/components/common/empty-state';
import { NavigationService } from '@/services/navigation.service';
import { IonContent, IonHeader, IonToolbar, NavController } from '@ionic/angular/standalone';
import { Component, inject, signal, ChangeDetectionStrategy, computed } from '@angular/core';

@Component({
  selector: 'event-user-list',
  styleUrl: './event-user-list.scss',
  templateUrl: './event-user-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonToolbar, IonHeader, IonContent, CommonModule, Searchbar, Button, EmptyState]
})
export class EventUserList {
  navCtrl = inject(NavController);
  navigationService = inject(NavigationService);
  title = signal<string>('Host(s)');
  searchQuery = signal<string>('');

  // Static user data
  private staticUsers: (IUser & { value?: number; jobTitle?: string; company?: string })[] = [
    {
      id: '1',
      name: 'Kathryn Murphy',
      image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '2',
      name: 'Esther Howard',
      image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '3',
      name: 'Arlene McCoy',
      image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '4',
      name: 'Darlene Robertson',
      image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/ionibowcher.png',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '5',
      name: 'Ronald Richards',
      image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/xuxuefeng.png',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '6',
      name: 'Albert Flores',
      image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '7',
      name: 'Eleanor Pena',
      image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    },
    {
      id: '8',
      name: 'Savannah Nguyen',
      image_url: 'https://primefaces.org/cdn/primeng/images/demo/avatar/onyamalimba.png',
      value: 200,
      jobTitle: 'Founder & CEO',
      company: 'Cortazzo Consulting'
    }
  ];

  users = signal<IUser[]>(this.staticUsers);

  filteredUsers = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    if (!search) return this.users();

    return this.users().filter((user) => user.name?.toLowerCase().includes(search));
  });

  getUserImage(user: IUser): string {
    return (user.image_url as string) || user.thumbnail_url || 'assets/images/profile.jpeg';
  }

  getUserValue(user: IUser): number {
    return (user as any).value || 200;
  }

  getUserJobTitle(user: IUser): string {
    return (user as any).jobTitle || 'Founder & CEO';
  }

  getUserCompany(user: IUser): string {
    return (user as any).company || 'Networked AI';
  }

  onMessage(user: IUser): void {
    // Handle message action
    console.log('Message user:', user);
  }

  onAdd(user: IUser): void {
    // Handle add action
    console.log('Add user:', user);
  }
}
