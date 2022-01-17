// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {browser, logging} from 'protractor';

import {AppPage} from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display Argho Tuning as toolbar title', () => {
    page.navigateTo();
    expect(page.getToolbarTitle()).toEqual('Argho Tuning');
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser.
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
