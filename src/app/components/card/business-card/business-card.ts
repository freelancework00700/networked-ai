import { IonIcon } from '@ionic/angular/standalone';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'business-card',
  imports: [IonIcon],
  styleUrl: './business-card.scss',
  templateUrl: './business-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessCard {}
