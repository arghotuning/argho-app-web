// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {BaseComponent} from 'src/app/infra/ui/base/base.component';
import {
  ScaleTableColGroup,
  ScaleTableUiConfig,
} from 'src/app/infra/ui/scale-table/scale-table-ui-config';
import {ScaleTableService} from 'src/app/infra/ui/scale-table/scale-table.service';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import {faCheck, faChevronCircleDown} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-scale-table-config',
  templateUrl: './scale-table-config.component.html',
  styleUrls: ['./scale-table-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleTableConfigComponent extends BaseComponent {
  // Font Awesome icons:
  faCheck = faCheck;
  faChevronCircleDown = faChevronCircleDown;

  // Column configuration:
  ScaleTableColGroup = ScaleTableColGroup;

  config!: ScaleTableUiConfig;

  constructor(
    private readonly service: ScaleTableService,
    changeDetector: ChangeDetectorRef,
  ) {
    super();

    // Note: Initial callback is always synchronous.
    this.track(service.config().subscribe(config => {
      this.config = config;
      changeDetector.markForCheck();
    }));
  }

  toggle(colGroup: ScaleTableColGroup, event: MouseEvent) {
    if (this.config.colGroups.contains(colGroup)) {
      this.service.hideColGroup(colGroup);
    } else {
      this.service.showColGroup(colGroup);
    }

    event.stopPropagation();  // Don't close menu.
  }
}
