// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {ChangeDetectionStrategy, Component} from '@angular/core';

@Component({
  selector: 'app-scale-editor',
  templateUrl: './scale-editor.component.html',
  styleUrls: ['./scale-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScaleEditorComponent { }
