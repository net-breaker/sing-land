import { ComponentFixture, TestBed } from "@angular/core/testing";

import { NetworkProtocolTagComponent } from "./network-protocol-tag.component";

describe("NetworkProtocolTagComponent", () => {
  let component: NetworkProtocolTagComponent;
  let fixture: ComponentFixture<NetworkProtocolTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NetworkProtocolTagComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkProtocolTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
