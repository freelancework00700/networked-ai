import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyticsUserList } from './analytics-user-list';

describe('AnalyticsUserList', () => {
  let component: AnalyticsUserList;
  let fixture: ComponentFixture<AnalyticsUserList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyticsUserList]
    }).compileComponents();

    fixture = TestBed.createComponent(AnalyticsUserList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
