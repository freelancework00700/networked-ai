import { Profile } from './profile';
import { IonicModule } from '@ionic/angular';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('ProfileComponent', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Profile],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
