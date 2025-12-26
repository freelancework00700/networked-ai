import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeAccountInfo } from './change-account-info';
import { IonicModule } from '@ionic/angular';

describe('ChangeAccountInfo', () => {
  let component: ChangeAccountInfo;
  let fixture: ComponentFixture<ChangeAccountInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeAccountInfo, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeAccountInfo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
