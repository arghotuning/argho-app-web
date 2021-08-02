import {TuningDataService} from 'src/app/infra/tuning-data/tuning-data.service';

import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ArghoEditorContext, ArghoEditorModel} from '@arghotuning/argho-editor';
import {Converter} from '@arghotuning/arghotun-proto';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent implements OnInit {
  private readonly context: ArghoEditorContext;
  private readonly model: ArghoEditorModel;

  constructor(
    private readonly route: ActivatedRoute,
    data: TuningDataService,
  ) {
    this.model = data.model;
    this.context = data.context;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      // If a tuning was passed via URL, load it now.
      const encodedTuning = params['t'];
      if (!encodedTuning) {
        return;
      }

      const converter = new Converter(this.context);

      try {
        const tuningProto = converter.fromBase64UrlEncoding(encodedTuning);
        const parseResult = converter.fromProto(tuningProto);
        if (parseResult.warnings.length >= 1) {
          // TODO: Display warnings to user.
        }

        this.model.replaceTuning(parseResult.tuning);
      } catch (e) {
        // TODO: Display error dialog about invalid Tuning data.
        console.log('Error paring t= Tuning data:  ' + e);
      }
    });
  }
}
