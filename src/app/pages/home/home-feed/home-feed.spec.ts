import { HomeFeed } from './home-feed';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('HomeFeed', () => {
  let component: HomeFeed;
  let fixture: ComponentFixture<HomeFeed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeFeed]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeFeed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
