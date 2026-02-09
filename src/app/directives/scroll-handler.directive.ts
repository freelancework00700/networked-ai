import { Directive, ElementRef, inject, AfterViewInit, OnDestroy, PLATFORM_ID, DOCUMENT, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

// Constants for scroll calculation
const FADE_START = 20;
const FADE_END = 80;
const FADE_RANGE = FADE_END - FADE_START;
const SCROLL_UP_STEP = 0.4;
const SCROLLING_DOWN_THRESHOLD = 0.8;
const SCROLL_TOP_THRESHOLD = 50;

export const showFooter = signal<boolean>(true);
@Directive({
  selector: 'ion-content',
  standalone: true
})
export class ScrollHandlerDirective implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private elementRef = inject(ElementRef);
  private routerSubscription?: Subscription;
  private readonly document = inject(DOCUMENT);
  private scrollListener?: (event: CustomEvent) => void;

  // Cached DOM references
  private ionContent?: HTMLElement;
  private headerElement?: HTMLElement;
  private bodyElement?: HTMLElement;

  // Scroll state management
  private currentProgress = 0;
  private lastScrollTop = 0;

  // Browser check cached
  private readonly isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    // Cache DOM references
    this.ionContent = this.elementRef.nativeElement as HTMLElement;
    this.bodyElement = this.document.body;

    // Enable scroll events
    if (!(this.ionContent as any).scrollEvents) {
      (this.ionContent as any).scrollEvents = true;
    }

    // Find header element
    this.findHeaderElement();

    // Set up scroll event listener
    this.scrollListener = this.handleScroll.bind(this);
    this.ionContent.addEventListener('ionScroll', this.scrollListener as EventListener);

    // Reset scroll on route change
    this.routerSubscription = this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.reset();
      // Re-find header after route change (use RAF for better timing)
      requestAnimationFrame(() => {
        this.findHeaderElement();
        this.updateProgress(0);
      });
    });
  }

  private handleScroll(event: CustomEvent): void {
    const scrollTop = event.detail?.scrollTop || 0;
    const scrollDelta = scrollTop - this.lastScrollTop;

    // Get scroll container and calculate if we're at the bottom
    const scrollElement = (this.ionContent as any)?.scrollEl;
    let isAtBottom = false;
    let maxScrollTop = scrollTop;

    if (scrollElement) {
      const scrollHeight = scrollElement.scrollHeight || 0;
      const clientHeight = scrollElement.clientHeight || 0;
      maxScrollTop = Math.max(0, scrollHeight - clientHeight);

      // Check if we're at or near the bottom (within 5px threshold)
      isAtBottom = scrollTop >= maxScrollTop - 5;
    }

    // Calculate scroll progress (0 to 1)
    // If at bottom, always set progress to 1
    let calculatedProgress: number;

    if (scrollTop <= 0) {
      calculatedProgress = 0;
    } else if (isAtBottom || (maxScrollTop > 0 && maxScrollTop < FADE_END)) {
      const effectiveFadeEnd = Math.max(FADE_END, maxScrollTop);
      const effectiveFadeStart = Math.min(FADE_START, maxScrollTop * 0.25);
      const effectiveRange = effectiveFadeEnd - effectiveFadeStart;

      if (isAtBottom || effectiveRange <= 0) {
        calculatedProgress = 1;
      } else {
        calculatedProgress = scrollTop <= effectiveFadeStart ? 0 : Math.min(1, (scrollTop - effectiveFadeStart) / effectiveRange);
      }
    } else {
      // Normal case: content is longer than FADE_END
      calculatedProgress = scrollTop <= FADE_START ? 0 : Math.min(1, (scrollTop - FADE_START) / FADE_RANGE);
    }

    // Determine progress based on scroll direction
    let progress: number;
    if (scrollTop <= 0) {
      progress = this.currentProgress = 0;
    } else if (scrollDelta < 0 && !isAtBottom) {
      // Scrolling up: gradually decrease progress
      const decreasedProgress = Math.max(0, this.currentProgress - SCROLL_UP_STEP);
      this.currentProgress = Math.min(decreasedProgress, calculatedProgress);
      progress = this.currentProgress;
    } else {
      // Scrolling down or no movement: use calculated progress
      progress = this.currentProgress = calculatedProgress;
    }

    this.lastScrollTop = scrollTop;

    // Update header and footer (use RAF for smooth updates)
    requestAnimationFrame(() => {
      this.updateProgress(progress);
      this.updateFooterClass(progress, scrollDelta, scrollTop);
    });
  }

  private updateProgress(progress: number): void {
    const progressStr = progress.toString();

    // Update header
    if (this.headerElement) {
      this.headerElement.style.setProperty('--scroll-progress', progressStr);
    }

    // Update footer via body
    if (this.bodyElement) {
      this.bodyElement.style.setProperty('--scroll-progress', progressStr);
    }
  }

  private updateFooterClass(progress: number, scrollDelta: number, scrollTop: number): void {
    if (!this.bodyElement) return;

    const shouldAddClass = progress >= SCROLLING_DOWN_THRESHOLD && scrollDelta > 0 && scrollTop > SCROLL_TOP_THRESHOLD;

    if (shouldAddClass) {
      this.bodyElement.classList.add('scrolling-down');
      showFooter.set(false);
    } else {
      this.bodyElement.classList.remove('scrolling-down');
      showFooter.set(true);
    }
  }

  private findHeaderElement(): void {
    if (!this.isBrowser || !this.ionContent) return;

    // Look in parent elements first (most common case)
    let parent = this.ionContent.parentElement;
    for (let i = 0; i < 10 && parent; i++) {
      const header = parent.querySelector('ion-header');
      if (header) {
        this.headerElement = header as HTMLElement;
        return;
      }
      parent = parent.parentElement;
    }

    // Fallback to document query (for edge cases)
    this.headerElement = (this.document.querySelector('ion-header') as HTMLElement) || undefined;
  }

  private reset(): void {
    this.currentProgress = 0;
    this.lastScrollTop = 0;

    if (this.bodyElement) {
      this.bodyElement.style.setProperty('--scroll-progress', '0');
      this.bodyElement.classList.remove('scrolling-down');
    }

    this.updateProgress(0);
  }

  ngOnDestroy(): void {
    if (!this.isBrowser) return;

    if (this.scrollListener && this.ionContent) {
      this.ionContent.removeEventListener('ionScroll', this.scrollListener as EventListener);
    }
    this.routerSubscription?.unsubscribe();
    this.reset();
  }
}
