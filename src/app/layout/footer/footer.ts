import { Component } from '@angular/core';
import { IonFooter, IonToolbar } from '@ionic/angular/standalone';
@Component({
  selector: 'app-footer',
  styleUrl: './footer.scss',
  templateUrl: './footer.html',
  imports: [IonFooter, IonToolbar]
})
export class Footer {}
