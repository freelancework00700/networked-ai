import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { ModalController } from '@ionic/angular/standalone';
import { PostEventCard } from '@/components/card/post-event-card';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

@Component({
  selector: 'post-event-modal',
  imports: [Searchbar, PostEventCard],
  styleUrl: './post-event-modal.scss',
  templateUrl: './post-event-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostEventModal {
  private modalCtrl = inject(ModalController);
  private modalService = inject(ModalService);
  searchQuery = signal<string>('');
  segmentValue = signal<'All Events' | 'My Events'>('All Events');
  events = signal<any[]>([
    {
      id: 1,
      title: 'Atlanta Makes Me Laugh',
      location: 'Atlanta, GA',
      date: 'Fri 8/30',
      visibility: 'public'
    },
    {
      id: 2,
      title: 'Comedy Night Live',
      location: 'New York, NY',
      date: 'Sat 9/7',
      visibility: 'private'
    },
    {
      id: 3,
      title: 'Laugh Factory Special',
      location: 'Los Angeles, CA',
      date: 'Sun 9/8',
      visibility: 'public'
    },
    {
      id: 4,
      title: 'Standup Saturdays',
      location: 'Chicago, IL',
      date: 'Sat 9/14',
      visibility: 'private'
    },
    {
      id: 5,
      title: 'Improv Jam',
      location: 'Austin, TX',
      date: 'Thu 9/19',
      visibility: 'public'
    },
    {
      id: 6,
      title: 'Open Mic Madness',
      location: 'Seattle, WA',
      date: 'Fri 9/20',
      visibility: 'private'
    },
    {
      id: 7,
      title: 'Comedy Underground',
      location: 'Denver, CO',
      date: 'Sat 9/21',
      visibility: 'public'
    },
    {
      id: 8,
      title: 'Laugh Riot',
      location: 'Miami, FL',
      date: 'Sun 9/22',
      visibility: 'public'
    },
    {
      id: 9,
      title: 'Night of Giggles',
      location: 'Boston, MA',
      date: 'Fri 9/27',
      visibility: 'private'
    },
    {
      id: 10,
      title: 'Comedy Fest',
      location: 'San Francisco, CA',
      date: 'Sat 9/28',
      visibility: 'public'
    }
  ]);

  onSearchChange(event: any) {
    this.searchQuery.set(event);
  }

  close() {
    this.modalCtrl.dismiss();
  }

  filteredEvents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const segment = this.segmentValue();

    return this.events().filter((event) => {
      // Segment filter
      const segmentMatch = segment === 'All Events' ? event.visibility === 'public' : event.visibility === 'private';

      // Search filter
      const searchMatch = !query || event.title.toLowerCase().includes(query) || event.location.toLowerCase().includes(query);

      return segmentMatch && searchMatch;
    });
  });

  onAdd(event: any) {
    this.modalCtrl.dismiss(event);
    this.modalService.close();
  }
}
