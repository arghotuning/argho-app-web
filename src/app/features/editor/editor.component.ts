// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {first} from 'rxjs';
import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';
import {BaseComponent} from 'src/app/infra/ui/base/base.component';
import {
  ErrorDialogComponent,
  ErrorDialogData,
} from 'src/app/infra/ui/error-dialog/error-dialog.component';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatTabChangeEvent} from '@angular/material/tabs';
import {ActivatedRoute, Router} from '@angular/router';
import {TuningEditMode} from '@arghotuning/argho-editor';
import {TuningConverter} from '@arghotuning/arghotun-proto';

import {TuningPlayerComponent} from './tuning-player/tuning-player.component';

const PARSE_ERROR_MSG =
    'Unable to parse tuning from t= URL data. '
    + 'Try saving and loading an .arghotun file instead.';

const PARSE_WARNINGS_MSG =
    'These warnings might affect correct interpretation of the loaded tuning.';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent extends BaseComponent implements OnInit {
  private readonly converter: TuningConverter;
  private isInitialLoad = true;

  isBasic!: boolean;

  @ViewChild('player')
  player: TuningPlayerComponent | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly data: TuningDataService,
    changeDetector: ChangeDetectorRef,
  ) {
    super();
    this.converter = new TuningConverter(data.context);

    // NOTE: Always called synchronously first time.
    this.track(this.data.model.tuningMetadata().subscribe(tuningMetadata => {
      this.isBasic = (tuningMetadata.editMode === TuningEditMode.BASIC);
      changeDetector.markForCheck();
    }));
  }

  ngOnInit(): void {
    // If a tuning was passed via URL (first load only), load it now.
    this.track(this.route.queryParams.pipe(first()).subscribe(params => {
      // tslint:disable-next-line: no-string-literal
      const encodedTuning = params['t'];
      if (encodedTuning) {
        this.loadEncodedTuning_('' + encodedTuning);
      }
    }));

    // Any time tuning is changed (after this initial load), update URL.
    this.track(this.data.anyTuningChange().subscribe(() => this.handleTuningChange_()));
  }

  private loadEncodedTuning_(encodedTuning: string): void {
    try {
      const tuningProto = this.converter.fromBase64UrlEncoding(encodedTuning);
      const parseResult = this.converter.fromProto(tuningProto);
      if (parseResult.warnings.length >= 1) {
        const dialogData: ErrorDialogData = {
          title: 'Warnings from loaded tuning',
          // TODO: Share this with open tuning button.
          msgs: [PARSE_WARNINGS_MSG, ...parseResult.warnings],
        };
        this.dialog.open(ErrorDialogComponent, {data: dialogData});
      }

      this.data.model.replaceTuning(parseResult.tuning);
    } catch (e) {
      const dialogData: ErrorDialogData = {
        title: 'Error loading tuning',
        msgs: [`${PARSE_ERROR_MSG} -- ${e}`],
      };
      this.dialog.open(ErrorDialogComponent, {data: dialogData});
    }
  }

  private handleTuningChange_(): void {
    const tuning = this.data.model.getTuningSnapshot();

    const tuningProto = this.converter.toProto(tuning);
    const encodedTuning = this.converter.toBase64UrlEncoding(tuningProto);

    const url = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: {'t': encodedTuning},
      queryParamsHandling: 'merge',
    });

    // Update URL to always contain this encoded tuning.
    // Don't navigate via Angular API to avoid reloading this component.
    history.replaceState({}, '', url.toString());
  }

  handleTabChange(event: MatTabChangeEvent): void {
    this.player?.handleTabChange();
  }
}
