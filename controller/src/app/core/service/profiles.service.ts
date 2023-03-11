import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as chokidar from "chokidar";
import fs from "fs";
import * as yaml from "js-yaml";
import { getLogger } from "log4js";
import path from "path";
import { BehaviorSubject, interval, timeout } from "rxjs";
import { ConfigManager } from "../manager/config.manager";
import { SettingManager } from "../manager/setting.manager";
import { NotificationProvider } from "../provider/notification.provider";

export type ProfileType = "file" | "remote";

export interface Profile {
  /**
   * unique
   */
  id: string;
  order?: number;
  /**
   * unique
   */
  name: string;
  type: ProfileType;
  createTimestamp: number;
  updateTimestamp?: number;
}

export interface FileProfile extends Profile {
  type: "file";
  path: string;
  subscribeUrl?: string;
}

export interface RemoteProfile extends Profile {
  type: "remote";
  schema: string;
  host: string;
  port: number;
  authorization: string;
  version: string;
}

export type syncProfileStatusType = "synchronizing" | "success" | "failed";

export interface SyncProfileStatus {
  profileId: string;
  status: syncProfileStatusType;
}

@Injectable({
  providedIn: "root"
})
export class ProfilesService {
  private logger = getLogger("ProfilesService");

  private profilesBehaviorSubject = new BehaviorSubject<Profile[]>(this.getProfiles());
  profiles$ = this.profilesBehaviorSubject.asObservable();

  private profileSelectedChangedBehaviorSubject = new BehaviorSubject<Profile | undefined>(this.selectedProfile);
  profileSelectedChanged$ = this.profileSelectedChangedBehaviorSubject.asObservable();

  private profileSyncStatusBehaviorSubject = new BehaviorSubject<SyncProfileStatus | undefined>(undefined);
  profileSyncStatus$ = this.profileSyncStatusBehaviorSubject.asObservable();

  private syncProfileFromRemoteTimeout: number;

  constructor(private notificationProvider: NotificationProvider, private settingManager: SettingManager, private configManager: ConfigManager, private httpClient: HttpClient) {
    this.syncProfileFromRemoteTimeout = this.configManager.get<number>("http-timeout.sync-profile-from-remote", 10000)!;
    this.hotReloadFileProfileWhenChanged();
    interval(60000).subscribe(() => {
      // repeat every 1 minute
      this.profilesBehaviorSubject.next(this.getProfiles());
    });
  }

  private hotReloadFileProfileWhenChanged(): void {
    const fileWatcher = chokidar.watch(path.parse(this.profilesDirectory).dir);
    fileWatcher.on("change", async (changedPath) => {
      try {
        if (this.selectedProfile?.type !== "file") return;
        const fileProfile = this.selectedProfile as FileProfile;
        if (path.basename(fileProfile.path) !== path.basename(changedPath)) return;
        this.logger.info("File profile changed, will reload");
        await this.selectProfile(fileProfile.id);
      } catch (err: any) {
        this.logger.error("File profile hot reload failed", err.message);
        this.notificationProvider.notification("File profile hot reload failed", err.message);
      }
    });
  }

  get profilesDirectory(): string {
    return this.configManager.profilesDirectory;
  }

  get selectedProfile(): Profile | undefined {
    const id = this.settingManager.get("profile.selected");
    return this.getProfiles().find((profile) => profile.id === id);
  }

  async selectProfile(id: string): Promise<void> {
    const profile = this.getProfiles().find((profile) => profile.id === id);
    if (profile === undefined) throw new Error("Profile not found");
    await this.verifyProfile(profile);
    this.settingManager.set("profile.selected", id);
    this.profileSelectedChangedBehaviorSubject.next(profile);
  }

  verifyProfile(profile: Profile): Promise<void> {
    return new Promise((resolve, reject) => {
      if (profile.type === "file") {
        const fileProfile = profile as FileProfile;
        if (!fs.existsSync(fileProfile.path)) {
          reject(new Error("File not found"));
          return;
        }
        const content = fs.readFileSync(fileProfile.path, "utf-8");
        try {
          yaml.load(content);
          resolve();
        } catch (err: any) {
          // err instanceof yaml.YAMLException
          const message = err.message.split("\n")[0];
          reject(new Error(message));
        }
      } else {
        const remoteProfile = profile as RemoteProfile;
        this.testRemoteConnection(remoteProfile.schema, remoteProfile.host, remoteProfile.port, remoteProfile.authorization)
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      }
    });
  }

  existsName(name: string): boolean {
    return this.getProfiles().some((profile) => profile.name === name);
  }

  getProfiles(): Profile[] {
    return this.settingManager.get<Profile[]>("profile.all", [])!;
  }

  getProfileByName(name: string): Profile | undefined {
    return this.getProfiles().find((profile) => profile.name === name);
  }

  addProfile(profile: Profile): void {
    const profiles = this.getProfiles();
    profiles.push(profile);
    this.settingManager.set("profile.all", profiles);
    this.profilesBehaviorSubject.next(profiles);
  }

  updateProfile(profile: Profile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index === -1) return;
    profiles[index] = profile;
    this.settingManager.set("profile.all", profiles);
    this.profilesBehaviorSubject.next(profiles);
  }

  deleteProfileById(id: string): Promise<void> {
    const index = this.getProfiles().findIndex((profile) => profile.id === id);
    return this.deleteProfileByIndex(index);
  }

  deleteProfileByName(name: string): Promise<void> {
    const index = this.getProfiles().findIndex((profile) => profile.name === name);
    return this.deleteProfileByIndex(index);
  }

  private deleteProfileByIndex(index: number): Promise<void> {
    if (index === -1) return Promise.resolve();
    return new Promise((resolve, reject) => {
      try {
        const profiles = this.getProfiles();
        const profile = profiles[index];
        if (profile === undefined) return;
        if (profile.type === "file") {
          const fileProfile = profile as FileProfile;
          fs.existsSync(fileProfile.path) && fs.unlinkSync(fileProfile.path);
        }
        profiles.splice(index, 1);
        this.settingManager.set("profile.all", profiles);
        this.profilesBehaviorSubject.next(profiles);
        if(this.selectedProfile === undefined) {
          this.logger.info("The selected profile has been deleted, will shutdown clash process or disconnect remote clash");
          this.profileSelectedChangedBehaviorSubject.next(undefined);
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  saveProfileFromRemote(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.httpClient.get(url, { responseType: "blob" }).pipe(
        timeout(this.syncProfileFromRemoteTimeout)
      ).subscribe({
        next: (blob) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result;
            if (content === null) {
              reject(new Error("Read file error"));
              return;
            }
            const absolutePath = path.join(this.configManager.profilesDirectory, new Date().getTime() + ".yaml");
            const array = new Uint8Array(content as ArrayBuffer);
            fs.writeFile(absolutePath, array, (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve(absolutePath);
            });
          };
          reader.readAsArrayBuffer(blob);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   *
   * @param schema http or https
   * @param host
   * @param port
   * @param authorization token
   * @returns version
   */
  testRemoteConnection(schema: string, host: string, port: number, authorization: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = `${schema}${host}:${port}/version`;
      this.httpClient.get(url, { headers: { Authorization: `Bearer ${authorization}` } }).subscribe({
        next: (v: any) => {
          if (v.version === undefined) reject(new Error("Invalid version"));
          else resolve(v.version);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  /**
   * sync file profile
   * @param name
   * @returns
   */
  async syncProfileByName(name: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const profiles = this.getProfiles();
      const index = profiles.findIndex((profile) => profile.name === name);
      if (index === -1) return;
      const profile = profiles[index] as FileProfile;
      if (profile.type !== "file") return;
      try {
        this.profileSyncStatusBehaviorSubject.next({ profileId: profile.id, status: "synchronizing" });
        const absolutePath = await this.saveProfileFromRemote(profile.subscribeUrl!);
        fs.existsSync(profile.path) && fs.unlinkSync(profile.path);
        profile.path = absolutePath;
        profile.updateTimestamp = new Date().getTime();
        this.settingManager.set("profile.all", profiles);
        this.profilesBehaviorSubject.next(profiles);
        this.profileSyncStatusBehaviorSubject.next({ profileId: profile.id, status: "success" });
        resolve();
      } catch (err) {
        this.profileSyncStatusBehaviorSubject.next({ profileId: profile.id, status: "failed" });
        reject(err);
      }
    });
  }
}
