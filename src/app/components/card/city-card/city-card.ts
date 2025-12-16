import { input, Component, ChangeDetectionStrategy } from '@angular/core';

export interface ICity {
  city: string;
  image: string;
  events: string;
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
