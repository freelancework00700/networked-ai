import { input, output, Component, inject, signal, computed, effect, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonInfiniteScroll, IonInfiniteScrollContent } from '@ionic/angular/standalone';
import { Subject, debounceTime, distinctUntilChanged, switchMap, from, map } from 'rxjs';
import { EmptyState } from '@/components/common/empty-state';
import { UserCardList } from '@/components/card/user-card-list';
import { UserService } from '@/services/user.service';
import { IUser } from '@/interfaces/IUser';

@Component({
  selector: 'network-list-view',
  imports: [EmptyState, UserCardList, IonInfiniteScroll, IonInfiniteScrollContent],
  styleUrl: './network-list-view.scss',
  templateUrl: './network-list-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NetworkListView {
  // inputs
  searchQuery = input<string>('');

  // outputs
  clearSearch = output<void>();

  // services
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private searchSubject = new Subject<string>();

  // signals
  searchResults = signal<IUser[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(0);
  isLoadingMore = signal<boolean>(false);

  // computed
  users = computed(() => {
    const search = this.searchQuery().toLowerCase().trim();
    if (!search) return [];
    return this.searchResults();
  });

  hasMore = computed(() => {
    return this.currentPage() < this.totalPages();
  });

  constructor() {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          const trimmedQuery = query.trim();
          if (!trimmedQuery) {
            // Clear results when query is empty
            this.searchResults.set([]);
            this.currentPage.set(1);
            this.totalPages.set(0);
            return from(Promise.resolve([]));
          }

          // Reset pagination for new search
          this.currentPage.set(1);
          this.totalPages.set(0);
          
          return from(this.userService.searchUsers(trimmedQuery, 1, 10)).pipe(
            map((result) => {
              // Only replace data when API response arrives successfully
              this.searchResults.set(result.users);
              this.currentPage.set(result.pagination.currentPage);
              this.totalPages.set(result.pagination.totalPages);
              return result.users;
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe();

    // Watch searchQuery changes and emit to subject
    effect(() => {
      this.searchSubject.next(this.searchQuery());
    });
  }

  handleClick(id: string): void {
    console.log('Add', id);
  }

  loadMoreUsers = async (event: Event): Promise<void> => {
    const infiniteScroll = (event as CustomEvent).target as HTMLIonInfiniteScrollElement;
    const search = this.searchQuery().trim();
    
    if (this.isLoadingMore() || !this.hasMore() || !search) {
      infiniteScroll.complete();
      return;
    }
    
    try {
      this.isLoadingMore.set(true);
      
      const nextPage = this.currentPage() + 1;
      const result = await this.userService.searchUsers(search, nextPage, 10);
      
      // Append new results to existing ones
      this.searchResults.update(current => [...current, ...result.users]);
      this.currentPage.set(result.pagination.currentPage);
      this.totalPages.set(result.pagination.totalPages);
      
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      this.isLoadingMore.set(false);
      infiniteScroll.complete();
    }
  }
}
