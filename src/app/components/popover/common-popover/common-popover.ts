import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-common-popover',
  imports: [IonIcon],
  templateUrl: './common-popover.html',
  styleUrl: './common-popover.scss'
})
export class CommonPopover {
  // inputs
  @Input() items: any[] = [];
}
