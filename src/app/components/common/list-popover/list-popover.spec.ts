import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ListPopover } from './list-popover';

describe('ListPopover', () => {
  let component: ListPopover;
  let fixture: ComponentFixture<ListPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPopover]
    }).compileComponents();

    fixture = TestBed.createComponent(ListPopover);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('type', 'menu');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});