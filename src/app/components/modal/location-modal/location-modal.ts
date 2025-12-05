import { Button } from '../../form/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ModalController } from '@ionic/angular/standalone';
import { Component, inject, ChangeDetectionStrategy, signal, OnInit, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';

@Component({
  selector: 'location-modal',
  templateUrl: './location-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, CommonModule, IconFieldModule, InputIconModule, InputTextModule, FormsModule]
})
export class LocationModal implements OnInit, AfterViewInit {
  private modalCtrl = inject(ModalController);

  @Input() title = 'Select Location';
  @Input() initialLocation: string | null = null;
  selectedLocation = signal<string>('');
  selectedLat = signal<number | null>(null);
  selectedLng = signal<number | null>(null);

  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;
  autocomplete!: google.maps.places.Autocomplete;

  ngOnInit(): void {
    if (this.initialLocation) {
      this.selectedLocation.set(this.initialLocation);
    }
  }

  ngAfterViewInit(): void {
    this.initializeAutocomplete();
  }

  initializeAutocomplete(): void {
    if (!window.google || !google.maps || !google.maps.places) {
      console.error('Google Maps library not loaded!');
      return;
    }

    this.autocomplete = new google.maps.places.Autocomplete(this.searchInput.nativeElement);

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (place && place.name) {
        const address = place?.formatted_address || '';
        this.selectedLocation.set(address);
        this.selectedLat.set(place?.geometry?.location?.lat() || null);
        this.selectedLng.set(place?.geometry?.location?.lng() || null);
      }
    });
  }

  confirm(): void {
    if (this.selectedLocation()) {
      this.modalCtrl.dismiss({
        address: this.selectedLocation(),
        lat: this.selectedLat(),
        lng: this.selectedLng()
      });
    } else {
      this.modalCtrl.dismiss(null);
    }
  }
}
