import { ModalInput } from './modal-input';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ModalInput', () => {
  let component: ModalInput;
  let fixture: ComponentFixture<ModalInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalInput]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
