import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeAgo', standalone: true })
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | null | undefined, _tick?: number): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    const diffMs = Date.now() - date.getTime();

    if (Number.isNaN(diffMs)) return '';

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 5) return `Just now`;
    if (seconds < 60) return `${seconds}s ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}
