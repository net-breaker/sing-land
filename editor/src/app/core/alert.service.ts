import { Injectable } from "@angular/core";
import { SweetAlertOptions, SweetAlertResult } from "sweetalert2";
import Swal from "sweetalert2/dist/sweetalert2.js";
export type EventType = "RELOAD_FROM_DISK" | "SAVE_TO_DISK";

@Injectable({
  providedIn: "root"
})
export class AlertService {
  private swal = Swal.mixin({
    toast: true,
    position: "bottom-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener("mouseenter", Swal.stopTimer);
      toast.addEventListener("mouseleave", Swal.resumeTimer);
    }
  } as SweetAlertOptions);

  constructor() {}

  saveChanges(): Promise<SweetAlertResult> {
    return Swal.fire({
      title: "Do you want to save the changes?",
      width: "36em",
      allowOutsideClick: false,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`
    });
  }

  success(title: string): void {
    this.swal.fire({
      icon: "success",
      title
    });
  }

  info(title: string): void {
    this.swal.fire({
      icon: "info",
      title
    });
  }
}
