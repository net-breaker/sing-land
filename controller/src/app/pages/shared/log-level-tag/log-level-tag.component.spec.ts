import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LogLevelTagComponent } from "./log-level-tag.component";

describe("LogLevelTagComponent", () => {
  let component: LogLevelTagComponent;
  let fixture: ComponentFixture<LogLevelTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogLevelTagComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogLevelTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
