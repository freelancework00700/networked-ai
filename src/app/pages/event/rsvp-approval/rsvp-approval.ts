import { Button } from '@/components/form/button';
import { EventService } from '@/services/event.service';
import { ModalService } from '@/services/modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Searchbar } from '@/components/common/searchbar';
import { ToasterService } from '@/services/toaster.service';
import { EmptyState } from '@/components/common/empty-state';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { getImageUrlOrDefault, onImageError } from '@/utils/helper';
import { SegmentButton, SegmentButtonItem } from '@/components/common/segment-button';
import { IonHeader, IonToolbar, IonContent, NavController } from '@ionic/angular/standalone';
import { Component, inject, signal, ChangeDetectionStrategy, OnInit, computed, effect } from '@angular/core';

@Component({
  selector: 'rsvp-approval',
  styleUrl: './rsvp-approval.scss',
  templateUrl: './rsvp-approval.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonToolbar, IonContent, Button, CommonModule, SegmentButton, EmptyState, Searchbar, NgOptimizedImage]
})
export class RsvpApproval implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private navCtrl = inject(NavController);
  private eventService = inject(EventService);
  private toasterService = inject(ToasterService);
  private modalService = inject(ModalService);

  pendingRequests = signal<any[]>([]);
  processedRequests = signal<any[]>([]);
  selectedTab = signal<string>('pending');
  processingRequestId = signal<string | null>(null);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  eventId = signal<string>('');

  segmentItems: SegmentButtonItem[] = [
    { value: 'pending', label: 'Pending Actions' },
    { value: 'processed', label: 'Processed' }
  ];

  currentRequests = computed(() => {
    return this.selectedTab() === 'pending' ? this.pendingRequests() : this.processedRequests();
  });

  filteredRequests = computed(() => {
    const requests = this.currentRequests();
    const query = this.searchQuery().toLowerCase().trim();

    if (!query) {
      return requests;
    }

    return requests.filter((request) => {
      const userName = (request.user?.name || '').toLowerCase();
      const userEmail = (request.user?.email || '').toLowerCase();
      return userName.includes(query) || userEmail.includes(query);
    });
  });

  isProcessing = computed(() => this.processingRequestId() !== null);

  private isInitialLoad = true;

  constructor() {
    effect(() => {
      const tab = this.selectedTab();
      const eventId = this.eventId();
      // Skip effect on initial load (handled in ngOnInit)
      if (this.isInitialLoad) return;
      // Load requests when tab changes
      if (eventId) {
        this.loadRequests(tab);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.eventId.set(eventId);
      await this.loadRequests('pending');
      this.isInitialLoad = false;
    }
  }

  async loadRequests(tab: string): Promise<void> {
    const eventId = this.eventId();
    if (!eventId) return;

    this.isLoading.set(true);
    try {
      if (tab === 'pending') {
        const response = await this.eventService.getPendingRsvpRequests(eventId, 1, 20);
        this.pendingRequests.set(response?.data?.data || response?.data || []);
      } else {
        const response = await this.eventService.getProcessedRsvpRequests(eventId, 1, 20);
        this.processedRequests.set(response?.data?.data || response?.data || []);
      }
    } catch (error) {
      console.error('Error loading RSVP requests:', error);
      this.toasterService.showError('Failed to load RSVP requests');
    } finally {
      this.isLoading.set(false);
    }
  }

  onTabChange(tab: string): void {
    this.selectedTab.set(tab);
    // loadRequests will be called by the effect
  }

  goBack(): void {
    this.navCtrl.back();
  }

  async approveRequest(requestId: string): Promise<void> {
    if (this.processingRequestId()) return;

    this.processingRequestId.set(requestId);
    const loadingModal = await this.modalService.openLoadingModal('Processing approval...');

    try {
      await this.eventService.approveOrRejectRsvpRequest(this.eventId(), requestId, 'Approved');

      // Remove from pending and add to processed
      const pending = this.pendingRequests();
      const request = pending.find((req) => req.id === requestId);
      if (request) {
        this.pendingRequests.set(pending.filter((req) => req.id !== requestId));
        this.processedRequests.update((processed) => [...processed, { ...request, status: 'Approved' }]);
      }

      this.toasterService.showSuccess('RSVP request approved successfully');
    } catch (error) {
      console.error('Error approving RSVP request:', error);
      this.toasterService.showError('Failed to approve RSVP request');
    } finally {
      await loadingModal.dismiss();
      this.processingRequestId.set(null);
    }
  }

  async rejectRequest(requestId: string): Promise<void> {
    if (this.processingRequestId()) return;

    this.processingRequestId.set(requestId);
    const loadingModal = await this.modalService.openLoadingModal('Processing rejection...');

    try {
      await this.eventService.approveOrRejectRsvpRequest(this.eventId(), requestId, 'Rejected');

      // Remove from pending and add to processed
      const pending = this.pendingRequests();
      const request = pending.find((req) => req.id === requestId);
      if (request) {
        this.pendingRequests.set(pending.filter((req) => req.id !== requestId));
        this.processedRequests.update((processed) => [...processed, { ...request, status: 'Rejected' }]);
      }

      this.toasterService.showSuccess('RSVP request rejected successfully');
    } catch (error) {
      console.error('Error rejecting RSVP request:', error);
      this.toasterService.showError('Failed to reject RSVP request');
    } finally {
      await loadingModal.dismiss();
      this.processingRequestId.set(null);
    }
  }

  getImageUrl(thumbnailUrl: string | null | undefined): string {
    return getImageUrlOrDefault(thumbnailUrl || undefined, 'assets/images/profile.jpeg');
  }

  onImageError(event: Event): void {
    onImageError(event);
  }
}
