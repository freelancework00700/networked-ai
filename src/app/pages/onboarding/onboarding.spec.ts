import { Onboarding } from './onboarding';
import { IonicModule } from '@ionic/angular';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('Onboarding', () => {
  let component: Onboarding;
  let fixture: ComponentFixture<Onboarding>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Onboarding],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Onboarding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
