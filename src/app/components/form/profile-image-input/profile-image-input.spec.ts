import { IonicModule } from '@ionic/angular';
import { ProfileImageInput } from './profile-image-input';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('ProfileImageInput', () => {
  let component: ProfileImageInput;
  let fixture: ComponentFixture<ProfileImageInput>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileImageInput],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileImageInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
