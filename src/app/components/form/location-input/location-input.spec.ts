import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationInputComponent } from './location-input';

describe('LocationInputComponent', () => {
  let component: LocationInputComponent;
  let fixture: ComponentFixture<LocationInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationInputComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
