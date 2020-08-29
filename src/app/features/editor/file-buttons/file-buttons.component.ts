import {ChangeDetectionStrategy, Component} from '@angular/core';
import {
  faCompass,
  faFile,
  faSave,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-file-buttons',
  templateUrl: './file-buttons.component.html',
  styleUrls: ['./file-buttons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileButtonsComponent {
  // Font Awesome icons:
  faFile = faFile;
  faUpload = faUpload;
  faSave = faSave;
  faCompass = faCompass;
}
