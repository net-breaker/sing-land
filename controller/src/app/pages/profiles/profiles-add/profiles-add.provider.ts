import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Profile } from "src/app/core/service/profiles.service";

@Injectable({
  providedIn: "root"
})
export class ProfilesAddProvider {
  private localProfilesAddBehaviorSubject = new BehaviorSubject<FileList | undefined>(undefined);
  localProfilesAddObservable = this.localProfilesAddBehaviorSubject.asObservable();

  private profileEditBehaviorSubject = new BehaviorSubject<Profile | undefined>(undefined);
  profilesEditObservable = this.profileEditBehaviorSubject.asObservable();

  addLocalProfile(files: FileList) {
    this.localProfilesAddBehaviorSubject.next(files);
  }

  editProfile(profile: Profile) {
    this.profileEditBehaviorSubject.next(profile);
  }
}
