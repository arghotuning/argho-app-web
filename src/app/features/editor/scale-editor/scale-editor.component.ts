import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-scale-editor',
  templateUrl: './scale-editor.component.html',
  styleUrls: ['./scale-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleEditorComponent { }
