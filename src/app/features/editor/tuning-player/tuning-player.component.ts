import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-tuning-player',
  templateUrl: './tuning-player.component.html',
  styleUrls: ['./tuning-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TuningPlayerComponent { }