import { Button } from '@/components/form/button';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute, Router } from '@angular/router';
import { Searchbar } from '@/components/common/searchbar';
import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader, IonToolbar, IonContent, IonFooter, NavController } from '@ionic/angular/standalone';
@Component({
  selector: 'create-group',
  styleUrl: './create-group.scss',
  templateUrl: './create-group.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonFooter, Searchbar, IonContent, IonHeader, IonToolbar, Button, InputTextModule]
})
export class CreateGroup {
  private route = inject(ActivatedRoute);
  routeId = signal<string | null>(null);
  private navCtrl = inject(NavController);
  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const groupId = params.get('groupId');
      this.routeId.set(groupId);
      if (groupId) {
        // Reset all data
        this.resetGroupData();
      }
    });
  }

  networkSuggestions = [
    { id: '1', name: 'Kathryn Murphy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '2', name: 'Esther Howard', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '3', name: 'Arlene McCoy', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '4', name: 'Darlene Robertson', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '5', name: 'Ronald Richards', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '6', name: 'Albert Flores', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '7', name: 'Eleanor Pena', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' },
    { id: '8', name: 'Savannah Nguyen', value: 200, jobTitle: 'Founder & CEO', company: 'Cortazzo Consulting' }
  ];
  selectedMembers = signal<any[]>([]);

  searchText = signal('');
  selectedIds = signal<Set<string>>(new Set());
  isGroupDetails = signal(false);
  groupImage = signal<string | null>(null);
  groupName = signal<string>('');
  // Filtered list (computed)
  filteredSuggestions = computed(() => {
    const search = this.searchText().toLowerCase().trim();
    if (!search) return this.networkSuggestions;

    return this.networkSuggestions.filter((s) => s.name.toLowerCase().includes(search));
  });

  toggleAdd(id: string) {
    const current = new Set(this.selectedIds());
    current.has(id) ? current.delete(id) : current.add(id);
    this.selectedIds.set(current);
  }

  goToCreateGroup() {
    this.navCtrl.navigateForward(`/chat-info/${this.routeId()}`);
  }

  toggleMember(user: any) {
    if (this.isSelected(user.id)) return;
    this.selectedMembers.update((list) => [...list, user]);
  }

  removeMember(user: any) {
    this.selectedMembers.update((list) => list.filter((u) => u.id !== user.id));
  }

  isSelected(id: string) {
    return this.selectedMembers().some((u) => u.id === id);
  }

  nextStep() {
    this.isGroupDetails.set(true);
  }

  createGroup() {
    this.navCtrl.navigateForward(`/chat-info/${this.groupName()}`);
  }

  handleBack() {
    if (this.routeId()) {
      this.navCtrl.navigateForward(`/chat-info/${this.routeId()}`);
      return;
    }
    if (this.isGroupDetails()) {
      // Go back to member selection mode
      this.isGroupDetails.set(false);
      return;
    }

    // Default navigation when not in details mode
    this.navCtrl.navigateForward('/new-chat');
  }
  selectGroupImage() {
    console.log('selectGroupImage');
  }

  onGroupImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || !input.files.length) return;

    const file = input.files[0];

    // Optional: validate image type
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.groupImage.set(reader.result as string);
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  onGroupNameInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.groupName.set(value);
  }

  private resetGroupData() {
    this.groupName.set('');
    this.groupImage.set(null);
    this.selectedMembers.set([]);
    this.selectedIds.set(new Set());
    this.isGroupDetails.set(false);
    this.searchText.set('');
  }

  copyInviteLink() {
    console.log('copyInviteLink');
  }
}
