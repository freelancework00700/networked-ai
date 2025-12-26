import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllEvents } from './all-events';

describe('AllEvents', () => {
  let component: AllEvents;
  let fixture: ComponentFixture<AllEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllEvents]
    }).compileComponents();

    fixture = TestBed.createComponent(AllEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
