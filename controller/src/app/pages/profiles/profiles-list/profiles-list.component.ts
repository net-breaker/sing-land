import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Profile, ProfilesService } from "src/app/core/service/profiles.service";

@Component({
  selector: "app-profiles-list",
  templateUrl: "./profiles-list.component.html",
  styleUrls: ["./profiles-list.component.scss"]
})
export class ProfilesListComponent implements OnInit {
  profilesObservable: Observable<Profile[]>;

  constructor(profilesService: ProfilesService) {
    this.profilesObservable = profilesService.profiles$;
  }

  ngOnInit(): void {}
}
