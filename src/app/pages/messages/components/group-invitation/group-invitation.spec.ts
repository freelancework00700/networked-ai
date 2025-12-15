import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupInvitation } from './group-invitation';

describe('GroupInvitation', () => {
  let component: GroupInvitation;
  let fixture: ComponentFixture<GroupInvitation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupInvitation]
    }).compileComponents();

    fixture = TestBed.createComponent(GroupInvitation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
