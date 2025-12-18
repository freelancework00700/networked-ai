import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserNetworkRequestCard } from './user-network-request-card';

describe('UserNetworkRequestCard', () => {
  let component: UserNetworkRequestCard;
  let fixture: ComponentFixture<UserNetworkRequestCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserNetworkRequestCard]
    }).compileComponents();

    fixture = TestBed.createComponent(UserNetworkRequestCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
