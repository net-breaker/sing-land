import { NgModule } from "@angular/core";
import { DurationTimePipe } from "./duration-time.pipe";
import { FormatBytesPipe } from "./format-bytes.pipe";
import { FormatDatePipe } from "./format-date.pipe";
import { FormatTimePipe } from "./format-time.pipe";

@NgModule({
  declarations: [FormatBytesPipe, FormatDatePipe, FormatTimePipe, DurationTimePipe],
  exports: [FormatBytesPipe, FormatDatePipe, FormatTimePipe, DurationTimePipe],
  imports: []
})
export class PipeModule {}
