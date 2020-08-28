import {Component} from '@angular/core';
import {
  faCodeBranch,
  faDownload,
  faEnvelope,
  faFileCode,
  faGraduationCap,
  faHome,
  faMusic,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
  // Font Awesome Icons:
  faCodeBranch = faCodeBranch
  faDownload = faDownload
  faEnvelope = faEnvelope
  faFileCode = faFileCode
  faGraduationCap = faGraduationCap
  faHome = faHome
  faMusic = faMusic
}
