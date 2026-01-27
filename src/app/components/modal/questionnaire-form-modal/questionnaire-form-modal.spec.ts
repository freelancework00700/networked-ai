import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireFormModal } from './questionnaire-form-modal';

describe('QuestionnaireFormModal', () => {
  let component: QuestionnaireFormModal;
  let fixture: ComponentFixture<QuestionnaireFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionnaireFormModal]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionnaireFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
