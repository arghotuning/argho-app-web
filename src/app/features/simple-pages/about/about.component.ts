// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {Component} from '@angular/core';
import {
  faCircleInfo,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  // Font Awesome icons:
  faCircleInfo = faCircleInfo;
  faExternalLinkAlt = faExternalLinkAlt;

  // Third party projects:
  // TODO: Generate this from ThirdPartyNotices/ folder instead of having to
  // maintain by hand.
  projects = [
    {
      name: 'Font-Awesome',
      url: 'https://github.com/FortAwesome/Font-Awesome',
      copyright: 'Fonticons, Inc.',
      licenseType: 'MIT AND CC-BY-4.0',
    },
    {
      name: 'Inconsolata',
      url: 'https://github.com/googlefonts/Inconsolata',
      copyright: 'Copyright 2006 The Inconsolata Project Authors (https://github.com/cyrealtype/Inconsolata)',
      licenseType: 'OFL-1.1-no-RFN',
    },
    {
      name: 'Argho Titles (modified subset of Lora-Cyrillic font)',
      url: 'https://github.com/cyrealtype/Lora-Cyrillic',
      copyright: 'Copyright 2011 The Lora Project Authors (https://github.com/cyrealtype/Lora-Cyrillic), with Reserved Font Name "Lora".',
      licenseType: 'OFL-1.1-RFN',
    },
    {
      name: 'Work-Sans',
      url: 'https://github.com/weiweihuanghuang/Work-Sans',
      copyright: 'Copyright 2019 The Work Sans Project Authors (https://github.com/weiweihuanghuang/Work-Sans)',
      licenseType: 'OFL-1.1-no-RFN',
    },
    {
      name: 'angular-fontawesome',
      url: 'https://github.com/FortAwesome/angular-fontawesome',
      copyright: 'Copyright (c) 2018 Fonticons, Inc. and contributors',
      licenseType: 'MIT',
    },
    {
      name: 'angular',
      url: 'https://github.com/angular/angular',
      copyright: 'Copyright (c) 2010-2022 Google LLC.',
      licenseType: 'MIT',
    },
    {
      name: 'argho-editor-js',
      url: 'https://github.com/arghotuning/argho-editor-js',
      copyright: '2022 Argho Tuning Project Authors',
      licenseType: 'Apache-2.0',
    },
    {
      name: 'arghotun-js',
      url: 'https://github.com/arghotuning/arghotun-js',
      copyright: '2022 Argho Tuning Project Authors',
      licenseType: 'Apache-2.0',
    },
    {
      name: 'arghotun-proto-js',
      url: 'https://github.com/arghotuning/arghotun-proto-js',
      copyright: '2022 Argho Tuning Project Authors',
      licenseType: 'Apache-2.0',
    },
    {
      name: 'Argho Accidentals (modified subset of Bravura Text font)',
      url: 'https://github.com/steinbergmedia/bravura',
      copyright: 'Copyright © 2019, Steinberg Media Technologies GmbH (http://www.steinberg.net/), with Reserved Font Name "Bravura".',
      licenseType: 'OFL-1.1-RFN',
    },
    {
      name: 'fscreen',
      url: 'https://github.com/rafgraph/fscreen',
      copyright: 'Copyright (c) 2017 Rafael Pedicini',
      licenseType: 'MIT',
    },
    {
      name: 'google-protobuf',
      url: 'https://www.npmjs.com/package/google-protobuf',
      copyright: 'Copyright 2008 Google Inc.  All rights reserved.',
      licenseType: 'BSD-3-Clause',
    },
    {
      name: 'immutable-js',
      url: 'https://github.com/immutable-js/immutable-js',
      copyright: 'Copyright (c) 2014-present, Lee Byron and other contributors.',
      licenseType: 'MIT',
    },
    {
      name: 'parse5',
      url: 'https://github.com/inikulin/parse5',
      copyright: 'Copyright (c) 2013-2019 Ivan Nikulin (ifaaan@gmail.com, https://github.com/inikulin)',
      licenseType: 'MIT',
    },
    {
      name: '@protobufjs/base64',
      url: 'https://www.npmjs.com/package/@protobufjs/base64',
      copyright: 'Copyright (c) 2016, Daniel Wirtz  All rights reserved.',
      licenseType: 'BSD-3-Clause',
    },
    {
      name: 'rxjs',
      url: 'https://github.com/ReactiveX/rxjs',
      copyright: 'Copyright (c) 2015-2018 Google, Inc., Netflix, Inc., Microsoft Corp. and contributors',
      licenseType: 'Apache-2.0',
    },
    {
      name: 'simple-tr8n-js',
      url: 'https://github.com/Lindurion/simple-tr8n-js',
      copyright: '2022 Eric Barndollar',
      licenseType: 'Apache-2.0',
    },
    {
      name: 'tslib',
      url: 'https://github.com/Microsoft/tslib',
      copyright: 'Copyright (c) Microsoft Corporation.',
      licenseType: '0BSD',
    },
    {
      name: '@types/fscreen',
      url: 'https://www.npmjs.com/package/@types/fscreen',
      copyright: 'Joscha Feth <https://github.com/joscha>, Terry Mun <https://github.com/terrymun>',
      licenseType: 'MIT',
    },
    {
      name: '@types/google-protobuf',
      url: 'https://www.npmjs.com/package/@types/google-protobuf',
      copyright: 'Marcus Longmuir <https://github.com/marcuslongmuir>, Chaitanya Kamatham <https://github.com/kamthamc>',
      licenseType: 'MIT',
    },
    {
      name: '@types/webmidi',
      url: 'https://www.npmjs.com/package/@types/webmidi',
      copyright: 'Toshiya Nakakura <https://github.com/nakakura>',
      licenseType: 'MIT',
    },
  ];
}
