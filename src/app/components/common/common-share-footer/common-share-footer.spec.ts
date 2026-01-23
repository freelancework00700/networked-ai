import { CommonShareFooter } from './common-share-footer';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('CommonShareFooter', () => {
  let component: CommonShareFooter;
  let fixture: ComponentFixture<CommonShareFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonShareFooter]
    }).compileComponents();

    fixture = TestBed.createComponent(CommonShareFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
