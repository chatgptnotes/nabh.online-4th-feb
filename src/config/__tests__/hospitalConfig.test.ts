/**
 * Hospital Configuration Tests
 * Tests for multi-hospital configuration
 */

import { describe, it, expect } from 'vitest';
import { getHospitalInfo, getNABHCoordinator, ASSIGNEE_OPTIONS } from '../hospitalConfig';

describe('Hospital Configuration', () => {
  describe('getHospitalInfo', () => {
    it('should return Hope Hospital info', () => {
      const info = getHospitalInfo('hope');
      expect(info.name).toBe('Hope Hospital');
      expect(info.id).toBe('hope');
      expect(info.address).toContain('Nagpur');
      expect(info.email).toBe('info@hopehospital.com');
    });

    it('should return Ayushman Hospital info', () => {
      const info = getHospitalInfo('ayushman');
      expect(info.name).toBe('Ayushman Hospital');
      expect(info.id).toBe('ayushman');
      expect(info.address).toContain('Nagpur');
      expect(info.email).toBe('ayushmanhos@gmail.com');
    });

    it('should default to Hope Hospital for unknown IDs', () => {
      const info = getHospitalInfo('unknown' as any);
      expect(info.name).toBe('Hope Hospital');
    });
  });

  describe('getNABHCoordinator', () => {
    it('should return the Quality Coordinator', () => {
      const coordinator = getNABHCoordinator();
      expect(coordinator.name).toBe('Dr. Shiraz Sheikh');
      expect(coordinator.role).toBe('Quality Coordinator');
      expect(coordinator.department).toBe('Quality & Administration');
    });

    it('should have responsibilities defined', () => {
      const coordinator = getNABHCoordinator();
      expect(coordinator.responsibilities).toBeDefined();
      expect(coordinator.responsibilities.length).toBeGreaterThan(0);
    });
  });

  describe('ASSIGNEE_OPTIONS', () => {
    it('should contain key NABH team members', () => {
      const names = ASSIGNEE_OPTIONS.map(option => option.value);
      expect(names).toContain('Dr. Shiraz Sheikh');
      expect(names).toContain('Suraj');
      expect(names).toContain('Gaurav');
    });

    it('should have at least 5 assignee options', () => {
      expect(ASSIGNEE_OPTIONS.length).toBeGreaterThanOrEqual(5);
    });

    it('should have proper structure', () => {
      const firstOption = ASSIGNEE_OPTIONS[0];
      expect(firstOption).toHaveProperty('value');
      expect(firstOption).toHaveProperty('label');
      expect(firstOption).toHaveProperty('role');
      expect(firstOption).toHaveProperty('department');
    });

    it('should have unique values', () => {
      const values = ASSIGNEE_OPTIONS.map(option => option.value);
      const unique = new Set(values);
      expect(unique.size).toBe(values.length);
    });
  });
});
