import { AccountTypeModal } from './account-type-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('AccountTypeModal', () => {
  let component: AccountTypeModal;
  let fixture: ComponentFixture<AccountTypeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountTypeModal]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountTypeModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
