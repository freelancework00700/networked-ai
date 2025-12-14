import { ImageGalleryModal } from './image-gallery-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('ImageGalleryModal', () => {
  let component: ImageGalleryModal;
  let fixture: ComponentFixture<ImageGalleryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageGalleryModal]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageGalleryModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
