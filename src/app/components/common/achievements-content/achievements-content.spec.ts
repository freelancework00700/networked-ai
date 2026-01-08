import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AchievementsContent } from './achievements-content';

describe('AchievementsContent', () => {
  let component: AchievementsContent;
  let fixture: ComponentFixture<AchievementsContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AchievementsContent]
    }).compileComponents();

    fixture = TestBed.createComponent(AchievementsContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
