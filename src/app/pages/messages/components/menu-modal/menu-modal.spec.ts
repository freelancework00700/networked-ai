import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuModal } from './menu-modal';

describe('MenuModal', () => {
  let component: MenuModal;
  let fixture: ComponentFixture<MenuModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuModal]
    }).compileComponents();

    fixture = TestBed.createComponent(MenuModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
