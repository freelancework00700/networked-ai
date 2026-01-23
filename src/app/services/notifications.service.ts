import { NotificationType } from '@/enums/enums';
import { HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { BaseApiService } from '@/services/base-api.service';
import { INotification, INotificationPagination, INotificationsResponse } from '@/interfaces/INotification';

@Injectable({ providedIn: 'root' })
export class NotificationsService extends BaseApiService {
  currentPage = signal<number>(1);
  unreadCount = signal<number>(0);
  isLoading = signal<boolean>(false);
  notifications = signal<INotification[]>([]);
  currentType = signal<NotificationType>(NotificationType.ALL);
  pagination = signal<INotificationPagination>({
    limit: 10,
    totalPages: 1,
    totalCount: 0,
    currentPage: 1
  });

  applyNotificationUpsert(notification: INotification): void {
    this.notifications.update((current) => {
      const idx = current.findIndex((n) => n.id === notification.id);
      if (idx >= 0) {
        const next = [...current];
        next[idx] = { ...next[idx], ...notification };
        return next;
      }

      // prepend newest
      return [notification, ...current];
    });

    // keep pagination count somewhat in sync for new notifications
    const existingCount = this.notifications().length;
    this.pagination.update((p) => {
      const totalCount = Math.max(p.totalCount, existingCount);
      return { ...p, totalCount };
    });
  }

  async getNotifications(
    params: {
      page?: number;
      limit?: number;
      type?: string;
    } = {}
  ): Promise<{ notifications: INotification[]; pagination: INotificationPagination }> {
    try {
      const page = params.page ?? 1;
      const limit = params.limit ?? 10;

      let httpParams = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
      if (params.type) {
        httpParams = httpParams.set('type', params.type);
      }

      const response = await this.get<INotificationsResponse>('/notifications', {
        params: httpParams
      });

      const notifications = response?.data?.data || [];
      const pagination = response?.data?.pagination || {
        totalCount: 0,
        currentPage: page,
        totalPages: 1,
        limit
      };

      return { notifications, pagination };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async loadNotifications(
    params: {
      page?: number;
      limit?: number;
      type?: NotificationType;
      append?: boolean;
    } = {}
  ): Promise<{ notifications: INotification[]; pagination: INotificationPagination }> {
    try {
      this.isLoading.set(true);

      const page = params.page ?? this.currentPage();
      const type = params.type || this.currentType();
      const limit = params.limit ?? this.pagination().limit ?? 10;

      const response = await this.getNotifications({ page, limit, type });

      if (params.append) {
        this.notifications.update((current) => [...current, ...response.notifications]);
      } else {
        this.notifications.set(response.notifications);
      }

      this.pagination.set(response.pagination);
      this.currentPage.set(response.pagination.currentPage);
      this.currentType.set(type);

      return response;
    } catch (error) {
      console.error('Error loading notifications:', error);
      if (!params.append) {
        this.notifications.set([]);
      }
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async resetAndLoad(type?: NotificationType, limit?: number): Promise<void> {
    this.currentPage.set(1);
    this.currentType.set(type || NotificationType.ALL);
    await this.loadNotifications({ page: 1, limit, type, append: false });
    await this.fetchUnreadCount();
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      await this.put(`/notifications/${notificationId}/read`, {});
      this.notifications.update((notifications) => notifications.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)));
      await this.fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification read:', error);
      throw error;
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    try {
      await this.put('/notifications/read-all', {});
      this.notifications.update((notifications) => notifications.map((n) => ({ ...n, is_read: true })));
      await this.fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all notifications read:', error);
      throw error;
    }
  }

  async fetchUnreadCount(): Promise<void> {
    try {
      const response = await this.get<{ data: { count: number } }>('/notifications/unread-count');
      this.unreadCount.set(response?.data?.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }
}
