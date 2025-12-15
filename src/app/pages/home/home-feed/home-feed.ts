import { signal, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'home-feed',
  styleUrl: './home-feed.scss',
  templateUrl: './home-feed.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeFeed {
  feedFilter = signal<'public' | 'networked'>('public');
}
