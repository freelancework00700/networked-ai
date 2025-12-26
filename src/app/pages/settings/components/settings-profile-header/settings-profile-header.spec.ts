import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsProfileHeader } from './settings-profile-header';
import { IonicModule } from '@ionic/angular';

describe('SettingsProfileHeader', () => {
  let component: SettingsProfileHeader;
  let fixture: ComponentFixture<SettingsProfileHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsProfileHeader, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsProfileHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
