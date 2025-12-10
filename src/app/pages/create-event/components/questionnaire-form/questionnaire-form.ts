import { Button } from '@/components/form/button';
import { TitleCasePipe } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { ModalService } from '@/services/modal.service';
import { TextInput } from '@/components/form/text-input';
import { NumberInput } from '@/components/form/number-input';
import { Component, Input, inject, signal } from '@angular/core';
import { IonReorder, IonReorderGroup, ItemReorderEventDetail, ModalController } from '@ionic/angular/standalone';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, FormControl, AbstractControl } from '@angular/forms';
@Component({
  selector: 'questionnaire-form',
  templateUrl: './questionnaire-form.html',
  styleUrl: './questionnaire-form.scss',
  imports: [
    Button,
    TextInput,
    IonReorder,
    NumberInput,
    SelectModule,
    TitleCasePipe,
    CheckboxModule,
    IonReorderGroup,
    InputTextModule,
    ReactiveFormsModule
  ]
})
export class QuestionnaireForm {
  fb = inject(FormBuilder);
  modalService = inject(ModalService);
  modalCtrl = inject(ModalController);
  @Input() type: 'pre-event' | 'post-event' = 'pre-event';
  @Input() initialData: any;

  showSelectionBox = signal(false);

  form = this.fb.group({
    questions: this.fb.array([])
  });

  ngOnInit(): void {
    if (this.initialData && this.initialData.length) {
      const questionFormGroups = this.initialData.map((q: any) =>
        this.fb.group({
          question: [q.question, Validators.required],
          type: [q.type, Validators.required],
          required: [q.required || false],
          visibility: [q.visibility || 'public'],
          options: this.fb.array(q.options ? q.options.map((opt: any) => this.fb.control(opt)) : []),
          min: [q.min || null],
          max: [q.max || null],
          rating: [q.rating || null]
        })
      );

      this.form.setControl('questions', this.fb.array(questionFormGroups));
    } else {
      this.addQuestion();
    }
  }

  get questions() {
    return this.form.get('questions') as FormArray;
  }

  get filteredQuestionTypes() {
    return this.questionTypes.filter((q) => {
      if (this.type === 'pre-event') {
        return q.value !== 'rating';
      }
      return true;
    });
  }

  questionTypes = [
    {
      label: 'Text Field',
      value: 'text',
      image: 'textInputIcon.svg',
      description: 'Allows attendees to input free text answer.'
    },
    {
      label: 'Number Input',
      value: 'number',
      image: 'numberInputIcon.svg',
      description: 'Allows attendees to input numbers only.'
    },
    {
      label: 'Single Choice',
      value: 'single',
      image: 'choiceInputIcon.svg',
      description: 'Allows attendees to select an option.'
    },
    {
      label: 'Multiple Choice',
      value: 'multiple',
      image: 'choiceInputIcon.svg',
      description: 'Allows attendees to select multiple options.'
    },
    {
      label: 'phone number',
      value: 'phone',
      icon: 'phone',
      description: 'Allows attendees to input their phone number.'
    },
    {
      label: '1-10 Rating',
      value: 'rating',
      image: 'choiceInputIcon.svg',
      description: 'Allows attendees to rate the event .'
    }
  ];
  visibilityOptions = [
    { label: 'Public', value: 'public', description: "Attendees can see other's answers." },
    { label: 'Private', value: 'private', description: 'Answer only visible to event host.' }
  ];

  close() {
    this.modalService.close();
  }

  createQuestion(type: string): FormGroup {
    const base = {
      type: new FormControl(type, Validators.required),
      question: new FormControl('', Validators.required),
      required: new FormControl(false),
      visibility: new FormControl('public')
    };

    if (type === 'single' || type === 'multiple') {
      return this.fb.group({
        ...base,
        options: this.fb.array([this.fb.control('', Validators.required), this.fb.control('', Validators.required)])
      });
    }

    if (type === 'number') {
      return this.fb.group({
        ...base,
        min: new FormControl(null),
        max: new FormControl(null)
      });
    }

    return this.fb.group(base);
  }

  selectType(type: string) {
    const q = this.createQuestion(type);
    this.questions.push(q);
    this.showSelectionBox.set(false);
  }

  addQuestion() {
    this.showSelectionBox.set(true);
  }

  changeType(index: number, type: string) {
    const newQuestion = this.createQuestion(type);
    this.questions.setControl(index, newQuestion);
  }

  getOptions(q: any): FormArray {
    return q.get('options') as FormArray;
  }

  addOption(qIndex: number) {
    this.getOptions(this.questions.at(qIndex)).push(this.fb.control('', Validators.required));
  }

  removeOption(qIndex: number, optIndex: number) {
    this.getOptions(this.questions.at(qIndex)).removeAt(optIndex);
  }

  deleteQuestion(idx: number) {
    this.questions.removeAt(idx);
    if (this.questions.length === 0) {
      this.showSelectionBox.set(true);
    }
  }

  save() {
    this.modalCtrl.dismiss(this.form.value);
  }

  reorderQuestions(event: CustomEvent<ItemReorderEventDetail>) {
    const reorderedQuestions = event.detail.complete(this.questions.controls as unknown as FormGroup[]);
    this.form.setControl('questions', this.fb.array(reorderedQuestions));
  }

  reorderOptions(questionIndex: number, event: CustomEvent<ItemReorderEventDetail>) {
    event.detail.complete(this.getOptions(this.questions.at(questionIndex)).controls as unknown as FormControl[]);
    event.detail.complete();
  }

  isNumberInvalid(q: AbstractControl): boolean {
    if (!q || q.get('type')?.value !== 'number') return false;

    const min = q.get('min')?.value;
    const max = q.get('max')?.value;

    // Both required if one is filled
    const oneMissing = (min !== null && max === null) || (min === null && max !== null);

    // Must be a number
    const invalidNumber = isNaN(min) || isNaN(max);

    // Must be min < max
    const wrongOrder = min !== null && max !== null && min >= max;

    return oneMissing || invalidNumber || wrongOrder;
  }

  isRatingInvalid(q: FormGroup): boolean {
    return q.get('type')?.value === 'rating' && !q.get('rating')?.value;
  }

  areOptionsInvalid(q: AbstractControl): boolean {
    if (!['single', 'multiple'].includes(q.get('type')?.value)) return false;

    const options = q.get('options') as FormArray;

    return options.controls.some((opt) => !opt.value || opt.value.trim() === '');
  }

  isFormInvalid(): boolean {
    const qArray = this.questions.controls as FormGroup[];
    return this.form.invalid || qArray.some((q) => this.isNumberInvalid(q) || this.isRatingInvalid(q) || this.areOptionsInvalid(q));
  }
}
