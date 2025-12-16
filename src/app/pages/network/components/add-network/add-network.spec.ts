import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNetwork } from './add-network';

describe('AddNetwork', () => {
  let component: AddNetwork;
  let fixture: ComponentFixture<AddNetwork>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNetwork]
    }).compileComponents();

    fixture = TestBed.createComponent(AddNetwork);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
