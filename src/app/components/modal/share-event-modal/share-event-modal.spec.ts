import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareEventModal } from './share-event-modal';

describe('ShareEventModal', () => {
  let component: ShareEventModal;
  let fixture: ComponentFixture<ShareEventModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareEventModal]
    }).compileComponents();

    fixture = TestBed.createComponent(ShareEventModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
