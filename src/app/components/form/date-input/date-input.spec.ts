import { DateInput } from './date-input';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('DateInput', () => {
  let component: DateInput;
  let fixture: ComponentFixture<DateInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateInput]
    }).compileComponents();

    fixture = TestBed.createComponent(DateInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
