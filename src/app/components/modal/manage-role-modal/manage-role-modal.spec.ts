import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRoleModal } from './manage-role-modal';

describe('ManageRoleModal', () => {
  let component: ManageRoleModal;
  let fixture: ComponentFixture<ManageRoleModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRoleModal]
    }).compileComponents();

    fixture = TestBed.createComponent(ManageRoleModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
