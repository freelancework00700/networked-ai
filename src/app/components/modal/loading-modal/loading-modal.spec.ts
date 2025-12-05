import { IonicModule } from '@ionic/angular';
import { LoadingModal } from './loading-modal';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

describe('LoadingModal', () => {
  let component: LoadingModal;
  let fixture: ComponentFixture<LoadingModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadingModal ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
