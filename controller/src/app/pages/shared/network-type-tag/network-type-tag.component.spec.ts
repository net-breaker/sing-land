import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NetworkTypeTagComponent } from "./network-type-tag.component";

describe("NetworkTypeTagComponent", () => {
  let component: NetworkTypeTagComponent;
  let fixture: ComponentFixture<NetworkTypeTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NetworkTypeTagComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkTypeTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
