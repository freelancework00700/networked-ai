import { CreateEvent } from './create-event';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('CreateEvent', () => {
  let component: CreateEvent;
  let fixture: ComponentFixture<CreateEvent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateEvent]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateEvent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
