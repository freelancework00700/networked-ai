import { AIPromptModal } from './ai-prompt-modal';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('CreateEvent', () => {
  let component: AIPromptModal;
  let fixture: ComponentFixture<AIPromptModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AIPromptModal]
    }).compileComponents();

    fixture = TestBed.createComponent(AIPromptModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
