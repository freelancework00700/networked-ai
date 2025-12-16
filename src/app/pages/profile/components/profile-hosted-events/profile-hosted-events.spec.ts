import { ProfileHostedEvents } from './profile-hosted-events';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('ProfileHostedEvents', () => {
  let component: ProfileHostedEvents;
  let fixture: ComponentFixture<ProfileHostedEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileHostedEvents]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileHostedEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
