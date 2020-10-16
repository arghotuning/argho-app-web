import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {ArghoEditorModel} from '@arghotuning/argho-editor';
import {ArghoTuningLimits} from '@arghotuning/arghotun';

@Component({
  selector: 'app-degrees-dialog',
  templateUrl: './degrees-dialog.component.html',
  styleUrls: ['./degrees-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DegreesDialogComponent {
  private readonly model: ArghoEditorModel;

  oldNumDegrees!: number;
  newNumDegrees!: number;

  minValue = ArghoTuningLimits.SCALE_DEGREES_MIN;
  maxValue = ArghoTuningLimits.SCALE_DEGREES_MAX;

  isValid = true;

  @ViewChild('numDegreesInput')
  tuningNameInput: ElementRef<HTMLInputElement> | undefined;

  constructor(
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
    private readonly dialogRef: MatDialogRef<DegreesDialogComponent>,
  ) {
    this.model = data.model;

    // Note: Always called back synchronously.
    this.model.scaleMetadata().subscribe(scaleMetadata => {
      this.oldNumDegrees = scaleMetadata.numDegrees;
      this.newNumDegrees = scaleMetadata.numDegrees;
      changeDetector.markForCheck();
    });
  }

  handleValueChange(value: string): void {
    // Validate user input.
    const parseResult =
      this.model.inputParser().forScaleMetadata().parseNumScaleDegrees(value);
    this.isValid = parseResult.hasValidValue();

    if (parseResult.hasValidValue()) {
      this.newNumDegrees = parseResult.getValue();
      if (this.tuningNameInput) {
        this.tuningNameInput.nativeElement.value = this.newNumDegrees.toString();
      }
    }
  }

  commit(): void {
    this.model.resetNumDegrees(this.newNumDegrees);
    this.dialogRef.close();
  }

  blurTarget(eventTarget: EventTarget | null): void {
    (eventTarget as HTMLElement).blur();
  }
}
