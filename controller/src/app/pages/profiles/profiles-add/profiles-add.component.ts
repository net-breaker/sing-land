import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { Observable, Observer, timer } from "rxjs";
import { NotificationProvider } from "src/app/core/provider/notification.provider";
import { FileProfile, Profile, ProfilesService, RemoteProfile } from "src/app/core/service/profiles.service";
import { ProfilesAddProvider } from "./profiles-add.provider";

@Component({
  selector: "app-profiles-add",
  templateUrl: "./profiles-add.component.html",
  styleUrls: ["./profiles-add.component.scss"]
})
export class ProfilesAddComponent implements OnInit {
  @ViewChild("fileSelector", { static: true })
  fileSelectorElement!: ElementRef;

  uuidJoiner = /-/g;
  urlRegex = "^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .\\-=\\?%&]*/?$";

  isLocalFileModalVisible = false;
  isLocalFileModalOKLoadding = false;
  localFileProfileForm!: UntypedFormGroup;
  addLocalFileQueue: string[] = []; // path

  isRemoteFileModalVisible = false;
  isRemoteFileModalOKLoadding = false;
  remoteFileProfileForm!: UntypedFormGroup;

  isRemoteConnectionModalVisible = false;
  isRemoteConnectionModalOKLoadding = false;
  remoteConnectionProfileForm!: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private notificationProvider: NotificationProvider,
    private profilesService: ProfilesService,
    private profilesAddProvider: ProfilesAddProvider
  ) {
    profilesAddProvider.profilesEditObservable.subscribe((profile: Profile | undefined) => {
      if (profile === undefined) return;
      this.editingProfile = profile;
      this.showEditProfileModal();
    });
  }

  ngOnInit(): void {
    this.localFileProfileForm = this.fb.group({
      name: [null, [Validators.required], [this.nameExistedRequired]],
      path: [null, [Validators.required]]
    });

    this.remoteFileProfileForm = this.fb.group({
      name: [null, [Validators.required], [this.nameExistedRequired]],
      url: [
        null,
        [
          Validators.required,
          (control: UntypedFormControl): { [s: string]: boolean } => {
            if (!control.value) return { required: true };
            if (!control.value.match(this.urlRegex)) return { confirm: true, error: false };
            return {};
          }
        ]
      ]
    });

    this.remoteConnectionProfileForm = this.fb.group({
      name: [null, [Validators.required], [this.nameExistedRequired]],
      schema: ["http://"],
      host: [null, [Validators.required]],
      port: [null, [Validators.required]],
      authorization: [null, [Validators.required]]
    });

    this.profilesAddProvider.localProfilesAddObservable.subscribe((files: FileList | undefined) => {
      if (files === undefined) return;
      this.pushLocalFileToAddQueue(files);
      this.fetchFromLocalFileQueueThenShowModal();
    });

    this.fileSelectorElement.nativeElement.addEventListener("change", () => {
      this.pushLocalFileToAddQueue(this.fileSelectorElement.nativeElement.files);
      this.fetchFromLocalFileQueueThenShowModal();
      this.fileSelectorElement.nativeElement.value = "";
    });
  }

  nameExistedRequired = (control: UntypedFormControl) =>
    new Observable((observer: Observer<any | null>) => {
      if (!control.value) {
        observer.next(null);
      } else {
        const name = control.value.trim();
        if (this.isEditing && this.editingProfile!.name === name) {
          observer.next(null);
        } else if (this.profilesService.existsName(name)) {
          observer.next({
            duplicated: { "zh-cn": `名称已存在`, en: `Name already exists` }
          });
        } else {
          observer.next(null);
        }
      }
      observer.complete();
    });

  pushLocalFileToAddQueue(files: FileList): void {
    for (var i = 0; i < files.length; i++) {
      const path = files[i].path;
      const file = fs.statSync(path);
      if (file.isFile()) this.addLocalFileQueue.push(path);
    }
  }

  fetchFromLocalFileQueueThenShowModal(): void {
    this.isEditing = false;
    if (this.addLocalFileQueue.length > 0) {
      const profilePath = this.addLocalFileQueue.shift()!;
      const fileName = path.basename(profilePath);
      this.localFileProfileForm.patchValue({
        name: fileName,
        path: profilePath
      });
      this.localFileProfileForm.controls["path"].enable();
      this.isLocalFileModalVisible = true;
    }
  }

  cancelLocalFileProfile(): void {
    this.isLocalFileModalVisible = false;
    timer(300).subscribe(() => {
      this.fetchFromLocalFileQueueThenShowModal();
    });
  }

  submitLocalFileProfile(): void {
    for (const i in this.localFileProfileForm.controls) {
      this.localFileProfileForm.controls[i].markAsDirty();
      this.localFileProfileForm.controls[i].updateValueAndValidity();
    }
    if (!this.localFileProfileForm.valid) return;
    this.isLocalFileModalOKLoadding = true;

    // chekc file exists
    const profilePath = this.isEditing ? (this.editingProfile! as FileProfile).path : this.localFileProfileForm.value.path;
    if (!fs.existsSync(profilePath)) {
      this.notificationProvider.notification("File not exists", "Can not find file: " + this.localFileProfileForm.value.path);
      this.isLocalFileModalOKLoadding = false;
      return;
    }

    try {
      if (!this.isEditing) this.addLocalFileProfile();
      else this.updateLocalFileProfile();
    } catch (err: any) {
      const title = this.isEditing ? "Update local profile failed" : "Add local profile failed";
      this.notificationProvider.notification("Add profile failed", err.message);
    } finally {
      this.isLocalFileModalOKLoadding = false;
    }
  }

  addLocalFileProfile(): void {
    const targetPath = path.join(this.profilesService.profilesDirectory, new Date().getTime() + ".yaml");
    fs.copyFile(this.localFileProfileForm.value.path, targetPath, (err) => {
      if (err) {
        this.notificationProvider.notification("Failed", "Failed to copy profile file");
        this.isLocalFileModalOKLoadding = false;
        return;
      }
      const profile: FileProfile = {
        id: randomUUID().replace(this.uuidJoiner, ""),
        type: "file",
        createTimestamp: new Date().getTime(),
        name: this.localFileProfileForm.value.name.trim(),
        path: targetPath
      };
      this.profilesService.addProfile(profile);
      this.isLocalFileModalOKLoadding = false;
      this.isLocalFileModalVisible = false;
      timer(300).subscribe(() => {
        this.fetchFromLocalFileQueueThenShowModal();
      });
    });
  }

  showAddRemoteFileProfileModal(): void {
    this.isEditing = false;
    this.remoteFileProfileForm.reset();
    this.isRemoteFileModalVisible = true;
  }

  async submitRemoteFileProfile(): Promise<void> {
    for (const i in this.remoteFileProfileForm.controls) {
      this.remoteFileProfileForm.controls[i].markAsDirty();
      this.remoteFileProfileForm.controls[i].updateValueAndValidity();
    }
    if (!this.remoteFileProfileForm.valid) return;
    this.isRemoteFileModalOKLoadding = true;
    try {
      if (!this.isEditing) await this.addRemoteFileProfile();
      else await this.updateRemoteFileProfile();
    } catch (e: any) {
      const title = this.isEditing ? "Update remote profile failed" : "Add remote profile failed";
      this.notificationProvider.notification(title, e.message);
    } finally {
      this.isRemoteFileModalOKLoadding = false;
    }
  }

  async addRemoteFileProfile(): Promise<void> {
    const subscribeUrl = this.remoteFileProfileForm.value.url;
    const path = await this.profilesService.saveProfileFromRemote(subscribeUrl);
    const profile: FileProfile = {
      id: randomUUID().replace(this.uuidJoiner, ""),
      type: "file",
      createTimestamp: new Date().getTime(),
      name: this.remoteFileProfileForm.value.name.trim(),
      path: path,
      subscribeUrl: subscribeUrl
    };
    this.profilesService.addProfile(profile);
    this.isRemoteFileModalVisible = false;
  }

  showAddRemoteConnectionProfileModal(): void {
    this.isEditing = false;
    this.remoteConnectionProfileForm.reset();
    this.remoteConnectionProfileForm.patchValue({ schema: "http://" });
    this.isRemoteConnectionModalVisible = true;
  }

  async submitRemoteConnectionProfile(): Promise<void> {
    for (const i in this.remoteConnectionProfileForm.controls) {
      this.remoteConnectionProfileForm.controls[i].markAsDirty();
      this.remoteConnectionProfileForm.controls[i].updateValueAndValidity();
    }
    if (!this.remoteConnectionProfileForm.valid) return;
    this.isRemoteConnectionModalOKLoadding = true;
    try {
      if (!this.isEditing) await this.addRemoteConnectionProfile();
      else await this.updateRemoteConnectionProfile();
    } catch (e: any) {
      const title = this.isEditing ? "Edit remote connection failed" : "Update remote connection failed";
      this.notificationProvider.notification(title, e.message);
    } finally {
      this.isRemoteConnectionModalOKLoadding = false;
    }
  }

  async addRemoteConnectionProfile(): Promise<void> {
    const version = await this.profilesService.testRemoteConnection(
      this.remoteConnectionProfileForm.value.schema,
      this.remoteConnectionProfileForm.value.host,
      this.remoteConnectionProfileForm.value.port,
      this.remoteConnectionProfileForm.value.authorization
    );
    const profile: RemoteProfile = {
      id: randomUUID().replace(this.uuidJoiner, ""),
      type: "remote",
      createTimestamp: new Date().getTime(),
      name: this.remoteConnectionProfileForm.value.name.trim(),
      schema: this.remoteConnectionProfileForm.value.schema,
      host: this.remoteConnectionProfileForm.value.host,
      port: this.remoteConnectionProfileForm.value.port,
      authorization: this.remoteConnectionProfileForm.value.authorization,
      version: version
    };
    this.profilesService.addProfile(profile);
    this.isRemoteConnectionModalVisible = false;
  }

  isEditing = false;
  editingProfile: Profile | undefined;

  showEditProfileModal(): void {
    this.isEditing = true;
    if (this.editingProfile!.type === "file") {
      const fileProfile = this.editingProfile as FileProfile;
      if (fileProfile.subscribeUrl === undefined) {
        this.localFileProfileForm.patchValue({
          name: fileProfile.name,
          path: fileProfile.path
        });
        this.localFileProfileForm.controls["path"].disable();
        this.isLocalFileModalVisible = true;
      } else {
        this.remoteFileProfileForm.patchValue({
          name: fileProfile.name,
          url: fileProfile.subscribeUrl
        });
        this.isRemoteFileModalVisible = true;
      }
    } else {
      const remoteProfile = this.editingProfile as RemoteProfile;
      this.remoteConnectionProfileForm.patchValue({
        name: remoteProfile.name,
        schema: remoteProfile.schema,
        host: remoteProfile.host,
        port: remoteProfile.port,
        authorization: remoteProfile.authorization
      });
      this.isRemoteConnectionModalVisible = true;
    }
  }

  updateLocalFileProfile(): void {
    const profile = this.editingProfile as FileProfile;
    profile.name = this.localFileProfileForm.value.name.trim();
    profile.updateTimestamp = new Date().getTime();
    this.profilesService.updateProfile(profile);
    this.isLocalFileModalVisible = false;
  }

  async updateRemoteFileProfile(): Promise<void> {
    const subscribeUrl = this.remoteFileProfileForm.value.url;
    const path = await this.profilesService.saveProfileFromRemote(subscribeUrl);
    const profile: FileProfile = {
      id: this.editingProfile!.id,
      type: "file",
      createTimestamp: this.editingProfile!.createTimestamp,
      updateTimestamp: new Date().getTime(),
      name: this.remoteFileProfileForm.value.name.trim(),
      path: path,
      subscribeUrl: subscribeUrl
    };
    this.profilesService.updateProfile(profile);
    const fileProfile = this.editingProfile as FileProfile;
    fs.unlink(fileProfile.path, (err) => {
      if (err) throw err;
    });
    this.isRemoteFileModalVisible = false;
  }

  async updateRemoteConnectionProfile(): Promise<void> {
    const version = await this.profilesService.testRemoteConnection(
      this.remoteConnectionProfileForm.value.schema,
      this.remoteConnectionProfileForm.value.host,
      this.remoteConnectionProfileForm.value.port,
      this.remoteConnectionProfileForm.value.authorization
    );
    const profile: RemoteProfile = {
      id: this.editingProfile!.id,
      type: "remote",
      createTimestamp: this.editingProfile!.createTimestamp,
      updateTimestamp: new Date().getTime(),
      name: this.remoteConnectionProfileForm.value.name.trim(),
      schema: this.remoteConnectionProfileForm.value.schema,
      host: this.remoteConnectionProfileForm.value.host,
      port: this.remoteConnectionProfileForm.value.port,
      authorization: this.remoteConnectionProfileForm.value.authorization,
      version: version
    };
    this.profilesService.updateProfile(profile);
    this.isRemoteConnectionModalVisible = false;
  }
}
