import { NetworkMapView } from './network-map-view';
import { TestBed, ComponentFixture } from '@angular/core/testing';

describe('NetworkMapView', () => {
  let component: NetworkMapView;
  let fixture: ComponentFixture<NetworkMapView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetworkMapView]
    }).compileComponents();

    fixture = TestBed.createComponent(NetworkMapView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
