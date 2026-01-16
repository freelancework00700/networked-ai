import { input, Component, ChangeDetectionStrategy } from '@angular/core';

export interface ICity {
  city: string;
  state: string;
  image_url: string;
  thumbnail_url: string;
  event_count: number;
}

@Component({
  selector: 'city-card',
  styleUrl: './city-card.scss',
  templateUrl: './city-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CityCard {
  city = input.required<ICity>();
}
