/**
 * Natural Sort Tests
 * Tests for NABH objective code natural sorting
 */

import { describe, it, expect } from 'vitest';

// Natural sort function from nabhStore
function naturalSort(a: string, b: string): number {
  const regex = /(\d+)|(\D+)/g;
  const aParts = a.match(regex) || [];
  const bParts = b.match(regex) || [];

  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];

    const aNum = parseInt(aPart, 10);
    const bNum = parseInt(bPart, 10);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      if (aNum !== bNum) return aNum - bNum;
    } else {
      if (aPart !== bPart) return aPart.localeCompare(bPart);
    }
  }

  return aParts.length - bParts.length;
}

describe('Natural Sort', () => {
  it('should sort numeric parts numerically', () => {
    const codes = ['COP.10', 'COP.2', 'COP.1', 'COP.20'];
    const sorted = codes.sort(naturalSort);
    expect(sorted).toEqual(['COP.1', 'COP.2', 'COP.10', 'COP.20']);
  });

  it('should sort alphabetic parts alphabetically', () => {
    const codes = ['COP.1.c', 'COP.1.a', 'COP.1.b'];
    const sorted = codes.sort(naturalSort);
    expect(sorted).toEqual(['COP.1.a', 'COP.1.b', 'COP.1.c']);
  });

  it('should handle mixed alphanumeric codes', () => {
    const codes = ['AAC.10.b', 'AAC.2.a', 'AAC.2.b', 'AAC.10.a'];
    const sorted = codes.sort(naturalSort);
    expect(sorted).toEqual(['AAC.2.a', 'AAC.2.b', 'AAC.10.a', 'AAC.10.b']);
  });

  it('should handle different chapter codes', () => {
    const codes = ['PSQ.1', 'COP.1', 'AAC.1', 'MOM.1'];
    const sorted = codes.sort(naturalSort);
    expect(sorted).toEqual(['AAC.1', 'COP.1', 'MOM.1', 'PSQ.1']);
  });

  it('should handle codes without numeric parts', () => {
    const codes = ['AAC', 'COP', 'MOM'];
    const sorted = codes.sort(naturalSort);
    expect(sorted).toEqual(['AAC', 'COP', 'MOM']);
  });
});
