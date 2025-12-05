import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorInput } from './editor-input';

describe('EditorInput', () => {
  let component: EditorInput;
  let fixture: ComponentFixture<EditorInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorInput]
    }).compileComponents();

    fixture = TestBed.createComponent(EditorInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
