import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewResponse } from './view-response';

describe('ViewResponse', () => {
  let component: ViewResponse;
  let fixture: ComponentFixture<ViewResponse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewResponse]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewResponse);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
