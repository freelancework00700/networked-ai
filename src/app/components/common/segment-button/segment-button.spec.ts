import { SegmentButton } from './segment-button';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('SegmentButton', () => {
  let component: SegmentButton;
  let fixture: ComponentFixture<SegmentButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SegmentButton]
    }).compileComponents();

    fixture = TestBed.createComponent(SegmentButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
