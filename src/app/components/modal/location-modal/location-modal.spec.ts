import { LocationModal } from './location-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('LocationModal', () => {
  let component: LocationModal;
  let fixture: ComponentFixture<LocationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationModal]
    }).compileComponents();

    fixture = TestBed.createComponent(LocationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
