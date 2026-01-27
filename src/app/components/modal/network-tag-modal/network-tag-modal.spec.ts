import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NetworkTagModal } from './network-tag-modal';

describe('NetworkTagModal', () => {
  let component: NetworkTagModal;
  let fixture: ComponentFixture<NetworkTagModal>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkTagModal],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkTagModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
