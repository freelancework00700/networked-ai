import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Input, inject, signal, OnInit, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonRow, IonGrid, IonHeader, IonFooter, IonToolbar, IonContent } from '@ionic/angular/standalone';

export interface NetworkTag {
  name: string;
  icon: string;
  value: string;
}

@Component({
  selector: 'network-tag-modal',
  styleUrl: './network-tag-modal.scss',
  templateUrl: './network-tag-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, Button, IonRow, IonGrid, IonHeader, IonFooter, IonToolbar]
})
export class NetworkTagModal implements OnInit {
  // services
  modalService = inject(ModalService);

  // inputs
  @Input() maxSelections = 5;
  @Input() tags: NetworkTag[] = [];
  @Input() subtitle = 'Select up to 5';
  @Input() title = 'Networked Meta Tags';
  @Input() initialSelectedTags: string[] = [];

  // signals
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
    this.modalService.close();
  }

  confirm(): void {
    this.modalService.close(this.selectedTags());
  }
}
