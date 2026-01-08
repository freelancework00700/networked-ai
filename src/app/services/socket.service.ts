import { AuthService } from './auth.service';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { inject, Injectable, OnDestroy, signal, effect } from '@angular/core';
import { ClientToServerEvents, ServerToClientEvents } from '@/interfaces/socket-events';
import { FeedService } from '@/services/feed.service';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private currentUserId = '';
  private authService = inject(AuthService);
  private feedService = inject(FeedService);
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

  constructor() {
    effect(() => {
      const userId = this.authService.currentUser()?.id || '';
      if (userId !== this.currentUserId) {
        this.handleUserChange(userId);
      }
    });
  }

  private handleUserChange(newUserId: string): void {
    // Disconnect current socket if user changed
    if (this.currentUserId !== newUserId) {
      this.currentUserId = newUserId;
      
      // Reconnect if new user is logged in (force reconnection)
      if (newUserId) {
        this.connect(true);
      } else {
        // User logged out, just disconnect
        this.disconnect();
      }
    }
  }

  connect(force = false): void {
    // If socket exists and not forcing reconnection, return early
    if (this.socket && !force) return;

    // If forcing reconnection, disconnect first
    if (force && this.socket) {
      this.disconnect();
    }

    const socketUrl = environment.socketUrl;

    this.socket = io(socketUrl, {
      autoConnect: true,
      transports: ['websocket']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      const userId = this.authService.currentUser()?.id;
      if (userId) {
        this.socket?.emit('register', userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connect_error', error);
    });

    // Register success handler
    this.socket.on('register:success', (data) => {
      console.log('Socket registration successful:', data);
    });

    // Feed event handlers
    this.socket.on('feed:created', (payload) => {
      console.log('Feed created event received:', payload);
      const feed = payload?.feed;
      if (!feed) return;
      this.feedService.applyFeedCreated(feed);
    });

    this.socket.on('feed:updated', (payload) => {
      console.log('Feed updated event received:', payload);
      const feed = payload?.feed;
      if (!feed) return;
      this.feedService.applyFeedUpdated(feed);
    });

    this.socket.on('feed:deleted', (payload) => {
      console.log('Feed deleted event received:', payload);
      const feedId = payload?.feed_id;
      if (!feedId) return;
      this.feedService.applyFeedDeleted(feedId);
    });

    this.socket.on('feed:comment:created', (payload) => {
      console.log('Feed comment created event received:', payload);
      const feedId = payload?.feed_id;
      const comment = payload?.comment;
      if (feedId && comment) {
        this.feedService.applyCommentCreated(feedId, comment);
      }
    });

    this.socket.on('feed:comment:updated', (payload) => {
      console.log('Feed comment updated event received:', payload);
      const feedId = payload?.feed_id;
      const comment = payload?.comment;
      if (feedId && comment) {
        this.feedService.applyCommentUpdated(feedId, comment);
      }
    });

    this.socket.on('feed:comment:deleted', (payload) => {
      console.log('Feed comment deleted event received:', payload);
      const feedId = payload?.feed_id;
      const commentId = payload?.comment_id;
      if (feedId && commentId) {
        this.feedService.applyCommentDeleted(feedId, commentId);
      }
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  emit<E extends keyof ClientToServerEvents>(
    eventName: E,
    ...args: Parameters<NonNullable<ClientToServerEvents[E]>>
  ): void {
    if (!this.socket) return;
    this.socket.emit(eventName, ...(args as any));
  }

  on<E extends keyof ServerToClientEvents>(
    eventName: E,
    handler: ServerToClientEvents[E]
  ): void {
    if (!this.socket) return;
    this.socket.on(eventName, handler as any);
  }

  off<E extends keyof ServerToClientEvents>(
    eventName: E,
    handler?: ServerToClientEvents[E]
  ): void {
    if (!this.socket) return;
    if (handler) {
      this.socket.off(eventName as any, handler as any);
    } else {
      this.socket.removeAllListeners(eventName as any);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}

