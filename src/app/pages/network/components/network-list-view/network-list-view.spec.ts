import { NetworkListView } from './network-list-view';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('NetworkListView', () => {
  let component: NetworkListView;
  let fixture: ComponentFixture<NetworkListView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkListView]
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkListView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
