import { IonicModule } from '@ionic/angular';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MySubscriptions } from './my-subscriptions';

describe('MySubscriptions', () => {
  let component: MySubscriptions;
  let fixture: ComponentFixture<MySubscriptions>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MySubscriptions],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MySubscriptions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
