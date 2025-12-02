import { TabLayout } from './tab-layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('TabLayout', () => {
  let component: TabLayout;
  let fixture: ComponentFixture<TabLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabLayout]
    }).compileComponents();

    fixture = TestBed.createComponent(TabLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
