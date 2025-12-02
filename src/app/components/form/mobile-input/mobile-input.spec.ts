import { MobileInput } from './mobile-input';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('MobileInput', () => {
  let component: MobileInput;
  let fixture: ComponentFixture<MobileInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileInput]
    }).compileComponents();

    fixture = TestBed.createComponent(MobileInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
