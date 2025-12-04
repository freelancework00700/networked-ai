import { SocialInput } from './social-input';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('SocialInput', () => {
  let component: SocialInput;
  let fixture: ComponentFixture<SocialInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialInput]
    }).compileComponents();

    fixture = TestBed.createComponent(SocialInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
