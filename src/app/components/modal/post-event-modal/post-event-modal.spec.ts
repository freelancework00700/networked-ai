import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEventModal } from './post-event-modal';

describe('PostEventModal', () => {
  let component: PostEventModal;
  let fixture: ComponentFixture<PostEventModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostEventModal]
    }).compileComponents();

    fixture = TestBed.createComponent(PostEventModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
