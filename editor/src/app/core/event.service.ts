import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type EventType = "RELOAD_FROM_DISK" | "SAVE_TO_DISK";

@Injectable({
  providedIn: "root"
})
export class EventService {
  private eventBehaviorSubject = new BehaviorSubject<EventType | undefined>(undefined);
  eventObservable = this.eventBehaviorSubject.asObservable();

  constructor() {}

  emitEvent(eventType: EventType) {
    this.eventBehaviorSubject.next(eventType);
  }
}
