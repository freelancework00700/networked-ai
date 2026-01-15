import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRecommendations } from './user-recommendations';

describe('UserRecommendations', () => {
  let component: UserRecommendations;
  let fixture: ComponentFixture<UserRecommendations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRecommendations]
    }).compileComponents();

    fixture = TestBed.createComponent(UserRecommendations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
