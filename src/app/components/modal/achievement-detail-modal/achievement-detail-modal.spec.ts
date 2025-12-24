import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementDetailModal } from './achievement-detail-modal';

describe('AchievementDetailModal', () => {
  let component: AchievementDetailModal;
  let fixture: ComponentFixture<AchievementDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementDetailModal]
    }).compileComponents();

    fixture = TestBed.createComponent(AchievementDetailModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
