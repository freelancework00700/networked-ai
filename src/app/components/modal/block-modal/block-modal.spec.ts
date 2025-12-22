import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockModal } from './block-modal';

describe('BlockModal', () => {
  let component: BlockModal;
  let fixture: ComponentFixture<BlockModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockModal]
    }).compileComponents();

    fixture = TestBed.createComponent(BlockModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
