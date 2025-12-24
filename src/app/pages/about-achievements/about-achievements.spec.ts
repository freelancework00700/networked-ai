import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutAchievements } from './about-achievements';

describe('AboutAchievements', () => {
  let component: AboutAchievements;
  let fixture: ComponentFixture<AboutAchievements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutAchievements]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutAchievements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
