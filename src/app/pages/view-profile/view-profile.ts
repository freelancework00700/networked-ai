import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, signal, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonContent, IonIcon, ModalController } from '@ionic/angular/standalone';
import { Swiper } from 'swiper';
import { DefaultProfile } from './components/default-profile/default-profile';
import { AttendedEvents } from './components/attended-events/attended-events';
import { Upcoming } from './components/upcoming/upcoming';
import { Posts } from './components/posts/posts';
import { Achievements } from './components/achievements/achievements';
import { ShareProfileDialog } from './components/share-profile-dialog/share-profile-dialog';
import { ProfileLongPressMenu } from './components/profile-long-press-menu/profile-long-press-menu';

export interface ProfileLink {
  type: 'website' | 'phone' | 'snapchat' | 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  value: string;
}

export interface Account {
  id: string;
  name: string;
  image: string;
}

@Component({
  selector: 'view-profile',
  styleUrl: './view-profile.scss',
  templateUrl: './view-profile.html',
  imports: [IonContent, IonIcon, DecimalPipe, DefaultProfile, AttendedEvents, Upcoming, Posts, Achievements]
})
export class ViewProfile implements OnInit, AfterViewInit, OnDestroy {
  private modalCtrl = inject(ModalController);
  
  activeTab = signal<'profile' | 'attended' | 'upcoming' | 'posts' | 'achievements'>('profile');
  tabSwiper?: Swiper;
  
  @ViewChild('tabSwiperContainer', { static: false }) tabSwiperContainer?: ElementRef<HTMLDivElement>;
  
  userName = signal('Sandra Tanner');
  selectorOpen = signal(false);
  menuOpen = signal(false);
  
  accounts = signal<Account[]>([
    { id: '1', name: 'Sandra Tanner', image: '/assets/svg/user_image.svg' },
    { id: '2', name: 'Jennifer C.', image: '/assets/svg/user_image.svg' },
    { id: '3', name: 'Loy T.', image: '/assets/svg/user_image.svg' }
  ]);
  
  selectedAccount = signal<Account>({ id: '1', name: 'Sandra Tanner', image: '/assets/svg/user_image.svg' });
  networksCount = signal(249);
  eventsCount = signal(60);
  attendedCount = signal(75);
  location = signal('Atlanta, GA');
  jobTitle = signal('Founder & CEO, Cortazzo Consulting');
  locationDetail = signal('ATL, Georgia');
  tags = signal(['Believer', 'Entrepreneur', 'AI Thought Leader', 'Community Builder', 'International Traveler']);
  linksExpanded = signal(false);
  
  // Networking Score
  networkingScore = signal(37890);
  networkingScoreTarget = signal(40000);
  
  getProgressPercentage(): number {
    return Math.min((this.networkingScore() / this.networkingScoreTarget()) * 100, 100);
  }
  
  links = signal<ProfileLink[]>([
    { type: 'website', value: 'website.com' },
    { type: 'phone', value: '+1 097 728 772' },
    { type: 'snapchat', value: 'usernamehere' },
    { type: 'twitter', value: 'usernamehere' },
    { type: 'facebook', value: 'Page Name Here' },
    { type: 'instagram', value: 'usernamehere' },
    { type: 'linkedin', value: 'Name Here' }
  ]);

  toggleLinks() {
    this.linksExpanded.set(!this.linksExpanded());
  }

  toggleSelector() {
    this.selectorOpen.set(!this.selectorOpen());
  }

  selectAccount(account: Account) {
    this.selectedAccount.set(account);
    this.userName.set(account.name);
    this.selectorOpen.set(false);
  }

  addAccount() {
    // Handle add account logic
    this.selectorOpen.set(false);
  }

  signOut() {
    // Handle sign out logic
    this.selectorOpen.set(false);
  }

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
    // Close account selector if open
    if (this.selectorOpen()) {
      this.selectorOpen.set(false);
    }
  }

  handleNFC() {
    // Handle NFC action
    this.menuOpen.set(false);
  }

  handleFavorites() {
    // Handle Favorites action
    this.menuOpen.set(false);
  }

  handleSettings() {
    // Handle Settings action
    this.menuOpen.set(false);
  }

  async openShareProfileDialog() {
    const modal = await this.modalCtrl.create({
      component: ShareProfileDialog,
      mode: 'ios',
      handle: true,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
      backdropDismiss: true,
      cssClass: 'share-profile-modal'
    });

    await modal.present();
  }

  private longPressTimer?: any;
  private isLongPress = false;

  onProfilePictureTouchStart(event: TouchEvent | MouseEvent) {
    event.preventDefault();
    this.isLongPress = false;
    this.longPressTimer = setTimeout(() => {
      this.isLongPress = true;
      this.openProfileLongPressMenu();
    }, 500); // 500ms for long press
  }

  onProfilePictureTouchEnd(event: TouchEvent | MouseEvent) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  onProfilePictureTouchMove(event: TouchEvent | MouseEvent) {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
    }
  }

  async openProfileLongPressMenu() {
    const modal = await this.modalCtrl.create({
      component: ProfileLongPressMenu,
      mode: 'ios',
      backdropDismiss: true,
      cssClass: 'profile-long-press-modal',
      showBackdrop: true,
      componentProps: {
        userName: this.userName(),
        userImage: '/assets/svg/user_image.svg'
      }
    });

    await modal.present();
  }

  getLinkIcon(type: string): string {
    const iconMap: Record<string, string> = {
      website: 'globe-outline',
      phone: 'call-outline',
      snapchat: 'logo-snapchat',
      twitter: 'logo-twitter',
      facebook: 'logo-facebook',
      instagram: 'logo-instagram',
      linkedin: 'logo-linkedin'
    };
    return iconMap[type] || 'link-outline';
  }

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.initializeSwiper();
    }, 100);
  }

  initializeSwiper() {
    if (this.tabSwiperContainer?.nativeElement && !this.tabSwiper) {
      this.tabSwiper = new Swiper(this.tabSwiperContainer.nativeElement, {
        speed: 300,
        spaceBetween: 0,
        slidesPerView: 1,
        initialSlide: 0,
        allowTouchMove: true,
        allowSlidePrev: true, // Enable swiping in both directions
        allowSlideNext: true,
        touchRatio: 1,
        touchAngle: 45,
        grabCursor: true,
        resistance: true,
        resistanceRatio: 0.85,
        watchOverflow: true,
        on: {
          slideChange: (swiper) => {
            // Map swiper indices (0-4) to tabs (profile, attended, upcoming, posts, achievements)
            const tabs: Array<'profile' | 'attended' | 'upcoming' | 'posts' | 'achievements'> = 
              ['profile', 'attended', 'upcoming', 'posts', 'achievements'];
            this.activeTab.set(tabs[swiper.activeIndex]);
          }
        }
      });
    }
  }

  setActiveTab(tab: 'profile' | 'attended' | 'upcoming' | 'posts' | 'achievements') {
    this.activeTab.set(tab);
    
    setTimeout(() => {
      if (!this.tabSwiper) {
        this.initializeSwiper();
      }
      // Map tabs to swiper indices
      const tabs: Array<'profile' | 'attended' | 'upcoming' | 'posts' | 'achievements'> = 
        ['profile', 'attended', 'upcoming', 'posts', 'achievements'];
      const tabIndex = tabs.indexOf(tab);
      if (this.tabSwiper && tabIndex >= 0) {
        this.tabSwiper.slideTo(tabIndex);
      }
    }, 50);
  }

  ngOnDestroy() {
    if (this.tabSwiper) {
      this.tabSwiper.destroy(true, true);
    }
  }
}

