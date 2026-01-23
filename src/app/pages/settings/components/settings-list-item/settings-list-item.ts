import { input, output, Component, ChangeDetectionStrategy } from '@angular/core';

export interface SettingListItem {
  label: string;
  icon?: string;
  value?: string;
  route?: string;
  action?: string;
  showChevron?: boolean;
}

@Component({
  selector: 'settings-list-item',
  styleUrl: './settings-list-item.scss',
  templateUrl: './settings-list-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
})
export class SettingsListItem {
  // inputs
  item = input.required<SettingListItem>();
  showChevron = input(true);

  // outputs
  itemClick = output<SettingListItem>();

  onItemClick(): void {
    this.itemClick.emit(this.item());
  }
}
