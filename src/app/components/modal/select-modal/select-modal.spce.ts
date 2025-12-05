import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectModal } from './select-modal';

describe('SelectModal', () => {
  let component: SelectModal;
  let fixture: ComponentFixture<SelectModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectModal]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
