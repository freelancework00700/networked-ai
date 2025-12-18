import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestFilterModal } from './guest-filter-modal';

describe('GuestFilterModal', () => {
  let component: GuestFilterModal;
  let fixture: ComponentFixture<GuestFilterModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestFilterModal]
    }).compileComponents();

    fixture = TestBed.createComponent(GuestFilterModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
