import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Component, Input, input, signal, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'user-detail',
  styleUrl: './user-detail.scss',
  templateUrl: './user-detail.html',
  imports: [ToggleSwitchModule, Button, Chip],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetail {
  isLocationEnabled = signal(false);
  @Input() user: any;

  messages = ["Hey, let's network!", 'Wanna hang out?', 'Hey, are you free for some coffee?'];
}
