import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareGroup } from './share-group';

describe('ShareGroup', () => {
  let component: ShareGroup;
  let fixture: ComponentFixture<ShareGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareGroup]
    }).compileComponents();

    fixture = TestBed.createComponent(ShareGroup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
