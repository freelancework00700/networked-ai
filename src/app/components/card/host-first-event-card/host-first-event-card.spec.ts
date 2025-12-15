import { HostFirstEventCard } from './host-first-event-card';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('HostFirstEventCard', () => {
  let component: HostFirstEventCard;
  let fixture: ComponentFixture<HostFirstEventCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostFirstEventCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HostFirstEventCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
