// SPDX-FileCopyrightText: 2022 Argho Tuning Project Authors
//
// SPDX-License-Identifier: Apache-2.0

const NON_ZERO_DIGIT = /[1-9]/;

export function toFixedClean(x: number, digits: number): string {
  const result = x.toFixed(digits);
  return NON_ZERO_DIGIT.test(result) ? result : result.replace('-0', '0');
}
