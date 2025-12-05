import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { ModalController, IonGrid, IonRow } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, signal, OnInit, Input } from '@angular/core';

export interface NetworkTag {
  name: string;
  icon: string;
  value: string;
}

@Component({
  selector: 'network-tag-modal',
  styleUrl: './network-tag.scss',
  templateUrl: './network-tag.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, CommonModule, IonGrid, IonRow]
})
export class NetworkTagModal implements OnInit {
  private modalCtrl = inject(ModalController);

  @Input() title = 'Networked Meta Tags';
  @Input() subtitle = 'Select up to 5';
  @Input() tags: NetworkTag[] = [];
  @Input() initialSelectedTags: string[] = [];
  @Input() maxSelections = 5;

  selectedTags = signal<string[]>([]);

  ngOnInit(): void {
    if (this.initialSelectedTags && this.initialSelectedTags.length > 0) {
      this.selectedTags.set([...this.initialSelectedTags]);
    }
  }

  toggleTag(tagValue: string): void {
    const current = this.selectedTags();
    const isSelected = current.includes(tagValue);

    if (isSelected && current.length === 1) {
      return;
    }

    if (isSelected) {
      this.selectedTags.set(current.filter((t) => t !== tagValue));
    } else {
      if (current.length < this.maxSelections) {
        this.selectedTags.set([...current, tagValue]);
      }
    }
  }

  isTagSelected(tagValue: string): boolean {
    return this.selectedTags().includes(tagValue);
  }

  close(): void {
    this.modalCtrl.dismiss();
  }

  confirm(): void {
    this.modalCtrl.dismiss(this.selectedTags());
  }
}
