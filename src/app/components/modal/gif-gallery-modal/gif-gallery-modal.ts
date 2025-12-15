import { HttpClient } from '@angular/common/http';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Searchbar } from '@/components/common/searchbar';
import { environment } from 'src/environments/environment';
import { LazyImageDirective } from '@/directives/lazy-image.directive';
import { of, Subject, switchMap, catchError, debounceTime, distinctUntilChanged } from 'rxjs';
import { Input, inject, OnInit, signal, Component, ChangeDetectionStrategy } from '@angular/core';
import { IonFooter, IonToolbar, IonContent, IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';

interface TenorGif {
  id: string;
  media: Array<{
    gif: { url: string };
    tinygif: { url: string };
  }>;
}

interface TenorSearchResponse {
  next: string;
  results: TenorGif[];
}

@Component({
  selector: 'gif-gallery-modal',
  styleUrl: './gif-gallery-modal.scss',
  templateUrl: './gif-gallery-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    Searchbar,
    IonFooter,
    IonContent,
    IonToolbar,
    IonInfiniteScroll,
    LazyImageDirective,
    IonInfiniteScrollContent
  ]
})
export class GifGalleryModal implements OnInit {
  // inputs
  @Input() multiSelect = false;
  @Input() title = 'Select GIF';

  // services
  private http = inject(HttpClient);
  private modalService = inject(ModalService);

  // observables
  private searchSubject = new Subject<string>();

  // signals
  hasMore = signal(true);
  searchQuery = signal('');
  isSearching = signal(false);
  isLoadingMore = signal(false);
  gifs = signal<TenorGif[]>([]);
  nextPos = signal<string | null>(null);
  selectedGifs = signal<TenorGif[]>([]);

  // constants
  private readonly LIMIT = 20;
  private readonly DEFAULT_QUERY = 'excited';

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
          return this.searchGifs(query.trim() || this.DEFAULT_QUERY, null);
        })
      )
      .subscribe({
        next: (response) => this.handleSearchResponse(response),
        error: () => this.handleSearchError()
      });
  }

  private resetPagination(): void {
    this.gifs.set([]);
    this.hasMore.set(true);
    this.nextPos.set(null);
  }

  private handleSearchResponse(response: TenorSearchResponse): void {
    if (response.results?.length > 0) {
      this.gifs.set(response.results);
      this.nextPos.set(response.next || null);
      this.hasMore.set(!!response.next);
    } else {
      this.resetResults();
    }
    this.isSearching.set(false);
    this.isLoadingMore.set(false);
  }

  private handleSearchError(): void {
    this.resetResults();
    this.isSearching.set(false);
    this.isLoadingMore.set(false);
  }

  private resetResults(): void {
    this.gifs.set([]);
    this.hasMore.set(false);
    this.nextPos.set(null);
  }

  private searchGifs(query: string, pos: string | null) {
    if (!pos) {
      this.isSearching.set(true);
    }

    const params: Record<string, string | number> = {
      q: query,
      limit: this.LIMIT,
      media_filter: 'gif,tinygif',
      key: environment.tenorApiKey
    };

    if (pos) {
      params['pos'] = pos;
    }

    return this.http.get<TenorSearchResponse>('https://g.tenor.com/v1/search', { params }).pipe(catchError(() => of({ next: '', results: [] })));
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

    const nextPos = this.nextPos();
    if (!nextPos) {
      this.hasMore.set(false);
      infiniteScroll.complete();
      return;
    }

    this.isLoadingMore.set(true);
    const query = this.searchQuery().trim() || this.DEFAULT_QUERY;

    this.searchGifs(query, nextPos).subscribe({
      next: (response) => {
        if (response.results?.length > 0) {
          this.gifs.update((current) => [...current, ...response.results]);
          this.nextPos.set(response.next || null);
          this.hasMore.set(!!response.next);
        } else {
          this.hasMore.set(false);
          this.nextPos.set(null);
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

  selectGif(gif: TenorGif): void {
    if (this.multiSelect) {
      this.toggleGifSelection(gif);
    } else {
      const gifUrl = this.getGifUrl(gif);
      if (gifUrl) {
        this.modalService.close(gifUrl);
      }
    }
  }

  toggleGifSelection(gif: TenorGif): void {
    this.selectedGifs.update((gifs) => {
      const index = gifs.findIndex((g) => g.id === gif.id);
      return index >= 0 ? gifs.filter((g) => g.id !== gif.id) : [...gifs, gif];
    });
  }

  isGifSelected(gif: TenorGif): boolean {
    return this.selectedGifs().some((g) => g.id === gif.id);
  }

  getSelectionIndex(gif: TenorGif): number {
    const index = this.selectedGifs().findIndex((g) => g.id === gif.id);
    return index >= 0 ? index + 1 : 0;
  }

  removeSelectedGif(gif: TenorGif): void {
    this.selectedGifs.update((gifs) => gifs.filter((g) => g.id !== gif.id));
  }

  confirmSelection(): void {
    const urls = this.selectedGifs()
      .map((gif) => this.getGifUrl(gif))
      .filter((url): url is string => !!url);
    if (urls.length > 0) {
      this.modalService.close(urls);
    }
  }

  getTinyGifUrl(gif: TenorGif): string {
    return gif.media?.[0]?.tinygif?.url || '';
  }

  private getGifUrl(gif: TenorGif): string {
    return gif.media?.[0]?.gif?.url || '';
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }
}
