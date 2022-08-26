// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

import {registerPlugin} from '@scullyio/scully';

export const myPlugin = 'myPlugin';

const myFunctionPlugin = async (html: string): Promise<string> => {
  return html;
};

const validator = async () => [];

registerPlugin('postProcessByHtml', myPlugin, myFunctionPlugin, validator);
