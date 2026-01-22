import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonPopover } from './common-popover';

describe('CommonPopover', () => {
  let component: CommonPopover;
  let fixture: ComponentFixture<CommonPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonPopover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonPopover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
