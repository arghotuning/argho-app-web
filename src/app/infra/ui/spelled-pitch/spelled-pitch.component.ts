import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {DisplayedMidiPitch} from '@arghotuning/argho-editor';

@Component({
  selector: 'app-spelled-pitch',
  templateUrl: './spelled-pitch.component.html',
  styleUrls: ['./spelled-pitch.component.scss'],
})
export class SpelledPitchComponent {
  @Input()
  pitch: DisplayedMidiPitch | undefined;
}
