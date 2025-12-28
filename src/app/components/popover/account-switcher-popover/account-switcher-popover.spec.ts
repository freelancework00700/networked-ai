import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountSwitcherPopover } from './account-switcher-popover';

describe('AccountSwitcherPopover', () => {
  let component: AccountSwitcherPopover;
  let fixture: ComponentFixture<AccountSwitcherPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSwitcherPopover]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountSwitcherPopover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
