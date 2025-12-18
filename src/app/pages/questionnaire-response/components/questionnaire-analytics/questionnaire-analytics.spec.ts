import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireAnalytics } from './questionnaire-analytics';

describe('QuestionnaireAnalytics', () => {
  let component: QuestionnaireAnalytics;
  let fixture: ComponentFixture<QuestionnaireAnalytics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionnaireAnalytics]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionnaireAnalytics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
