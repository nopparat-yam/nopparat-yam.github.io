import { beforeAll, describe, expect, it } from 'vitest';

function createSimulatorDom() {
    document.body.innerHTML = `
        <canvas id="mainCanvas" width="600" height="420"></canvas>
        <select id="n1select">
            <option value="1.0003">อากาศ</option>
            <option value="1.33">น้ำ</option>
            <option value="custom">กำหนดเอง</option>
        </select>
        <input id="n1input" value="1.0003">
        <button id="n1minus"></button>
        <button id="n1plus"></button>
        <select id="n2select">
            <option value="1.0000">สุญญากาศ</option>
            <option value="1.33">น้ำ</option>
            <option value="custom">กำหนดเอง</option>
        </select>
        <input id="n2input" value="1.33">
        <button id="n2minus"></button>
        <button id="n2plus"></button>
        <input id="angleSlider" type="range" min="0" max="89.99" step="0.01" value="30">
        <input id="angleText" value="30.00">
        <div id="resultText"></div>
        <button id="criticalBtn"></button>
        <input id="showValues" type="checkbox" checked>
        <div id="badgeStatus"></div>
        <div id="statusLabel"></div>
        <div id="labelT2"></div>
    `;
}

async function startSimulator() {
    createSimulatorDom();
    await import('../script.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
}

describe('Snell law simulator', () => {
    beforeAll(async () => {
        await startSimulator();
    });

    it('แสดงผลการหักเหตั้งแต่เริ่มต้น', () => {
        expect(document.querySelector('#resultText').textContent).toBe('22.09°');
        expect(document.querySelector('#statusLabel').textContent).toBe('การหักเหปกติ');
    });

    it('เปลี่ยนตัวกลางแล้วอัปเดตค่า n และผลลัพธ์', () => {
        const n1Select = document.querySelector('#n1select');
        n1Select.value = '1.33';
        n1Select.dispatchEvent(new Event('change'));

        expect(n1Select.value).toBe('1.33');
        expect(n1Select.selectedOptions[0].textContent).toBe('น้ำ');
        expect(document.querySelector('#n1input').value).toBe('1.33');
        expect(document.querySelector('#resultText').textContent).toBe('30.00°');
    });

    it('กรอกค่า n เองแล้วเปลี่ยนเป็น custom ทั้งสองฝั่ง', () => {
        const n1Input = document.querySelector('#n1input');
        const n2Input = document.querySelector('#n2input');

        n1Input.value = '1.500';
        n1Input.dispatchEvent(new Event('input'));
        expect(document.querySelector('#n1select').value).toBe('custom');
        expect(n1Input.value).toBe('1.500');

        n2Input.value = '1.200';
        n2Input.dispatchEvent(new Event('input'));
        expect(document.querySelector('#n2select').value).toBe('custom');
        expect(n2Input.value).toBe('1.200');
    });

    it('กดปุ่ม - แล้วลดค่า n ทั้งสองฝั่งทีละ 0.01', () => {
        const n1Input = document.querySelector('#n1input');
        const n2Input = document.querySelector('#n2input');
        n1Input.value = '1.500';
        n2Input.value = '1.200';

        document.querySelector('#n1minus').dispatchEvent(new MouseEvent('mousedown'));
        document.querySelector('#n1minus').dispatchEvent(new MouseEvent('mouseup'));
        document.querySelector('#n2minus').dispatchEvent(new MouseEvent('mousedown'));
        document.querySelector('#n2minus').dispatchEvent(new MouseEvent('mouseup'));

        expect(n1Input.value).toBe('1.490');
        expect(n2Input.value).toBe('1.190');
    });

    it('กดปุ่ม + แล้วเพิ่มค่า n ทั้งสองฝั่งทีละ 0.01', () => {
        const n1Input = document.querySelector('#n1input');
        const n2Input = document.querySelector('#n2input');
        n1Input.value = '1.500';
        n2Input.value = '1.200';

        document.querySelector('#n1plus').dispatchEvent(new MouseEvent('mousedown'));
        document.querySelector('#n1plus').dispatchEvent(new MouseEvent('mouseup'));
        document.querySelector('#n2plus').dispatchEvent(new MouseEvent('mousedown'));
        document.querySelector('#n2plus').dispatchEvent(new MouseEvent('mouseup'));

        expect(n1Input.value).toBe('1.510');
        expect(n2Input.value).toBe('1.210');
    });

    it('ปรับมุมด้วย slider และช่องกรอกมุมให้ค่าตรงกัน', () => {
        const slider = document.querySelector('#angleSlider');
        const angleText = document.querySelector('#angleText');

        slider.value = '45.50';
        slider.dispatchEvent(new Event('input'));
        expect(angleText.value).toBe('45.50');
        expect(document.querySelector('#resultText').textContent).not.toBe('--°');

        angleText.value = '10.25';
        angleText.dispatchEvent(new Event('change'));
        expect(slider.value).toBe('10.25');
        expect(angleText.value).toBe('10.25');
    });

    it('แสดงและกดปุ่มมุมวิกฤตได้', () => {
        const n1Input = document.querySelector('#n1input');
        const n2Select = document.querySelector('#n2select');
        n1Input.value = '1.33';
        n1Input.dispatchEvent(new Event('input'));
        n2Select.value = '1.0000';
        n2Select.dispatchEvent(new Event('change'));

        const criticalButton = document.querySelector('#criticalBtn');
        expect(criticalButton.style.visibility).toBe('visible');
        criticalButton.click();
        expect(document.querySelector('#angleSlider').value).toBeCloseTo(48.75, 2);
    });

    it('แสดงสถานะสะท้อนกลับหมดเมื่อมุมเกินมุมวิกฤต', () => {
        const slider = document.querySelector('#angleSlider');
        slider.value = '60';
        slider.dispatchEvent(new Event('input'));

        expect(document.querySelector('#labelT2').textContent).toBe('θ₂ (สะท้อน)');
        expect(document.querySelector('#statusLabel').textContent).toBe('สะท้อนกลับหมด');
        expect(document.querySelector('#resultText').textContent).toBe('60.00°');
    });
});
