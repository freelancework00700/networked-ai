import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityEvents } from './city-events';

describe('CityEvents', () => {
  let component: CityEvents;
  let fixture: ComponentFixture<CityEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityEvents]
    }).compileComponents();

    fixture = TestBed.createComponent(CityEvents);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
