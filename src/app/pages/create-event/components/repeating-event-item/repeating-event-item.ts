import { CommonModule } from '@angular/common';
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'repeating-event-item',
  styleUrl: './repeating-event-item.scss',
  templateUrl: './repeating-event-item.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule]
})
export class RepeatingEventItem {
  event = input.required<any>();
  isMainEvent = input<boolean>(false);
  edit = output<any>();
  delete = output<string>();

  onEdit(): void {
    this.edit.emit(this.event());
  }

  onDelete(): void {
    this.delete.emit(this.event().id);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  }
}
