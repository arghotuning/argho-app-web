import {TestBed} from '@angular/core/testing';

import {TuningDataService} from './tuning-data.service';

describe('TuningDataService', () => {
  let service: TuningDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TuningDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
