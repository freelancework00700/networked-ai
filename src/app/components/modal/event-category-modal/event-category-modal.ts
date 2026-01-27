import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { EventCategory } from '@/interfaces/event';
import { ModalService } from '@/services/modal.service';
import { Input, inject, signal, Component, OnInit } from '@angular/core';
import { IonFooter, IonHeader, IonToolbar, IonPicker, IonPickerColumnOption, IonPickerColumn } from '@ionic/angular/standalone';

interface CategoryOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'event-category-modal',
  styleUrl: './event-category-modal.scss',
  templateUrl: './event-category-modal.html',
  imports: [IonPicker, Button, IonFooter, IonHeader, IonToolbar, CommonModule, IonPickerColumnOption, IonPickerColumn]
})
export class EventCategoryModal implements OnInit {
  // services
  private modalService = inject(ModalService);

  @Input() value: string = '';
  @Input() categories?: EventCategory[];

  options = signal<CategoryOption[]>([]);
  selectedValue = signal<string>('');

  ngOnInit(): void {
    if (this.categories && this.categories.length > 0) {
      const formattedOptions: CategoryOption[] = this.categories
        .map((cat) => ({
          value: cat.id || cat.value || '',
          label: cat.name || '',
          icon: cat.icon || ''
        }))
        .filter((opt) => opt.value && opt.label);

      if (formattedOptions.length > 0) {
        this.options.set(formattedOptions);
      }
    }
    this.selectedValue.set(this.value || '');
  }

  async dismiss() {
    await this.modalService.close(this.value);
  }
}
