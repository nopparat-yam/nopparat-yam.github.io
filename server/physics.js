export function validateIndex(raw) {
    const val = parseFloat(raw);
    if (Number.isNaN(val)) return 1.0;
    return Math.min(10.0, Math.max(1.0, val));
}

export function criticalAngle(n1, n2) {
    if (n1 <= n2) return null;
    return Math.asin(n2 / n1) * 180 / Math.PI;
}

export function refract(n1, n2, t1Deg) {
    const t1Rad = t1Deg * Math.PI / 180;
    const sinT2 = (n1 * Math.sin(t1Rad)) / n2;
    if (sinT2 > 1.0001) return { tir: true, t2Deg: t1Deg };
    return { tir: false, t2Deg: Math.asin(Math.min(1.0, sinT2)) * 180 / Math.PI };
}

export function angleFromPoint(x, y, cx, cy) {
    const deg = Math.atan2(cx - x, cy - y) * 180 / Math.PI;
    return Math.min(89.99, Math.max(0, deg));
}