import { Swiper } from 'swiper';
import { CommonModule } from '@angular/common';
import { Chip } from '@/components/common/chip';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { PostEventCard } from '@/components/card/post-event-card';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxMentionsModule, ChoiceWithIndices } from 'ngx-mentions';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, inject, signal, viewChild, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonToolbar, IonHeader, IonContent, NavController, IonFooter, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'new-post',
  styleUrl: './new-post.scss',
  templateUrl: './new-post.html',
  imports: [
    Chip,
    Button,
    IonIcon,
    IonHeader,
    IonFooter,
    IonContent,
    IonToolbar,
    CommonModule,
    PostEventCard,
    DragDropModule,
    NgxMentionsModule,
    ReactiveFormsModule
  ]
})
export class NewPost {
  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef<HTMLDivElement>;
  fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  cd = inject(ChangeDetectorRef);
  navCtrl = inject(NavController);
  sanitizer = inject(DomSanitizer);
  private fb = inject(FormBuilder);
  modalService = inject(ModalService);

  text = '';
  swiper?: Swiper;
  formattedText!: any;
  choices: any[] = [];
  mentions: ChoiceWithIndices[] = [];
  searchRegexp = new RegExp('^([-&.\\w]+ *){0,3}$');
  textCtrl: FormControl = new FormControl('');

  currentSlide = signal(0);
  loading = signal<boolean>(false);
  mediaItems = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  postLoading = signal<boolean>(false);
  isPostDisabled = signal<boolean>(true);
  visibility = signal<'public' | 'private'>('public');

  form = signal<FormGroup>(
    this.fb.group({
      location: [''],
      events: this.fb.array([])
    })
  );

  parentCommentStatusBasedStyles = {
    color: '#F5BC61'
  };

  mentionsConfig = [
    {
      triggerCharacter: '@',
      getChoiceLabel: (item: any): string => {
        return `@${item.name}`;
      }
    }
  ];

  events = [
    {
      id: 1,
      title: 'Atlanta Makes Me Laugh',
      location: 'Atlanta, GA',
      date: 'Fri 8/30'
    },
    {
      id: 2,
      title: 'Comedy Night Live',
      location: 'New York, NY',
      date: 'Sat 9/7'
    },
    {
      id: 3,
      title: 'Laugh Factory Special',
      location: 'Los Angeles, CA',
      date: 'Sun 9/8'
    },
    {
      id: 4,
      title: 'Standup Saturdays',
      location: 'Chicago, IL',
      date: 'Sat 9/14'
    },
    {
      id: 5,
      title: 'Improv Jam',
      location: 'Austin, TX',
      date: 'Thu 9/19'
    },
    {
      id: 6,
      title: 'Open Mic Madness',
      location: 'Seattle, WA',
      date: 'Fri 9/20'
    },
    {
      id: 7,
      title: 'Comedy Underground',
      location: 'Denver, CO',
      date: 'Sat 9/21'
    },
    {
      id: 8,
      title: 'Laugh Riot',
      location: 'Miami, FL',
      date: 'Sun 9/22'
    },
    {
      id: 9,
      title: 'Night of Giggles',
      location: 'Boston, MA',
      date: 'Fri 9/27'
    },
    {
      id: 10,
      title: 'Comedy Fest',
      location: 'San Francisco, CA',
      date: 'Sat 9/28'
    }
  ];

  ngOnInit() {
    this.textCtrl.valueChanges.subscribe((content) =>
      this.getFormattedHighlightText(this.textCtrl.value, this.mentions, this.parentCommentStatusBasedStyles)
    );
  }
  ngAfterViewChecked() {
    if (this.swiper) return;
    if (!this.swiperEl?.nativeElement) return;
    if (!this.mediaItems().length) return;

    this.swiper = new Swiper(this.swiperEl.nativeElement, {
      slidesPerView: 1,
      spaceBetween: 0,
      allowTouchMove: true,
      observer: true,
      on: {
        slideChange: (swiper) => {
          this.currentSlide.set(swiper.activeIndex);
        }
      }
    });
  }

  setVisibility(type: 'public' | 'private') {
    this.visibility.set(type);
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.mediaItems(), event.previousIndex, event.currentIndex);
  }

  openFilePicker() {
    this.fileInput()?.nativeElement.click();
  }

  async openLocationModal() {
    const { address } = await this.modalService.openLocationModal();
    console.log('address', address);
    if (address) {
      this.form().patchValue({ location: address });
    }
    this.cd.detectChanges();
  }

  onBrowseFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);

    const newItems = files.map((file) => ({
      id: crypto.randomUUID(),
      type: file.type.startsWith('video') ? 'video' : 'image',
      file,
      url: URL.createObjectURL(file)
    }));

    this.mediaItems.update((list) => [...list, ...newItems]);
    input.value = '';

    this.refreshSwiperAndGoToLast();
  }

  async openEventModal() {
    const data = await this.modalService.openPostEventModal();
    if (!data) return;

    const exists = this.eventsArray().controls.some((ctrl) => ctrl.value.id === data.id);

    if (!exists) {
      this.eventsArray().push(this.fb.control(data));
    }
    this.cd.detectChanges();
  }

  autoResize(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  async openNetworkedGallery(): Promise<void> {
    const data = await this.modalService.openImageGalleryModal();
    if (!data) return;

    const urls = this.toArray(data);

    const items = urls.map((url) => ({
      id: crypto.randomUUID(),
      type: 'image',
      url
    }));

    this.mediaItems.update((list) => [...list, ...items]);
    this.refreshSwiperAndGoToLast();
  }

  toArray(value: string | string[]): string[] {
    return Array.isArray(value) ? value : [value];
  }

  deleteMedia(index: number) {
    this.mediaItems.update((items) => {
      items.splice(index, 1);
      return [...items];
    });

    this.refreshSwiper(index - 1);
  }

  goToSlide(index: number) {
    if (!this.swiper) return;

    this.refreshSwiper(index);
  }

  private refreshSwiperAndGoToLast() {
    if (!this.swiper) return;

    requestAnimationFrame(() => {
      this.swiper!.update();

      const lastIndex = this.swiper!.slides.length - 1;
      if (lastIndex >= 0) {
        this.currentSlide.set(lastIndex);
        this.swiper!.slideTo(lastIndex, 0);
      }
    });
  }

  private refreshSwiper(targetIndex?: number) {
    if (!this.swiper) return;

    requestAnimationFrame(() => {
      this.swiper!.update();

      if (targetIndex !== undefined) {
        const safeIndex = Math.min(targetIndex, this.swiper!.slides.length - 1);

        this.currentSlide.set(safeIndex);
        this.swiper!.slideTo(safeIndex, 0);
      }
    });
  }

  get eventsArray(): () => FormArray {
    return () => this.form().get('events') as FormArray;
  }

  onRemoveEvent(event: any) {
    const index = this.eventsArray().controls.findIndex((ctrl) => ctrl.value.id === event.id);

    if (index !== -1) {
      this.eventsArray().removeAt(index);
    }
  }

  handleCreatePost() {
    this.postLoading.set(true);
    setTimeout(() => {
      const data = {
        caption: this.formattedText?.changingThisBreaksApplicationSecurity,
        visibility: this.visibility(),
        media_items: this.mediaItems(),
        ...this.form().value
      };

      console.log('data', data);

      this.postLoading.set(false);
    }, 2000);
  }

  async loadChoices({ searchText, triggerCharacter }: { searchText: string; triggerCharacter: string }): Promise<any[]> {
    let searchResults;
    if (triggerCharacter === '@') {
      searchResults = await this.getUsers();
      this.choices = searchResults.filter((user) => {
        return user.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
      });
    } else {
    }
    return this.choices;
  }

  getChoiceLabel = (user: any): string => {
    return `@${user.name}`;
  };

  getDisplayLabel = (item: any): string => {
    if (item.hasOwnProperty('name')) {
      return (item as any).name;
    }
    return (item as any).tag;
  };

  onSelectedChoicesChange(choices: ChoiceWithIndices[]): void {
    this.mentions = choices;
    this.getFormattedHighlightText(this.textCtrl.value, this.mentions, this.parentCommentStatusBasedStyles);
    console.log('mentions:', this.mentions);
  }

  onMenuShow(): void {
    console.log('Menu show!');
  }

  onMenuHide(): void {
    console.log('Menu hide!');
    this.choices = [];
  }

  private getFormattedHighlightText(
    content: string,
    ranges: any[],
    parentCommentStatusBasedStyles: {
      color: string;
    }
  ) {
    let highlightedContent = content;
    let replaceContentIndex = 0;

    ranges.forEach((range) => {
      const start = range.indices.start;
      const end = range.indices.end;
      const highlightedText = content.substring(start, end);

      const highlighted = `<a href="http://localhost:4200" style="color: ${parentCommentStatusBasedStyles.color}; white-space: nowrap; padding: 0 3px; border-radius: 3px; text-decoration: none;">${highlightedText}</a>`;

      const newReplace = highlightedContent.substring(replaceContentIndex).replace(highlightedText, highlighted);

      highlightedContent = replaceContentIndex === 0 ? newReplace : highlightedContent.substring(0, replaceContentIndex) + newReplace;

      replaceContentIndex = highlightedContent.lastIndexOf('</a>') + 4;
    });

    highlightedContent = highlightedContent.replace(/\n/g, '<br>');

    this.formattedText = this.sanitizer.bypassSecurityTrustHtml(highlightedContent) as string;
  }

  async getUsers(): Promise<any[]> {
    this.loading.set(true);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.loading.set(false);

        resolve([
          {
            id: 1,
            name: 'Amelia'
          },
          {
            id: 2,
            name: 'Doe'
          },
          {
            id: 3,
            name: 'John Doe'
          },
          {
            id: 4,
            name: 'John J. Doe'
          },
          {
            id: 5,
            name: 'John & Doe'
          },
          {
            id: 6,
            name: 'Fredericka Wilkie'
          },
          {
            id: 7,
            name: 'Collin Warden'
          },
          {
            id: 8,
            name: 'Hyacinth Hurla'
          },
          {
            id: 9,
            name: 'Paul Bud Mazzei'
          },
          {
            id: 10,
            name: 'Mamie Xander Blais'
          },
          {
            id: 11,
            name: 'Sacha Murawski'
          },
          {
            id: 12,
            name: 'Marcellus Van Cheney'
          },
          {
            id: 12,
            name: 'Lamar Kowalski'
          },
          {
            id: 13,
            name: 'Queena Gauss'
          }
        ]);
      }, 600);
    });
  }

  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null!;
    }
  }
}
