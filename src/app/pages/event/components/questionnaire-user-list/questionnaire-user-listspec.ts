import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireUserList } from './questionnaire-user-list';

describe('QuestionnaireUserList', () => {
  let component: QuestionnaireUserList;
  let fixture: ComponentFixture<QuestionnaireUserList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionnaireUserList]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionnaireUserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
