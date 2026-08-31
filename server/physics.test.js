import { describe, it, expect } from 'vitest';
import { validateIndex, criticalAngle, refract, angleFromPoint } from './physics.js';

describe('Physics Logic', () => {
    it('validateIndex: ควบคุมค่า n ให้อยู่ในช่วง 1.0 - 10.0', () => {
        expect(validateIndex('0.5')).toBe(1.0);  // น้อยกว่า 1 ให้เป็น 1
        expect(validateIndex('15')).toBe(10.0);  // มากกว่า 10 ให้เป็น 10
        expect(validateIndex('1.5')).toBe(1.5);  // ปกติ
        expect(validateIndex('abc')).toBe(1.0);  // พิมพ์มั่วให้เป็น 1
    });

    it('criticalAngle: คำนวณมุมวิกฤตได้ถูกต้อง', () => {
        // น้ำ (1.33) ไป อากาศ (1.0) ~ 48.75 องศา
        const angle = criticalAngle(1.33, 1.0);
        expect(angle).toBeCloseTo(48.75, 1);

        // n1 <= n2 ไม่มีมุมวิกฤต
        expect(criticalAngle(1.0, 1.33)).toBeNull();
    });

    it('refract: ต้องตรวจจับการสะท้อนกลับหมด (TIR) ได้', () => {
        const result = refract(1.33, 1.0, 60); // มุมตก 60 > มุมวิกฤต (48.75)
        expect(result.tir).toBe(true);
        expect(result.t2Deg).toBe(60); // มุมสะท้อนเท่ากับมุมตก
    });

    it('validateIndex: รองรับค่าขอบเขตพอดีและค่าว่าง', () => {
        expect(validateIndex('1')).toBe(1);
        expect(validateIndex('10')).toBe(10);
        expect(validateIndex('')).toBe(1);
    });

    it('criticalAngle: ไม่มีมุมวิกฤตเมื่อดัชนีเท่ากัน', () => {
        expect(criticalAngle(1.5, 1.5)).toBeNull();
    });

    it('refract: คำนวณมุมหักเหเมื่อแสงผ่านจากอากาศสู่น้ำ', () => {
        const result = refract(1.0, 1.33, 30);
        expect(result.tir).toBe(false);
        expect(result.t2Deg).toBeCloseTo(22.08, 2);
    });

    it('refract: มุมตกกระทบศูนย์ให้มุมหักเหศูนย์', () => {
        expect(refract(1.33, 1.0, 0)).toEqual({ tir: false, t2Deg: 0 });
    });

    it('angleFromPoint: จำกัดมุมให้อยู่ในช่วง 0 ถึง 89.99 องศา', () => {
        expect(angleFromPoint(300, 90, 300, 210)).toBe(0);
        expect(angleFromPoint(90, 210, 300, 210)).toBe(89.99);
        expect(angleFromPoint(510, 210, 300, 210)).toBe(0);
    });
});