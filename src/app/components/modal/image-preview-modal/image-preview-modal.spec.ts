import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagePreviewModal } from './image-preview-modal';

describe('ImagePreviewModal', () => {
  let component: ImagePreviewModal;
  let fixture: ComponentFixture<ImagePreviewModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagePreviewModal]
    }).compileComponents();

    fixture = TestBed.createComponent(ImagePreviewModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
