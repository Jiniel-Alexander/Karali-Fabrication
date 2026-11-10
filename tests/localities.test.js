import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ALL_LOCALITIES,
  LOCALITY_GROUPS,
  filterLocalities,
  findExactLocality,
  isAllowedLocality,
} from '../src/data/localities.js';

const MIGRATIONS_DIR = join(import.meta.dirname, '..', 'supabase', 'migrations');
const migrationFile = readdirSync(MIGRATIONS_DIR).find((f) => f.endsWith('_create_location_test_submissions.sql'));
const migrationSql = readFileSync(join(MIGRATIONS_DIR, migrationFile), 'utf8');

describe('locality list', () => {
  it('has the expected regions and counts', () => {
    expect(LOCALITY_GROUPS.map((g) => [g.region, g.localities.length])).toEqual([
      ['Mumbai', 31],
      ['Thane', 14],
      ['Navi Mumbai', 12],
    ]);
  });

  it('has no duplicates', () => {
    expect(new Set(ALL_LOCALITIES).size).toBe(ALL_LOCALITIES.length);
  });

  it('matches the SQL allow-list in the migration exactly', () => {
    const arrayBody = migrationSql.match(/any\s*\(array\[([\s\S]*?)\]::text\[\]\)/i)?.[1];
    expect(arrayBody, 'allow-list array not found in migration').toBeTruthy();
    const sqlList = [...arrayBody.replace(/--.*$/gm, '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
    expect([...sqlList].sort()).toEqual([...ALL_LOCALITIES].sort());
  });
});

describe('isAllowedLocality', () => {
  it('accepts only exact canonical names', () => {
    expect(isAllowedLocality('Andheri East')).toBe(true);
    expect(isAllowedLocality('andheri east')).toBe(false);
    expect(isAllowedLocality('Andheri')).toBe(false);
    expect(isAllowedLocality('Pune')).toBe(false);
    expect(isAllowedLocality('')).toBe(false);
    expect(isAllowedLocality(null)).toBe(false);
    expect(isAllowedLocality("Worli'); drop table x;--")).toBe(false);
  });
});

describe('filterLocalities', () => {
  const names = (q) => filterLocalities(q).flatMap((g) => g.localities);

  it('returns everything for an empty query', () => {
    expect(names('')).toHaveLength(57);
  });

  it('is case-insensitive', () => {
    expect(names('ANDHERI')).toEqual(['Andheri East', 'Andheri West']);
    expect(names('vAsHi')).toEqual(['Vashi']);
  });

  it('matches region names', () => {
    const thane = filterLocalities('navi mumbai');
    expect(thane).toHaveLength(1);
    expect(thane[0].localities).toHaveLength(12);
  });

  it('ignores spacing/punctuation', () => {
    expect(names('vile-parle')).toEqual(['Vile Parle']);
    expect(names('miraroad')).toEqual(['Mira Road']);
  });

  it('ranks prefix matches first', () => {
    expect(names('par')[0]).toBe('Parel');
  });

  it('returns no groups for unknown text', () => {
    expect(filterLocalities('zzzz')).toEqual([]);
  });
});

describe('findExactLocality', () => {
  it('resolves exact matches ignoring case and spacing', () => {
    expect(findExactLocality('  thane west ')).toBe('Thane West');
    expect(findExactLocality('thane')).toBeNull();
    expect(findExactLocality('')).toBeNull();
  });
});

describe('combobox highlighted option rendering & CSS alignment', () => {
  const comboboxSrc = readFileSync(join(import.meta.dirname, '..', 'src', 'components', 'combobox.js'), 'utf8');
  const styleCss = readFileSync(join(import.meta.dirname, '..', 'src', 'style.css'), 'utf8');

  it('wraps highlighted and remaining locality substrings in a single inline .combobox__option-label span', () => {
    expect(comboboxSrc).toContain("el('span', 'combobox__option-label')");
    expect(styleCss).toMatch(/\.combobox__option\s*\{[^}]*justify-content:\s*flex-start;/);
    expect(styleCss).not.toMatch(/\.combobox__option\s*\{[^}]*justify-content:\s*space-between;/);
    expect(styleCss).toMatch(/\.combobox__option-label\s*\{[^}]*white-space:\s*nowrap;/);
    expect(styleCss).toMatch(/\.combobox__option\.is-chosen::after\s*\{[^}]*margin-left:\s*auto;/);
  });

  it('returns the expected top locality matches for "and", "band", "thane", and "vashi"', () => {
    const names = (q) => filterLocalities(q).flatMap((g) => g.localities);

    expect(names('and').slice(0, 2)).toEqual(['Andheri East', 'Andheri West']);
    expect(names('band')).toEqual(['Bandra East', 'Bandra West']);
    expect(names('thane').slice(0, 2)).toEqual(['Thane East', 'Thane West']);
    expect(names('vashi')).toEqual(['Vashi']);
  });
});
