import { TitleModal } from './title-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('TitleModal', () => {
  let component: TitleModal;
  let fixture: ComponentFixture<TitleModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleModal]
    }).compileComponents();

    fixture = TestBed.createComponent(TitleModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
