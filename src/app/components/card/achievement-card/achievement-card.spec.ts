import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AchievementCard } from './achievement-card';

describe('AchievementCard', () => {
  let component: AchievementCard;
  let fixture: ComponentFixture<AchievementCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementCard]
    }).compileComponents();

    fixture = TestBed.createComponent(AchievementCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
