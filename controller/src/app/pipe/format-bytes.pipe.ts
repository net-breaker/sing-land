import { Pipe, PipeTransform } from "@angular/core";

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

@Pipe({
  name: "formatBytes"
})
export class FormatBytesPipe implements PipeTransform {
  transform(value: number | undefined, decimals: number = 2): string {
    if (value == null || value === undefined) {
      return 0 + " Bytes";
    }

    if (!decimals) decimals = 2;

    return formatBytes(value, decimals);
  }
}
