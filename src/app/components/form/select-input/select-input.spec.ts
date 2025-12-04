import { SelectInput } from './select-input';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('SelectInput', () => {
  let component: SelectInput;
  let fixture: ComponentFixture<SelectInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectInput]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
