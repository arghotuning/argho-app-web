// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {browser, by, element} from 'protractor';

export class AppPage {
  navigateTo(): Promise<unknown> {
    return browser.get(browser.baseUrl) as Promise<unknown>;
  }

  getToolbarTitle(): Promise<string> {
    const el = element(by.css('app-root .toolbar-title'));
    return el.getText() as Promise<string>;
  }
}
