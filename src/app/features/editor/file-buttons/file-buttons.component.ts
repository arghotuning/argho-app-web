import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-file-buttons',
  templateUrl: './file-buttons.component.html',
  styleUrls: ['./file-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileButtonsComponent { }
