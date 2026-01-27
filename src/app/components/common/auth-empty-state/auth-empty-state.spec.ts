import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AuthEmptyState } from './auth-empty-state';

describe('AuthEmptyState', () => {
  let component: AuthEmptyState;
  let fixture: ComponentFixture<AuthEmptyState>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthEmptyState]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthEmptyState);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('type', 'menu');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
