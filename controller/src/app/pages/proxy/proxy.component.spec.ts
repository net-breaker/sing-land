import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProxyComponent } from "./proxy.component";

describe("ProxyComponent", () => {
  let component: ProxyComponent;
  let fixture: ComponentFixture<ProxyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProxyComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProxyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
