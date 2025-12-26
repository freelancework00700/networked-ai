import { SuccessModal } from './success-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('SuccessModal', () => {
  let component: SuccessModal;
  let fixture: ComponentFixture<SuccessModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessModal]
    }).compileComponents();

    fixture = TestBed.createComponent(SuccessModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
