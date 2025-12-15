import { HomeEvent } from './home-event';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('HomeEvent', () => {
  let component: HomeEvent;
  let fixture: ComponentFixture<HomeEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeEvent]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeEvent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
