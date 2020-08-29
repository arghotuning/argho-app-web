import {Component} from '@angular/core';
import {
  faCodeBranch,
  faCompass,
  faDownload,
  faEnvelope,
  faExternalLinkAlt,
  faGraduationCap,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  // Font Awesome icons:
  faCodeBranch = faCodeBranch;
  faCompass = faCompass;
  faDownload = faDownload;
  faEnvelope = faEnvelope;
  faExternalLinkAlt = faExternalLinkAlt;
  faGraduationCap = faGraduationCap;
}
