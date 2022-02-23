// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {Subscription} from 'rxjs';

import {Component, OnDestroy} from '@angular/core';

/** Base component with some common utilities. */
@Component({
  selector: 'app-base',
  template: '',
})
export class BaseComponent implements OnDestroy {
  private readonly subs: Subscription[] = [];

  track(sub: Subscription): void {
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
  }
}
