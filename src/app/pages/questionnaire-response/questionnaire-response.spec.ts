import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireResponse } from './questionnaire-response';

describe('QuestionnaireResponse', () => {
  let component: QuestionnaireResponse;
  let fixture: ComponentFixture<QuestionnaireResponse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionnaireResponse]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionnaireResponse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
