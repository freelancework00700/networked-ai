import { UserCardList } from './user-card-list';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('UserCardList', () => {
  let component: UserCardList;
  let fixture: ComponentFixture<UserCardList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardList]
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
