import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { Button } from '@/components/form/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ModalService } from '@/services/modal.service';
import { RsvpDetailsData } from '../rsvp-details-modal';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextInput } from '@/components/form/text-input';
import { NumberInput } from '@/components/form/number-input';
import { MobileInput } from '@/components/form/mobile-input';
import { IonHeader, IonFooter, IonToolbar, ModalController, IonContent } from '@ionic/angular/standalone';
import { Input, signal, inject, Component, OnInit, ChangeDetectionStrategy, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';

export interface QuestionnaireQuestion {
  question: string;
  type: 'text' | 'number' | 'single' | 'multiple' | 'phone' | 'rating';
  required: boolean;
  visibility: 'public' | 'private';
  options?: string[];
  min?: number;
  max?: number;
  rating?: number;
}

@Component({
  selector: 'app-questionnaire-preview-modal',
  styleUrl: './questionnaire-preview-modal.scss',
  templateUrl: './questionnaire-preview-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonContent,
    Button,
    IonHeader,
    IonFooter,
    TextInput,
    IonToolbar,
    NumberInput,
    MobileInput,
    CommonModule,
    SelectModule,
    CheckboxModule,
    RadioButtonModule,
    ReactiveFormsModule
  ]
})
export class QuestionnairePreviewModal implements OnInit {
  @Input() questions: QuestionnaireQuestion[] = [];
  @Input() isPreviewMode: boolean = false;
  @Input() rsvpData: RsvpDetailsData | null = null;
  @Input() eventTitle: string = '';
  @Input() eventDate: string = '';
  @Input() eventLocation: string = '';
  @Input() subscriptionId: string = '';
  private modalService = inject(ModalService);
  private fb = inject(FormBuilder);
  modalCtrl = inject(ModalController);
  form!: FormGroup;

  hasPrivateQuestions = computed(() => {
    return this.questions.some((q) => q.visibility === 'private');
  });

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    const formControls: { [key: string]: any } = {};

    this.questions.forEach((question, index) => {
      const validators = question.required ? [Validators.required] : [];

      switch (question.type) {
        case 'text':
        case 'phone':
          formControls[`question_${index}`] = ['', validators];
          break;
        case 'number':
          const numberValidators = [...validators];
          if (question.min !== undefined) {
            numberValidators.push(Validators.min(question.min));
          }
          if (question.max !== undefined) {
            numberValidators.push(Validators.max(question.max));
          }
          formControls[`question_${index}`] = ['', numberValidators];
          break;
        case 'single':
          formControls[`question_${index}`] = ['', validators];
          break;
        case 'multiple':
          const optionControls = question.options?.map(() => this.fb.control(false)) || [];
          formControls[`question_${index}`] = this.fb.array(optionControls, question.required ? [this.atLeastOneSelected] : []);
          break;
        case 'rating':
          formControls[`question_${index}`] = ['', validators];
          break;
      }
    });

    this.form = this.fb.group(formControls);

    if (this.isPreviewMode) {
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        if (control) {
          control.disable({ emitEvent: false });
        }
      });
    }
  }

  atLeastOneSelected = (control: AbstractControl) => {
    const formArray = control as FormArray;
    const hasSelection = formArray.controls.some((c) => c.value === true);
    return hasSelection ? null : { atLeastOneRequired: true };
  };

  getQuestionControl(index: number): AbstractControl | null {
    return this.form.get(`question_${index}`);
  }

  getMultipleChoiceArray(index: number): FormArray {
    return this.form.get(`question_${index}`) as FormArray;
  }

  getRatingScale(question: QuestionnaireQuestion): number[] {
    const scale = question.rating || 10;
    return Array.from({ length: scale }, (_, i) => i + 1);
  }

  selectRating(index: number, rating: number): void {
    if (!this.isPreviewMode) {
      this.form.get(`question_${index}`)?.setValue(rating);
    }
  }

  isRatingSelected(index: number, rating: number): boolean {
    return this.form.get(`question_${index}`)?.value === rating;
  }

  async dismiss(): Promise<void> {
    if (this.isPreviewMode) {
      await this.modalService.close();
    } else {
      if (this.form.valid) {
        const responses = this.questions.map((question, index) => {
          const control = this.getQuestionControl(index);
          let value = control?.value;

          if (question.type === 'multiple') {
            const formArray = this.getMultipleChoiceArray(index);
            value = question.options?.filter((_, i) => formArray.at(i).value) || [];
          }

          return {
            question: question.question,
            type: question.type,
            answer: value
          };
        });
        await this.modalCtrl.dismiss({ responses });
      } else {
        Object.keys(this.form.controls).forEach((key) => {
          this.form.get(key)?.markAsTouched();
        });
      }
    }
  }
}
