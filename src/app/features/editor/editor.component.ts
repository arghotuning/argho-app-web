// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute} from '@angular/router';
import {
  ArghoEditorContext,
  ArghoEditorModel,
  TuningEditMode,
} from '@arghotuning/argho-editor';
import {TuningConverter} from '@arghotuning/arghotun-proto';

import {TuningPlayerComponent} from './tuning-player/tuning-player.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnInit {
  private readonly context: ArghoEditorContext;
  private readonly model: ArghoEditorModel;

  isBasic!: boolean;

  @ViewChild('player')
  player: TuningPlayerComponent | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    data: TuningDataService,
    changeDetector: ChangeDetectorRef,
  ) {
    this.model = data.model;
    this.context = data.context;

    // NOTE: Always called synchronously first time.
    this.model.tuningMetadata().subscribe(tuningMetadata => {
      this.isBasic = (tuningMetadata.editMode === TuningEditMode.BASIC);
      changeDetector.markForCheck();
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      // If a tuning was passed via URL, load it now.
      // tslint:disable-next-line: no-string-literal
      const encodedTuning = params['t'];
      if (!encodedTuning) {
        return;
      }

      const converter = new TuningConverter(this.context);

      try {
        const tuningProto = converter.fromBase64UrlEncoding(encodedTuning);
        const parseResult = converter.fromProto(tuningProto);
        if (parseResult.warnings.length >= 1) {
          // TODO: Display warnings to user.
        }

        this.model.replaceTuning(parseResult.tuning);
      } catch (e) {
        // TODO: Display error dialog about invalid Tuning data (likely URL too long).
        console.log('Error parsing t= Tuning data:  ' + e);
      }
    });
  }

  handleTabChange(event: MatTabChangeEvent): void {
    this.player?.handleTabChange();
  }
}
