// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {ComingSoonComponent} from './coming-soon/coming-soon.component';

@NgModule({
  declarations: [ComingSoonComponent],
  imports: [CommonModule],
  exports: [ComingSoonComponent],
})
export class SimplePagesModule {}
