import { ProfileEmptyState } from './profile-empty-state';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('ProfileEmptyState', () => {
  let component: ProfileEmptyState;
  let fixture: ComponentFixture<ProfileEmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileEmptyState]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEmptyState);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
