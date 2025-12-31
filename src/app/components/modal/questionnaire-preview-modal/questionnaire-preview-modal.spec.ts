import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnairePreviewModal } from './questionnaire-preview-modal';

describe('QuestionnairePreviewModal', () => {
  let component: QuestionnairePreviewModal;
  let fixture: ComponentFixture<QuestionnairePreviewModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionnairePreviewModal]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionnairePreviewModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
