import { Injectable, signal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { BaseApiService } from '@/services/base-api.service';
import { FeedPost, FeedsResponse, MyFeedResponse, FeedResponse, FeedLikeResponse, FeedComment, FeedCommentsResponse, CommentLikeResponse, CommentResponse, FeedShareResponse, ReportReasonsResponse, ReportResponse } from '@/interfaces/IFeed';

@Injectable({ providedIn: 'root' })
export class FeedService extends BaseApiService {
  myPosts = signal<FeedPost[]>([]);
  posts = signal<FeedPost[]>([]);
  publicFeeds = signal<FeedPost[]>([]);
  networkedFeeds = signal<FeedPost[]>([]);
  
  // Pagination state for public feeds
  publicFeedsPage = signal(1);
  publicFeedsTotal = signal(0);
  publicFeedsHasMore = signal(true);
  
  // Pagination state for networked feeds
  networkedFeedsPage = signal(1);
  networkedFeedsTotal = signal(0);
  networkedFeedsHasMore = signal(true);
  
  // Pagination state for my feeds
  myFeedsPage = signal(1);
  myFeedsTotal = signal(0);
  myFeedsHasMore = signal(true);

  async getMyFeeds(params: {
    page?: number;
    limit?: number;
    append?: boolean; // If true, append to existing feeds instead of replacing
  } = {}): Promise<{ posts: FeedPost[]; total: number; page: number; limit: number }> {
    try {
      let httpParams = new HttpParams();
      
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      const response = await this.get<MyFeedResponse>('/feeds/me', { params: httpParams });
      const posts = response?.data?.data || [];
      const pagination = response?.data?.pagination;
      
      // Store feeds
      if (params.append) {
        // Append new posts to existing ones
        this.myPosts.update(current => [...current, ...posts]);
      } else {
        // Replace existing posts
        this.myPosts.set(posts);
      }
      
      // Update pagination state
      const currentPage = pagination?.currentPage || params?.page || 1;
      this.myFeedsPage.set(currentPage);
      this.myFeedsTotal.set(pagination?.totalCount || 0);
      const totalPages = pagination?.totalPages || Math.ceil((pagination?.totalCount || 0) / (params?.limit || 10));
      const hasMore = posts.length > 0 && currentPage < totalPages;
      this.myFeedsHasMore.set(hasMore);
      
      return {
        posts,
        total: pagination?.totalCount || 0,
        page: pagination?.currentPage || params?.page || 1,
        limit: params?.limit || 10
      };
    } catch (error) {
      console.error('Error fetching feeds:', error);
      throw error;
    }
  }

  async getFeeds(params: {
    is_public: boolean;
    page?: number;
    limit?: number;
    append?: boolean; // If true, append to existing feeds instead of replacing
  }): Promise<{ posts: FeedPost[]; total: number; page: number; limit: number }> {
    try {
      let httpParams = new HttpParams().set('is_public', params.is_public.toString());
      
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      const response = await this.get<FeedsResponse>('/feeds', { params: httpParams });
      const posts = response?.data?.data || [];
      const pagination = response?.data?.pagination;
      
      // Store feeds based on is_public
      if (params.is_public) {
        if (params.append) {
          // Append new posts to existing ones
          this.publicFeeds.update(current => [...current, ...posts]);
        } else {
          // Replace existing posts
          this.publicFeeds.set(posts);
        }
        // Update pagination state
        const currentPage = pagination?.currentPage || params?.page || 1;
        this.publicFeedsPage.set(currentPage);
        this.publicFeedsTotal.set(pagination?.totalCount || 0);
        const totalPages = pagination?.totalPages || 0;
        const hasMore = posts.length > 0 && currentPage < totalPages;
        this.publicFeedsHasMore.set(hasMore);
      } else {
        if (params.append) {
          // Append new posts to existing ones
          this.networkedFeeds.update(current => [...current, ...posts]);
        } else {
          // Replace existing posts
          this.networkedFeeds.set(posts);
        }
        // Update pagination state
        const currentPage = pagination?.currentPage || params?.page || 1;
        this.networkedFeedsPage.set(currentPage);
        this.networkedFeedsTotal.set(pagination?.totalCount || 0);
        const totalPages = pagination?.totalPages || 0;
        const hasMore = posts.length > 0 && currentPage < totalPages;
        this.networkedFeedsHasMore.set(hasMore);
      }
      
      // Also update the general posts signal for backward compatibility
      this.posts.set(posts);
      
      return {
        posts,
        total: pagination?.totalCount || 0,
        page: pagination?.currentPage || params?.page || 1,
        limit: params?.limit || 10
      };
    } catch (error) {
      console.error('Error fetching feeds:', error);
      throw error;
    }
  }

  async createPost(payload: Partial<FeedPost> & { content: string; is_public: boolean }): Promise<FeedResponse> {
    try {
      const response = await this.post<FeedResponse>('/feeds', payload);
      // Reload feeds in background (don't await - allow UI to respond immediately)
      this.reloadAllFeeds();
      return response;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: string, payload: Partial<FeedPost> & { content: string; is_public: boolean }): Promise<FeedResponse> {
    try {
      const response = await this.put<FeedResponse>(`/feeds/${id}`, payload);
      // Reload feeds in background (don't await - allow UI to respond immediately)
      this.reloadAllFeeds();
      return response;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<FeedResponse> {
    try {
      const response = await this.delete<FeedResponse>(`/feeds/${id}`);
      // Reload feeds in background (don't await - modal should close after delete response)
      this.reloadAllFeeds();
      return response;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  /**
   * Resets all feed signals and pagination state, then reloads all feeds
   */
  async reloadAllFeeds(): Promise<void> {
    // Reset all feed signals and pagination state
    this.resetAllFeeds();
    
    // Reload all feeds by calling GET APIs
    const defaultLimit = 10;
    try {
      await Promise.all([
        this.getMyFeeds({ page: 1, limit: defaultLimit, append: false }),
        this.getFeeds({ is_public: true, page: 1, limit: defaultLimit, append: false }),
        this.getFeeds({ is_public: false, page: 1, limit: defaultLimit, append: false })
      ]);
    } catch (error) {
      console.error('Error reloading feeds:', error);
      // Don't throw - allow the operation to complete even if reload fails
    }
  }

  async toggleLike(feedId: string): Promise<FeedLikeResponse> {
    // Find the post to get current like status
    const findPost = (posts: FeedPost[]): FeedPost | undefined => {
      return posts.find(post => post.id === feedId);
    };

    // Get current like status from any feed signal
    let currentPost: FeedPost | undefined;
    currentPost = findPost(this.myPosts()) || 
                  findPost(this.publicFeeds()) || 
                  findPost(this.networkedFeeds()) || 
                  findPost(this.posts());

    const currentIsLiked = currentPost?.is_like || false;
    const newIsLiked = !currentIsLiked; // Toggle the like status

    // Optimistic update: Update UI immediately
    this.updatePostLikeStatus(feedId, newIsLiked);

    try {
      // Call API
      const response = await this.post<FeedLikeResponse>(`/feed-likes/${feedId}`, {});
      
      // Update again based on actual API response
      // content: true means liked, content: false means unliked
      this.updatePostLikeStatus(feedId, response.data.content);
      
      return response;
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      this.updatePostLikeStatus(feedId, currentIsLiked);
      throw error;
    }
  }

  private updatePostLikeStatus(feedId: string, isLiked: boolean): void {
    // Helper function to update a post in an array
    const updatePostInArray = (posts: FeedPost[]): FeedPost[] => {
      return posts.map(post => {
        if (post.id === feedId) {
          const currentIsLiked = post.is_like || false;
          const currentLikes = post.total_likes || 0;
          
          // Only update if the like status actually changed
          if (currentIsLiked !== isLiked) {
            return {
              ...post,
              is_like: isLiked,
              total_likes: isLiked 
                ? currentLikes + 1 
                : Math.max(currentLikes - 1, 0)
            };
          }
        }
        return post;
      });
    };

    // Update in myPosts
    this.myPosts.update(updatePostInArray);
    
    // Update in publicFeeds
    this.publicFeeds.update(updatePostInArray);
    
    // Update in networkedFeeds
    this.networkedFeeds.update(updatePostInArray);
    
    // Update in general posts signal
    this.posts.update(updatePostInArray);
  }

  /**
   * Resets all feed signals and pagination state
   */
  private resetAllFeeds(): void {
    // Reset all feed signals
    this.myPosts.set([]);
    this.publicFeeds.set([]);
    this.networkedFeeds.set([]);
    this.posts.set([]);
    
    // Reset pagination state
    this.publicFeedsPage.set(1);
    this.networkedFeedsPage.set(1);
    this.myFeedsPage.set(1);
    this.publicFeedsTotal.set(0);
    this.networkedFeedsTotal.set(0);
    this.myFeedsTotal.set(0);
    this.publicFeedsHasMore.set(true);
    this.networkedFeedsHasMore.set(true);
    this.myFeedsHasMore.set(true);
  }

  async getPostById(postId: string): Promise<FeedPost | null> {
    try {
      const response = await this.get<FeedResponse>(`/feeds/${postId}`);
      if (response?.data) return response.data as FeedPost;
      return null;
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  async getFeedComments(feedId: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ comments: FeedComment[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      let httpParams = new HttpParams();
      
      if (params.page) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.limit) {
        httpParams = httpParams.set('limit', params.limit.toString());
      }

      const response = await this.get<FeedCommentsResponse>(`/feed-comments/feed/${feedId}`, { params: httpParams });
      const comments = response?.data?.data || [];
      const pagination = response?.data?.pagination;
      
      return {
        comments,
        total: pagination?.totalCount || 0,
        page: pagination?.currentPage || params?.page || 1,
        limit: params?.limit || 10,
        totalPages: pagination?.totalPages || 0
      };
    } catch (error) {
      console.error('Error fetching feed comments:', error);
      throw error;
    }
  }

  async toggleCommentLike(commentId: string): Promise<CommentLikeResponse> {
    try {
      const response = await this.post<CommentLikeResponse>(`/comment-likes/${commentId}`);
      return response;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      throw error;
    }
  }

  async createComment(payload: {
    feed_id: string;
    comment: string;
    parent_comment_id?: string | null;
    mention_ids?: string[];
  }): Promise<CommentResponse> {
    try {
      const response = await this.post<CommentResponse>('/feed-comments/', payload);
      return response;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<CommentResponse> {
    try {
      const response = await this.delete<CommentResponse>(`/feed-comments/${commentId}`);
      return response;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  async shareFeed(payload: {
    feed_id: string;
    peer_ids?: string[];
    send_entire_network?: boolean;
  }): Promise<FeedShareResponse> {
    try {
      const response = await this.post<FeedShareResponse>('/feed-shares/', payload);
      return response;
    } catch (error) {
      console.error('Error sharing feed:', error);
      throw error;
    }
  }

  async getReportReasons(): Promise<ReportReasonsResponse> {
    try {
      const response = await this.get<ReportReasonsResponse>('/report-reasons');
      return response;
    } catch (error) {
      console.error('Error fetching report reasons:', error);
      throw error;
    }
  }

  async reportFeed(payload: {
    feed_id: string;
    reason_id: string;
    reason?: string;
  }): Promise<ReportResponse> {
    try {
      const response = await this.post<ReportResponse>('/feed-reports/', payload);
      return response;
    } catch (error) {
      console.error('Error reporting feed:', error);
      throw error;
    }
  }

  async reportComment(payload: {
    comment_id: string;
    reason_id: string;
    reason?: string;
  }): Promise<ReportResponse> {
    try {
      const response = await this.post<ReportResponse>('/comment-reports/', payload);
      return response;
    } catch (error) {
      console.error('Error reporting comment:', error);
      throw error;
    }
  }
}
