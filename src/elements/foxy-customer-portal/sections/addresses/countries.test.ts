import { describe, it, expect } from 'vitest';
import { COUNTRIES } from './countries';

describe('Countries', () => {
  it('should have 249 countries', () => {
    expect(COUNTRIES.length).toBe(249);
  });

  it('should be sorted by name', () => {
    COUNTRIES.forEach((country, i) => {
      if (i > 0) {
        expect(COUNTRIES[i - 1].name.localeCompare(country.name)).toBeLessThanOrEqual(0);
      }
    });
  });

  it('should have 12 countries with regions', () => {
    const countriesWithRegions = COUNTRIES.filter(c => c.regions.length > 0);
    expect(countriesWithRegions.length).toBe(12);
  });

  it('should have 328 total region entries', () => {
    const totalRegions = COUNTRIES.reduce((sum, country) => sum + country.regions.length, 0);
    expect(totalRegions).toBe(328);
  });

  it('should have correct region counts per country', () => {
    const countriesWithRegions = COUNTRIES.filter(c => c.regions.length > 0);
    const counts: Record<string, number> = {};
    countriesWithRegions.forEach(country => {
      counts[country.code] = country.regions.length;
    });

    expect(counts).toEqual({
      AU: 8,
      AT: 9,
      BQ: 3,
      CA: 13,
      DE: 16,
      ES: 54,
      CH: 26,
      IN: 36,
      IE: 26,
      JP: 47,
      NO: 26,
      US: 64,
    });
  });

  it('should have correct US entry', () => {
    const us = COUNTRIES.find(c => c.code === 'US');
    expect(us).toBeDefined();
    expect(us!.name).toBe('United States');
    expect(us!.regions.length).toBe(64);
    expect(us!.regions).toContainEqual({ code: 'CA', name: 'California' });
    expect(us!.regions).toContainEqual({ code: 'AK', name: 'Alaska' });
    expect(us!.regions).toContainEqual({ code: 'TX', name: 'Texas' });
  });

  it('should have correct CA entry', () => {
    const ca = COUNTRIES.find(c => c.code === 'CA');
    expect(ca).toBeDefined();
    expect(ca!.name).toBe('Canada');
    expect(ca!.regions.length).toBe(13);
    expect(ca!.regions).toContainEqual({ code: 'ON', name: 'Ontario' });
    expect(ca!.regions).toContainEqual({ code: 'BC', name: 'British Columbia' });
    expect(ca!.regions).toContainEqual({ code: 'QC', name: 'Quebec' });
  });

  it('should have correct AU entry', () => {
    const au = COUNTRIES.find(c => c.code === 'AU');
    expect(au).toBeDefined();
    expect(au!.name).toBe('Australia');
    expect(au!.regions).toEqual([
      { code: 'ACT', name: 'Australian Capital Territory' },
      { code: 'NSW', name: 'New South Wales' },
      { code: 'NT', name: 'Northern Territory' },
      { code: 'QLD', name: 'Queensland' },
      { code: 'SA', name: 'South Australia' },
      { code: 'TAS', name: 'Tasmania' },
      { code: 'VIC', name: 'Victoria' },
      { code: 'WA', name: 'Western Australia' },
    ]);
  });

  it('should have correct AF entry', () => {
    const af = COUNTRIES.find(c => c.code === 'AF');
    expect(af).toBeDefined();
    expect(af!.name).toBe('Afghanistan');
    expect(af!.regions).toEqual([]);
  });
});
