import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilesItemComponent } from './profiles-item.component';

describe('ProfilesItemComponent', () => {
  let component: ProfilesItemComponent;
  let fixture: ComponentFixture<ProfilesItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilesItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilesItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
