import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-scale-root',
  templateUrl: './scale-root.component.html',
  styleUrls: ['./scale-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleRootComponent { }
