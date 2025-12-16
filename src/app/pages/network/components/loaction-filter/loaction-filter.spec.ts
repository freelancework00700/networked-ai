import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoactionFilter } from './loaction-filter';

describe('LoactionFilter', () => {
  let component: LoactionFilter;
  let fixture: ComponentFixture<LoactionFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoactionFilter]
    }).compileComponents();

    fixture = TestBed.createComponent(LoactionFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
