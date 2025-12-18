import { SearchEmptyState } from './search-empty-state';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('SearchEmptyState', () => {
  let component: SearchEmptyState;
  let fixture: ComponentFixture<SearchEmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchEmptyState]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchEmptyState);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
