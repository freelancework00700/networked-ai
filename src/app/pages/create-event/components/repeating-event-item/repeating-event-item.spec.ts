import { RepeatingEventItem } from './repeating-event-item';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('RepeatingEventItem', () => {
  let component: RepeatingEventItem;
  let fixture: ComponentFixture<RepeatingEventItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepeatingEventItem]
    }).compileComponents();

    fixture = TestBed.createComponent(RepeatingEventItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
