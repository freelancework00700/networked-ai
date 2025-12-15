import { CityCard } from './city-card';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('CityCard', () => {
  let component: CityCard;
  let fixture: ComponentFixture<CityCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CityCard]
    }).compileComponents();

    fixture = TestBed.createComponent(CityCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
