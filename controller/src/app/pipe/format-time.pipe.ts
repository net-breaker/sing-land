import { Pipe, PipeTransform } from "@angular/core";
import * as dayjs from "dayjs";

@Pipe({ name: "formatTime" })
export class FormatTimePipe implements PipeTransform {
  transform(time: number): string {
    return dayjs(time).locale("zh-cn").format("HH:mm:ss");
  }
}
