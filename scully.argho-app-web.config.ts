// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

/** this loads the default render plugin, remove when switching to something else. */
import '@scullyio/scully-plugin-puppeteer';

import {ScullyConfig} from '@scullyio/scully';

export const config: ScullyConfig = {
  projectRoot: "./src",
  projectName: "argho-app-web",
  // add spsModulePath when using de Scully Platform Server,
  outDir: './dist/static',
  routes: {},
};
