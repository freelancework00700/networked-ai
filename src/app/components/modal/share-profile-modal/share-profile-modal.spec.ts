import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareProfileModal } from './share-profile-modal';

describe('ShareProfileModal', () => {
  let component: ShareProfileModal;
  let fixture: ComponentFixture<ShareProfileModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareProfileModal]
    }).compileComponents();

    fixture = TestBed.createComponent(ShareProfileModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
