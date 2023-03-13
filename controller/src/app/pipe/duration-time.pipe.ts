import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "durationTime" })
export class DurationTimePipe implements PipeTransform {
  transform(timespan: number): string {
    const now = new Date().getTime();
    const durationMillisecond = now - timespan;
    const durationMinutes = Math.floor(durationMillisecond / 1000 / 60);

    if (durationMinutes < 1) {
      return "less then a minute";
    } else if (durationMinutes < 60) {
      return durationMinutes === 1 ? "1 minute ago" : `${durationMinutes} minutes ago`;
    } else if (durationMinutes < 60 * 24) {
      const durationHours = Math.floor(durationMinutes / 60);
      return durationHours === 1 ? "1 hour ago" : `${durationHours} hours ago`;
    } else if (durationMinutes < 60 * 24 * 30) {
      const durationDays = Math.floor(durationMinutes / 60 / 24);
      return durationDays === 1 ? "1 day ago" : `${durationDays} days ago`;
    } else if (durationMinutes < 60 * 24 * 30 * 12) {
      const durationMonths = Math.floor(durationMinutes / 60 / 24 / 30);
      return durationMonths === 1 ? "1 month ago" : `${durationMonths} months ago`;
    }

    // more than one year
    return "long long ago";
  }
}
