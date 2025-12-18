import { LocationFilterModal } from './location-filter-modal';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('LocationFilterModal', () => {
  let component: LocationFilterModal;
  let fixture: ComponentFixture<LocationFilterModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationFilterModal]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationFilterModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
