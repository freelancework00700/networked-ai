import { GifGalleryModal } from './gif-gallery-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('GifGalleryModal', () => {
  let component: GifGalleryModal;
  let fixture: ComponentFixture<GifGalleryModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GifGalleryModal]
    }).compileComponents();

    fixture = TestBed.createComponent(GifGalleryModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
