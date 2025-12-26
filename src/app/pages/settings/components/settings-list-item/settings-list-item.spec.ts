import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SettingsListItem } from './settings-list-item';
import { IonicModule } from '@ionic/angular';

describe('SettingsListItem', () => {
  let component: SettingsListItem;
  let fixture: ComponentFixture<SettingsListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsListItem, IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
