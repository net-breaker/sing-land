import { Pipe, PipeTransform } from "@angular/core";
import * as dayjs from "dayjs";

@Pipe({ name: "formatDate" })
export class FormatDatePipe implements PipeTransform {
  transform(time: number): string {
    return dayjs(time).locale("zh-cn").format("YYYY-MM-DD HH:mm:ss");
  }
}
