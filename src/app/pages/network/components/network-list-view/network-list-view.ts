import { Button } from '@/components/form/button';
import { input, output, Component } from '@angular/core';
import { UserCardList } from '@/components/card/user-card-list';

@Component({
  selector: 'network-list-view',
  imports: [Button, UserCardList],
  styleUrl: './network-list-view.scss',
  templateUrl: './network-list-view.html'
})
export class NetworkListView {
  // inputs
  users = input<any[]>([]);

  // outputs
  clearSearch = output<void>();

  handleClick(id: string): void {
    console.log('Add', id);
  }
}
