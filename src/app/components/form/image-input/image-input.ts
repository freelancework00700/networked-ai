import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ImageConfirmModal } from './image-confirm-modal';
import { ModalController } from '@ionic/angular/standalone';
import { FormGroup, Validators, FormBuilder, AbstractControl, ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { input, signal, OnInit, inject, Component, ChangeDetectorRef, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
@Component({
  selector: 'image-input',
  styleUrl: './image-input.scss',
  templateUrl: './image-input.html',
  imports: [ReactiveFormsModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ]
})
export class ImageInput implements OnInit {
  // inputs
  label = input('');
  required = input(true);
  isSubmitted = input(true);
  controlName = input.required<string>();

  // signals
  selectedFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // variables
  private objectUrl: string | null = null;
  private subscriptions = new Subscription();

  @ViewChild('fileInput', { static: false }) fileInputRef!: ElementRef<HTMLInputElement>;

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private parentContainer: ControlContainer,
    private modalCtrl: ModalController
  ) {}

  get control(): AbstractControl {
    return this.parentFormGroup.get(this.controlName())!;
  }

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  get isControlInvalid(): boolean {
    return !this.control?.valid && this.control?.touched && this.required() && this.isSubmitted();
  }

  removeImage(): void {
    this.control.setValue(null);
    this.control.markAsTouched();
    this.updateImagePreview(null);
  }

  ngOnInit(): void {
    const validators = this.required() ? [Validators.required] : [];
    this.parentFormGroup.addControl(this.controlName(), this.fb.control(null, validators));

    this.updateImagePreview(this.control.value);

    this.control.valueChanges.subscribe((value) => {
      this.updateImagePreview(value);
      this.cdr.markForCheck();
    });
  }

  private updateImagePreview(value: any): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }

    if (!value) {
      this.imagePreview.set(null);
      this.selectedFile.set(null);
      return;
    }

    if (value instanceof File) {
      this.selectedFile.set(value);
      this.objectUrl = URL.createObjectURL(value);
      this.imagePreview.set(this.objectUrl);
    } else if (typeof value === 'string') {
      this.selectedFile.set(null);
      this.imagePreview.set(value);
    } else {
      this.imagePreview.set(null);
      this.selectedFile.set(null);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.showConfirmationModal(file);
    }

    input.value = '';
  }

  private async showConfirmationModal(file: File): Promise<void> {
    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const imageDataUrl = e.target.result;

      const modal = await this.modalCtrl.create({
        component: ImageConfirmModal,
        backdropDismiss: false,
        cssClass: 'auto-hight-modal',
        componentProps: {
          imageDataUrl: imageDataUrl
        }
      });

      await modal.present();

      const { data } = await modal.onWillDismiss();

      if (data && data.action === 'confirm') {
        this.control.setValue(file);
        this.control.markAsTouched();
      } else if (data && data.action === 'retake') {
        setTimeout(() => {
          if (this.fileInputRef?.nativeElement) {
            this.fileInputRef.nativeElement.click();
          }
        }, 100);
      }
    };
    reader.readAsDataURL(file);
  }
}
