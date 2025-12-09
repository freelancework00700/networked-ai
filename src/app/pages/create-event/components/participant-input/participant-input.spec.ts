import { ParticipantInput } from './participant-input';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ParticipantInput', () => {
  let component: ParticipantInput;
  let fixture: ComponentFixture<ParticipantInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantInput]
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipantInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
