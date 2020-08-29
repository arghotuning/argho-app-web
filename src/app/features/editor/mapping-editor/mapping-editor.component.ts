import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-mapping-editor',
  templateUrl: './mapping-editor.component.html',
  styleUrls: ['./mapping-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MappingEditorComponent { }
