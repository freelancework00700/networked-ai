import { IonicModule } from '@ionic/angular';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Permissions } from './permissions';

describe('Permissions', () => {
  let component: Permissions;
  let fixture: ComponentFixture<Permissions>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [Permissions],
      imports: [IonicModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(Permissions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
