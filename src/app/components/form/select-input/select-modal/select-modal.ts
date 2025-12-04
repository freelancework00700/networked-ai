import { Button } from '../../button';
import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { IonPicker, IonPickerColumn, IonPickerColumnOption, ModalController } from '@ionic/angular/standalone';

export interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'select-modal',
  templateUrl: './select-modal.html',
  styleUrl: './select-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonPicker, IonPickerColumn, IonPickerColumnOption, Button, CommonModule]
})
export class SelectModal implements OnInit {
  private modalCtrl = inject(ModalController);

  title = 'Select Option';
  options: SelectOption[] = [];
  initialValue: string | null = null;

  selectedValue = signal<string>('');

  ngOnInit(): void {
    if (this.initialValue) {
      this.selectedValue.set(this.initialValue);
    } else if (this.options && this.options.length > 0) {
      // Select first option by default if no initial value
      this.selectedValue.set(this.options[0].value);
    }
  }

  onPickerChange(event: CustomEvent): void {
    const value = event.detail.value;
    this.selectedValue.set(value);
  }

  confirm(): void {
    this.modalCtrl.dismiss(this.selectedValue() || null);
  }
}
