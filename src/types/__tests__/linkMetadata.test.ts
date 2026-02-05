/**
 * Link Metadata Type Tests
 * Tests for link metadata type definitions
 */

import { describe, it, expect } from 'vitest';
import type { LinkMetadata } from '../linkMetadata';

describe('LinkMetadata Type', () => {
  it('should accept valid link metadata', () => {
    const metadata: LinkMetadata = {
      url: 'https://docs.google.com/document/d/123',
      title: 'AAC Chapter Cheat Sheet',
      description: 'Quick reference for AAC standards',
      keywords: ['nabh', 'aac', 'audit'],
      category: 'Cheat Sheet',
      type: 'google_docs',
      priority: 'high',
    };

    expect(metadata.url).toBe('https://docs.google.com/document/d/123');
    expect(metadata.keywords).toHaveLength(3);
    expect(metadata.type).toBe('google_docs');
  });

  it('should accept minimal link metadata', () => {
    const metadata: LinkMetadata = {
      url: 'https://example.com',
      title: 'Example',
      description: 'Example description',
      keywords: ['example'],
    };

    expect(metadata).toBeDefined();
    expect(metadata.category).toBeUndefined();
    expect(metadata.type).toBeUndefined();
    expect(metadata.priority).toBeUndefined();
  });

  it('should validate priority values', () => {
    const priorities: Array<LinkMetadata['priority']> = ['high', 'medium', 'low', undefined];

    priorities.forEach(priority => {
      const metadata: LinkMetadata = {
        url: 'https://example.com',
        title: 'Test',
        description: 'Test',
        keywords: [],
        priority,
      };

      expect(metadata.priority).toBe(priority);
    });
  });

  it('should validate type values', () => {
    const types: Array<LinkMetadata['type']> = [
      'google_docs',
      'google_sheets',
      'pdf',
      'website',
      'other',
      undefined,
    ];

    types.forEach(type => {
      const metadata: LinkMetadata = {
        url: 'https://example.com',
        title: 'Test',
        description: 'Test',
        keywords: [],
        type,
      };

      expect(metadata.type).toBe(type);
    });
  });
});
