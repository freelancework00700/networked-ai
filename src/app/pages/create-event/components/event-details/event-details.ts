import { effect, inject, input, signal, computed, ViewChild, Component, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Swiper } from 'swiper';
import { Button } from '@/components/form/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ModalService } from '@/services/modal.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { TextInput } from '@/components/form/text-input';
import { EditorInput } from '@/components/form/editor-input';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NetworkTag } from '@/pages/create-event/components/network-tag';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'event-details',
  styleUrl: './event-details.scss',
  templateUrl: './event-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, TextInput, EditorInput, DragDropModule, CheckboxModule, ReactiveFormsModule, CommonModule]
})
export class EventDetails {
  // Inputs
  eventForm = input.required<FormGroup>();
  isSubmitted = input(false);
  maxDescriptionLength = 2500;

  // Services
  modalService = inject(ModalService);
  cd = inject(ChangeDetectorRef);
  document = inject(DOCUMENT);

  // Swiper instance
  swiper?: Swiper;
  currentSlide = signal(0);
  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef<HTMLDivElement>;

  // Signals
  mediaItems = signal<Array<{ id: string; type: string; file?: File; url: string }>>([]);
  isCustomize = signal(false);
  descriptionLength = signal(0);
  selectedMetaTags = signal<Set<string>>(new Set());
  metaTagOptions = signal<Array<{ name: string; icon: string; value: string }>>([
    { name: 'Agriculture', icon: '🌿', value: 'agriculture' },
    { name: 'Art & Entertainment', icon: '🎨', value: 'art_entertainment' },
    { name: 'Business', icon: '💼', value: 'business' },
    { name: 'Education', icon: '📚', value: 'education' },
    { name: 'Food & Drink', icon: '🍔', value: 'food_drink' },
    { name: 'Health & Wellness', icon: '💪', value: 'health_wellness' },
    { name: 'Music', icon: '🎵', value: 'music' },
    { name: 'Networking', icon: '🤝', value: 'networking' },
    { name: 'Sports & Fitness', icon: '⚽', value: 'sports_fitness' },
    { name: 'Technology', icon: '💻', value: 'technology' },
    { name: 'Travel', icon: '✈️', value: 'travel' },
    { name: 'Volunteer', icon: '❤️', value: 'volunteer' }
  ]);

  isMetaTagsInvalid = computed(() => {
    const form = this.eventForm();
    const metaTagsControl = form.get('meta_tags');
    const hasSelectedTags = this.selectedMetaTags().size > 0;
    const controlValue = metaTagsControl?.value || [];
    const hasControlValue = Array.isArray(controlValue) && controlValue.length > 0;

    if (hasSelectedTags || hasControlValue) {
      return false;
    }

    return !!(metaTagsControl?.invalid && (metaTagsControl?.touched || this.isSubmitted()));
  });

  extractPlainText(html: string): string {
    const tempDiv = this.document.createElement('div');
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || tempDiv.innerText || '').trim();
  }

  updateDescriptionLength(html: string | null): void {
    const length = html ? this.extractPlainText(html).length : 0;
    this.descriptionLength.set(length);
  }

  constructor() {
    this.syncFormToSignal('medias', this.mediaItems);
    this.syncFormToSignal('meta_tags', this.selectedMetaTags);

    effect(() => {
      this.eventForm().get('medias')?.setValue(this.mediaItems());
    });

    effect(() => {
      const tags = Array.from(this.selectedMetaTags());
      this.eventForm().get('meta_tags')?.setValue(tags);
    });
  }

  syncFormToSignal(formControlName: string, signalRef: ReturnType<typeof signal<any[] | Set<any>>>): void {
    const isEmpty = () => {
      const current = signalRef();
      return current instanceof Set ? current.size === 0 : (current as any[]).length === 0;
    };

    effect(() => {
      const form = this.eventForm();
      const control = form.get(formControlName);

      if (control) {
        const formValue = control.value;
        if (formValue && isEmpty()) {
          if (formValue instanceof Set || (Array.isArray(formValue) && formValue.length > 0)) {
            signalRef.set(formValue as any);
          }
        }

        control.valueChanges.subscribe((value) => {
          if (value && isEmpty()) {
            if (value instanceof Set || (Array.isArray(value) && value.length > 0)) {
              signalRef.set(value as any);
            }
          }
        });
      }
    });
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

  refreshSwiper(targetIndex?: number) {
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

  refreshSwiperAndGoToLast() {
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

  goToSlide(index: number) {
    if (!this.swiper) return;
    this.refreshSwiper(index);
  }

  deleteMedia(index: number) {
    this.mediaItems.update((items) => {
      const newItems = [...items];
      newItems.splice(index, 1);
      return newItems;
    });
    this.refreshSwiper(index - 1);
  }

  drop(event: CdkDragDrop<Array<{ id: string; type: string; file?: File; url: string }>>) {
    this.mediaItems.update((items) => {
      const reordered = [...items];
      moveItemInArray(reordered, event.previousIndex, event.currentIndex);
      return reordered;
    });
    this.refreshSwiper();
  }

  onBrowseFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const newItems = Array.from(input.files).map((file) => this.createMediaItem(file, file.type.startsWith('video') ? 'video' : 'image'));
    this.mediaItems.update((list) => [...list, ...newItems]);
    input.value = '';
    this.refreshSwiperAndGoToLast();
  }

  createMediaItem(fileOrUrl: File | string, type: 'image' | 'video' | 'gif'): { id: string; type: string; file?: File; url: string } {
    const isFile = fileOrUrl instanceof File;
    return {
      id: crypto.randomUUID(),
      type,
      file: isFile ? fileOrUrl : undefined,
      url: isFile ? URL.createObjectURL(fileOrUrl) : fileOrUrl
    };
  }

  async openNetworkedGallery(): Promise<void> {
    const data = await this.modalService.openImageGalleryModal();
    if (!data) return;

    const items = this.toArray(data).map((url) => this.createMediaItem(url, 'image'));
    this.mediaItems.update((list) => [...list, ...items]);
    this.refreshSwiperAndGoToLast();
  }

  async openNetworkedGIFs(): Promise<void> {
    const data = await this.modalService.openGifGalleryModal();
    if (!data) return;

    const items = this.toArray(data).map((url) => this.createMediaItem(url, 'gif'));
    this.mediaItems.update((list) => [...list, ...items]);
    this.refreshSwiperAndGoToLast();
  }

  toArray(value: string | string[]): string[] {
    return Array.isArray(value) ? value : [value];
  }

  async openDateModal(): Promise<void> {
    const form = this.eventForm();
    const currentDate = form.get('date')?.value || '';
    const date = await this.modalService.openDateTimeModal('date', currentDate);
    if (date) {
      form.patchValue({ date });
    }
  }

  async openTimeModal(type: 'start_time' | 'end_time'): Promise<void> {
    const form = this.eventForm();
    const currentTime = form.get(type)?.value || '';
    const startTime = form.get('start_time')?.value;
    const min = type === 'end_time' && startTime ? this.addMinutesToTime(startTime, 30) : undefined;

    const time = await this.modalService.openDateTimeModal('time', currentTime, min);
    if (time) {
      form.patchValue({ [type]: time });
    }
  }

  async openLocationModal(): Promise<void> {
    const { address } = await this.modalService.openLocationModal();
    this.eventForm().patchValue({ address });
  }

  async openEventCategoryModal(): Promise<void> {
    const currentCategory = this.eventForm().get('category')?.value || 'business';
    const category = await this.modalService.openEventCategoryModal(currentCategory);
    this.eventForm().get('category')?.setValue(category);
  }

  async openNetworkTagModal() {
    const form = this.eventForm();
    const metaTagsControl = form.get('meta_tags');
    const currentSelected = metaTagsControl?.value || [];

    const data = await this.modalService.openNetworkTagModal(this.metaTagOptions(), currentSelected);
    if (data && Array.isArray(data)) {
      const selectedSet = new Set(data);
      this.selectedMetaTags.set(selectedSet);

      if (metaTagsControl) {
        metaTagsControl.setValue(data, { emitEvent: true });
        metaTagsControl.markAsTouched();
        metaTagsControl.updateValueAndValidity({ emitEvent: true });
        this.cd.markForCheck();
      }
    }
  }

  getSelectedTagValues(): string[] {
    return Array.from(this.selectedMetaTags());
  }

  getTagByName(value: string): NetworkTag | undefined {
    return this.metaTagOptions().find((tag) => tag.value === value);
  }

  getFieldValue<T>(field: string): T | null {
    return this.eventForm().get(field)?.value ?? null;
  }

  addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins + minutes, 0, 0);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  handleGenerateClick = (): void => {
    if (this.isCustomize()) {
      this.openAIPromptModal();
    } else {
      this.generateDescription();
    }
  };

  generateDescription(): void {
    const form = this.eventForm();
    const descriptionControl = form.get('description');

    if (descriptionControl) {
      const generatedDescription =
        '<p>This is a generated event description. You can customize this content to better match your event details and requirements.</p>';
      descriptionControl.setValue(generatedDescription);
      descriptionControl.markAsTouched();
      this.updateDescriptionLength(generatedDescription);
      this.isCustomize.set(true);
    }
  }

  async openAIPromptModal(): Promise<void> {
    const conversation = signal<Array<{ role: string; content: string }>>([]);
    const data = await this.modalService.openAIPromptModal(conversation(), true);

    if (data?.type === 'value' && data.data) {
      const descriptionControl = this.eventForm().get('description');
      if (descriptionControl) {
        descriptionControl.setValue(data.data);
        this.updateDescriptionLength(data.data);
        this.isCustomize.set(true);
      }
    }
  }
}
