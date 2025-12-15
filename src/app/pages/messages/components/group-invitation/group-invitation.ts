import { Router } from '@angular/router';
import { Button } from '@/components/form/button';
import { ModalService } from '@/services/modal.service';
import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
@Component({
  imports: [Button],
  selector: 'app-group-invitation',
  styleUrl: './group-invitation.scss',
  templateUrl: './group-invitation.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupInvitation {
  private router = inject(Router);
  private modalService = inject(ModalService);

  group = signal({
    id: 'grp_001',
    name: 'Sports Group',
    image: 'assets/images/profile.jpeg',
    membersCount: 12,
    membersPreview: ['assets/images/profile.jpeg', 'assets/images/profile.jpeg', 'assets/images/profile.jpeg'],
    previewText: {
      first: 'Ricky T.',
      second: 'Kensley J.',
      others: 9
    }
  });

  isJoining = signal(false);

  close() {
    this.modalService.close();
    this.router.navigate(['/messages']);
  }

  async joinGroup() {
    if (this.isJoining()) return;

    this.isJoining.set(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    this.isJoining.set(false);
    this.modalService.close();
  }
}
