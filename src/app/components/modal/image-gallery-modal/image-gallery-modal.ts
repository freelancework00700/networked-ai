import { HttpClient } from '@angular/common/http';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { environment } from 'src/environments/environment';
import { LazyImageDirective } from '@/directives/lazy-image.directive';
import { of, Subject, switchMap, catchError, debounceTime, distinctUntilChanged } from 'rxjs';
import { Input, inject, OnInit, signal, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader, IonFooter, IonToolbar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';

interface UnsplashPhoto {
  id: string;
  urls: {
    thumb: string;
    regular: string;
  };
}

interface UnsplashSearchResponse {
  total_pages: number;
  results: UnsplashPhoto[];
}

@Component({
  selector: 'image-gallery-modal',
  styleUrl: './image-gallery-modal.scss',
  templateUrl: './image-gallery-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, IonHeader, Searchbar, IonFooter, IonContent, IonToolbar, IonInfiniteScroll, LazyImageDirective, IonInfiniteScrollContent]
})
export class ImageGalleryModal implements OnInit {
  // inputs
  @Input() multiSelect = false;
  @Input() title = 'Select Image';

  // services
  private http = inject(HttpClient);
  private modalService = inject(ModalService);

  // observables
  private searchSubject = new Subject<string>();

  // signals
  hasMore = signal(true);
  currentPage = signal(1);
  searchQuery = signal('');
  isSearching = signal(false);
  isLoadingMore = signal(false);
  photos = signal<UnsplashPhoto[]>([]);
  selectedPhotos = signal<UnsplashPhoto[]>([]);

  // constants
  private readonly PER_PAGE = 20;
  private readonly DEFAULT_QUERY = 'nature';

  ngOnInit(): void {
    this.setupSearch();
    this.searchSubject.next('');
  }

  private setupSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((query: string) => {
          this.resetPagination();
          return this.searchPhotos(query.trim() || this.DEFAULT_QUERY, 1);
        })
      )
      .subscribe({
        next: (response) => this.handleSearchResponse(response),
        error: () => this.handleSearchError()
      });
  }

  private resetPagination(): void {
    this.photos.set([]);
    this.hasMore.set(true);
    this.currentPage.set(1);
  }

  private handleSearchResponse(response: UnsplashSearchResponse): void {
    if (response.results?.length > 0) {
      this.photos.set(response.results);
      this.hasMore.set(response.total_pages > 1);
    } else {
      this.photos.set([]);
      this.hasMore.set(false);
    }
    this.isSearching.set(false);
    this.isLoadingMore.set(false);
  }

  private handleSearchError(): void {
    this.photos.set([]);
    this.hasMore.set(false);
    this.isSearching.set(false);
    this.isLoadingMore.set(false);
  }

  private searchPhotos(query: string, page: number) {
    // only set searching state for first page, loading more is handled in onInfiniteScroll
    if (page === 1) {
      this.isSearching.set(true);
    }

    return this.http
      .get<UnsplashSearchResponse>('https://api.unsplash.com/search/photos', {
        params: {
          page,
          query,
          per_page: this.PER_PAGE,
          client_id: environment.unsplashApiKey
        }
      })
      .pipe(
        catchError(() => {
          return of({ total_pages: 0, results: [] });
        })
      );
  }

  onSearchInput(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onInfiniteScroll(event: Event): void {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;

    if (this.isLoadingMore() || !this.hasMore()) {
      infiniteScroll.complete();
      return;
    }

    const nextPage = this.currentPage() + 1;
    const query = this.searchQuery().trim() || this.DEFAULT_QUERY;

    this.isLoadingMore.set(true);

    this.searchPhotos(query, nextPage).subscribe({
      next: (response) => {
        if (response.results?.length > 0) {
          this.photos.update((current) => [...current, ...response.results]);
          this.currentPage.set(nextPage);
          this.hasMore.set(nextPage < response.total_pages);
        } else {
          this.hasMore.set(false);
        }
        this.isLoadingMore.set(false);
        infiniteScroll.complete();
      },
      error: () => {
        this.isLoadingMore.set(false);
        infiniteScroll.complete();
      }
    });
  }

  selectPhoto(photo: UnsplashPhoto): void {
    if (this.multiSelect) {
      this.togglePhotoSelection(photo);
    } else {
      this.modalService.close(photo.urls.regular);
    }
  }

  togglePhotoSelection(photo: UnsplashPhoto): void {
    this.selectedPhotos.update((photos) => {
      const index = photos.findIndex((p) => p.id === photo.id);
      return index >= 0 ? photos.filter((p) => p.id !== photo.id) : [...photos, photo];
    });
  }

  isPhotoSelected(photo: UnsplashPhoto): boolean {
    return this.selectedPhotos().some((p) => p.id === photo.id);
  }

  getSelectionIndex(photo: UnsplashPhoto): number {
    const index = this.selectedPhotos().findIndex((p) => p.id === photo.id);
    return index >= 0 ? index + 1 : 0;
  }

  removeSelectedPhoto(photo: UnsplashPhoto): void {
    this.selectedPhotos.update((photos) => photos.filter((p) => p.id !== photo.id));
  }

  confirmSelection(): void {
    const urls = this.selectedPhotos().map((photo) => photo.urls.regular);
    if (urls.length > 0) {
      this.modalService.close(urls);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }
}
