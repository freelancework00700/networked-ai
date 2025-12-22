import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEventCard } from './post-event-card';

describe('PostEventCard', () => {
  let component: PostEventCard;
  let fixture: ComponentFixture<PostEventCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostEventCard]
    }).compileComponents();

    fixture = TestBed.createComponent(PostEventCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
