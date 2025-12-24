import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkingScoreCard } from './networking-score-card';

describe('NetworkingScoreCard', () => {
  let component: NetworkingScoreCard;
  let fixture: ComponentFixture<NetworkingScoreCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkingScoreCard]
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkingScoreCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
