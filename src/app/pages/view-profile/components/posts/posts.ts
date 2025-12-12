import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-posts',
  styleUrl: './posts.scss',
  templateUrl: './posts.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Posts {}

