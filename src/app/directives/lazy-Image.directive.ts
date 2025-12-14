import { OnInit, signal, effect, OnDestroy, Directive, ElementRef, ChangeDetectorRef } from '@angular/core';

@Directive({ selector: 'img[lazyImage]' })
export class LazyImageDirective implements OnInit, OnDestroy {
  private isLoading = signal(true);
  private hasError = signal(false);
  private imageLoadHandler?: () => void;
  private imageErrorHandler?: () => void;
  private skeletonElement: HTMLDivElement | null = null;
  private errorPlaceholder: HTMLDivElement | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private el: ElementRef<HTMLImageElement>
  ) {
    // watch for loading state changes
    effect(() => {
      const loading = this.isLoading();
      const error = this.hasError();

      if (this.skeletonElement) {
        // show skeleton only while loading (not on error)
        this.skeletonElement.style.display = loading ? 'block' : 'none';
      }

      if (this.errorPlaceholder) {
        // show error placeholder only when there's an error
        this.errorPlaceholder.style.display = error ? 'flex' : 'none';
      }

      if (this.el.nativeElement) {
        // hide image while loading or on error, show when loaded successfully
        if (loading || error) {
          this.el.nativeElement.style.opacity = '0';
        } else {
          this.el.nativeElement.style.opacity = '1';
        }
        this.el.nativeElement.style.transition = 'opacity 0.3s ease-in-out';
      }
    });
  }

  ngOnInit(): void {
    const img = this.el.nativeElement;

    // ensure parent is relative positioned for skeleton overlay
    const parent = img.parentElement;
    if (parent && getComputedStyle(parent).position === 'static') {
      parent.style.position = 'relative';
    }

    // create skeleton and error placeholder
    this.createSkeleton();
    this.createErrorPlaceholder();

    // set up image load handlers
    this.imageLoadHandler = () => {
      this.isLoading.set(false);
      this.hasError.set(false);
      this.cdr.markForCheck();
    };

    this.imageErrorHandler = () => {
      this.isLoading.set(false);
      this.hasError.set(true);
      this.cdr.markForCheck();
    };

    // check if image is already loaded or start loading
    this.checkImageLoad();
  }

  private checkImageLoad(): void {
    const img = this.el.nativeElement;
    const imageUrl = img.src;

    if (!imageUrl) {
      this.isLoading.set(false);
      this.hasError.set(true);
      return;
    }

    // if image is already loaded successfully
    if (img.complete && img.naturalHeight !== 0) {
      this.isLoading.set(false);
      this.hasError.set(false);
    } else if (img.complete && img.naturalHeight === 0) {
      // image already failed to load
      this.isLoading.set(false);
      this.hasError.set(true);
    } else {
      // wait for image to load
      img.addEventListener('load', this.imageLoadHandler!);
      img.addEventListener('error', this.imageErrorHandler!);
    }
  }

  ngOnDestroy(): void {
    const img = this.el.nativeElement;

    // remove event listeners
    if (this.imageLoadHandler) {
      img.removeEventListener('load', this.imageLoadHandler);
    }
    if (this.imageErrorHandler) {
      img.removeEventListener('error', this.imageErrorHandler);
    }

    // remove skeleton element
    if (this.skeletonElement && this.skeletonElement.parentElement) {
      this.skeletonElement.parentElement.removeChild(this.skeletonElement);
    }

    // remove error placeholder
    if (this.errorPlaceholder && this.errorPlaceholder.parentElement) {
      this.errorPlaceholder.parentElement.removeChild(this.errorPlaceholder);
    }
  }

  private createSkeleton(): void {
    const img = this.el.nativeElement;
    const parent = img.parentElement;

    if (!parent) return;

    // create skeleton element
    this.skeletonElement = document.createElement('div');
    this.skeletonElement.style.zIndex = '1';
    this.skeletonElement.className = 'absolute inset-0 bg-neutral-05 animate-pulse rounded-lg';

    // insert skeleton before the image
    parent.insertBefore(this.skeletonElement, img);
  }

  private createErrorPlaceholder(): void {
    const img = this.el.nativeElement;
    const parent = img.parentElement;

    if (!parent) return;

    // create error placeholder element
    this.errorPlaceholder = document.createElement('div');
    this.errorPlaceholder.style.zIndex = '2';
    this.errorPlaceholder.style.display = 'none';
    this.errorPlaceholder.className = 'absolute inset-0 bg-neutral-06 rounded-lg flex items-center justify-center';

    // create img element for the SVG
    const svgImg = document.createElement('img');
    svgImg.style.objectFit = 'contain';
    svgImg.src = 'assets/svg/no-image.svg';
    svgImg.className = 'w-12 h-12 opacity-50';

    this.errorPlaceholder.appendChild(svgImg);

    // insert error placeholder before the image
    parent.insertBefore(this.errorPlaceholder, img);
  }
}
