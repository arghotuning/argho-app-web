import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {
  ArghoEditorModel,
  ScaleMetadataSnapshot,
  ScaleRoot,
  UpperDegrees,
} from '@arghotuning/argho-editor';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H'},
  {position: 2, name: 'Helium', weight: 4.0026, symbol: 'He'},
  {position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li'},
  {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
  {position: 5, name: 'Boron', weight: 10.811, symbol: 'B'},
  {position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C'},
  {position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N'},
  {position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O'},
  {position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F'},
  {position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne'},
];

@Component({
  selector: 'app-scale-editor',
  templateUrl: './scale-editor.component.html',
  styleUrls: ['./scale-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleEditorComponent {
  scaleMetadata!: ScaleMetadataSnapshot;
  scaleRoot!: ScaleRoot;
  upperDegrees!: UpperDegrees;

  private readonly model: ArghoEditorModel;

  constructor(data: TuningDataService, changeDetector: ChangeDetectorRef) {
    this.model = data.model;

    // Note: Always called back synchronously.
    this.model.scaleMetadata().subscribe(scaleMetadata => {
      this.scaleMetadata = scaleMetadata;

      scaleMetadata.numDegrees;
      scaleMetadata.octavesSpanned;

      scaleMetadata.measureFromPreset;

      changeDetector.markForCheck();
    });

    this.model.scaleRoot().subscribe(scaleRoot => {
      this.scaleRoot = scaleRoot;

      scaleRoot.specType;
      scaleRoot.nearestMidiPitch;
      scaleRoot.centsFrom12tet;
      scaleRoot.rootFreqHz;

      scaleRoot.globalTuneA4Hz;

      // Display #: 1.
      scaleRoot.firstMappedPitch;

      changeDetector.markForCheck();
    });

    this.model.upperDegrees().subscribe(upperDegrees => {
      this.upperDegrees = upperDegrees;

      const upperDeg = this.upperDegrees.get(1);
      upperDeg.firstMappedPitch;
      upperDeg.deg;  // Index / display #.
      upperDeg.tunedInterval;  // Ratio, cents.
      upperDeg.measureFrom;
      upperDeg.freqHz;

      changeDetector.markForCheck();
    });
  }

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;
}
