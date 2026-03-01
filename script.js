document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('mainCanvas');
    const ctx = canvas.getContext('2d');
    const n1Sel = document.getElementById('n1select'), n2Sel = document.getElementById('n2select');
    const n1Inp = document.getElementById('n1input'), n2Inp = document.getElementById('n2input');
    const slider = document.getElementById('angleSlider'), angleText = document.getElementById('angleText');
    const resultText = document.getElementById('resultText'), critBtn = document.getElementById('criticalBtn');
    const showValCheck = document.getElementById('showValues'), badgeStatus = document.getElementById('badgeStatus');
    const statusLabel = document.getElementById('statusLabel');
    const labelT2 = document.getElementById('labelT2');

    let criticalAngle = null;
    let isDragging = false;
    let holdTimer;

    const COLORS = {
        INCIDENT: '#ef4444',
        REFRACTION: '#3b82f6',
        CRITICAL: '#f59e0b',
        TIR: '#10b981'
    };

    function validateIndex(input) {
        let val = parseFloat(input.value);
        return isNaN(val) ? 1.0 : Math.min(10.0, Math.max(1.0, val));
    }

    function handleCanvasInteract(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left, y = clientY - rect.top;
        const cx = rect.width / 2, cy = rect.height / 2;
        if (y < cy) {
            const angleDeg = Math.atan2(cx - x, cy - y) * 180 / Math.PI;
            slider.value = Math.min(89.99, Math.max(0, angleDeg));
            updatePhysics();
        }
    }

    canvas.addEventListener('mousedown', (e) => { isDragging = true; handleCanvasInteract(e); });
    window.addEventListener('mousemove', (e) => { if (isDragging) handleCanvasInteract(e); });
    window.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('touchstart', (e) => { isDragging = true; handleCanvasInteract(e); }, { passive: false });
    canvas.addEventListener('touchmove', (e) => { if (isDragging) { if (e.cancelable) e.preventDefault(); handleCanvasInteract(e); } }, { passive: false });
    canvas.addEventListener('touchend', () => isDragging = false);

    function updatePhysics() {
        const n1 = validateIndex(n1Inp), n2 = validateIndex(n2Inp);
        let t1Deg = parseFloat(slider.value);

        if (n1 > n2) {
            criticalAngle = Math.asin(n2 / n1) * 180 / Math.PI;
            critBtn.style.visibility = 'visible';
            critBtn.textContent = `มุมวิกฤต: ${criticalAngle.toFixed(2)}°`;
            if (Math.abs(t1Deg - criticalAngle) < 0.3) {
                t1Deg = criticalAngle;
                slider.value = t1Deg;
            }
        } else {
            criticalAngle = null;
            critBtn.style.visibility = 'hidden';
        }
        angleText.value = t1Deg.toFixed(2);
        draw(n1, n2, t1Deg);
    }

    function draw(n1, n2, t1Deg) {
        const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2, r = 210;
        ctx.clearRect(0, 0, w, h);

        ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, w, cy);
        ctx.fillStyle = '#eef3f7'; ctx.fillRect(0, cy, w, cy);

        ctx.font = 'bold 12px Sarabun'; ctx.textAlign = 'left';
        const n1Name = n1Sel.options[n1Sel.selectedIndex].text.split(' ')[0];
        const n2Name = n2Sel.options[n2Sel.selectedIndex].text.split(' ')[0];
        ctx.fillStyle = '#64748b'; ctx.fillText(`ตัวกลาง 1: ${n1Name} (n ≈ ${n1.toFixed(3)})`, 20, 25);
        ctx.fillText(`ตัวกลาง 2: ${n2Name} (n ≈ ${n2.toFixed(3)})`, 20, h - 15);

        ctx.beginPath(); ctx.strokeStyle = '#cbd5e1'; ctx.setLineDash([6, 6]); ctx.lineWidth = 1;
        ctx.moveTo(cx, 10); ctx.lineTo(cx, h - 10); ctx.stroke(); ctx.setLineDash([]);
        ctx.beginPath(); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 2;
        ctx.moveTo(40, cy); ctx.lineTo(w - 40, cy); ctx.stroke();

        const t1Rad = t1Deg * Math.PI / 180;
        const sinT2 = (n1 * Math.sin(t1Rad)) / n2;

        drawRay(cx - r * Math.sin(t1Rad), cy - r * Math.cos(t1Rad), cx, cy, COLORS.INCIDENT, 3);

        let isTIR = sinT2 > 1.0001;
        let isCrit = criticalAngle && Math.abs(t1Deg - criticalAngle) < 0.05;

        if (isTIR) {
            const activeColor = COLORS.TIR;
            drawRay(cx, cy, cx + r * Math.sin(t1Rad), cy - r * Math.cos(t1Rad), activeColor, 3);

            labelT2.textContent = "θ₂ (สะท้อน)";
            resultText.className = "text-2xl font-bold text-emerald-600";
            resultText.innerHTML = `${t1Deg.toFixed(2)}°`;

            badgeStatus.textContent = "Total internal reflection";
            badgeStatus.className = "px-4 py-1.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-md";
            statusLabel.textContent = "สะท้อนกลับหมด";

            if (showValCheck.checked) {
                ctx.beginPath(); ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)'; ctx.lineWidth = 3;
                ctx.arc(cx, cy, 55, -Math.PI / 2, -Math.PI / 2 + t1Rad, false); ctx.stroke();
                drawTextHalo(`${t1Deg.toFixed(2)}°`, cx + 85 * Math.sin(t1Rad / 2), cy - 85 * Math.cos(t1Rad / 2), activeColor);
            }
        } else {
            const t2Rad = Math.asin(Math.min(1.0, sinT2));
            const t2Deg = t2Rad * 180 / Math.PI;

            const activeColor = isCrit ? COLORS.CRITICAL : COLORS.REFRACTION;
            const activeTailwindClass = isCrit ? 'text-amber-600' : 'text-blue-700';
            const activeBgClass = isCrit ? 'bg-amber-500 text-white shadow-md' : 'bg-blue-600 text-white shadow-md';

            drawRay(cx, cy, cx + r * Math.sin(t2Rad), cy + r * Math.cos(t2Rad), activeColor, 3);

            labelT2.textContent = "θ₂ (หักเห)";
            resultText.className = "text-2xl font-bold " + activeTailwindClass;
            resultText.innerHTML = `${t2Deg.toFixed(2)}°`;

            badgeStatus.textContent = isCrit ? "Critical angle" : "Refraction";
            badgeStatus.className = "px-4 py-1.5 rounded-full text-xs font-black " + activeBgClass;
            statusLabel.textContent = isCrit ? "มุมวิกฤตพอดี" : "การหักเหปกติ";

            if (showValCheck.checked && t2Deg > 0.5) {
                const arcColor = isCrit ? 'rgba(245, 158, 11, 0.4)' : 'rgba(59, 130, 246, 0.3)';
                ctx.beginPath(); ctx.strokeStyle = arcColor; ctx.lineWidth = 3;
                ctx.arc(cx, cy, 55, Math.PI / 2, Math.PI / 2 - t2Rad, true); ctx.stroke();
                drawTextHalo(`${t2Deg.toFixed(2)}°`, cx + 85 * Math.sin(t2Rad / 2), cy + 85 * Math.cos(t2Rad / 2), activeColor);
            }
        }

        if (showValCheck.checked && t1Deg > 0.5) {
            ctx.beginPath(); ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'; ctx.lineWidth = 3;
            ctx.arc(cx, cy, 55, -Math.PI / 2, -Math.PI / 2 - t1Rad, true); ctx.stroke();
            drawTextHalo(`${t1Deg.toFixed(2)}°`, cx - 85 * Math.sin(t1Rad / 2), cy - 85 * Math.cos(t1Rad / 2), COLORS.INCIDENT);
        }
    }

    function drawRay(x1, y1, x2, y2, color, width) {
        ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();

        const angle = Math.atan2(y2 - y1, x2 - x1);
        ctx.beginPath(); ctx.fillStyle = color;
        const arrowSize = 12;
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - arrowSize * Math.cos(angle - 0.4), y2 - arrowSize * Math.sin(angle - 0.4));
        ctx.lineTo(x2 - arrowSize * Math.cos(angle + 0.4), y2 - arrowSize * Math.sin(angle + 0.4));
        ctx.fill();
    }

    function drawTextHalo(text, x, y, color) {
        ctx.save();
        // กำหนดฟอนต์ในฟังก์ชันวาดข้อความด้วย
        ctx.font = 'bold 14px Sarabun';
        ctx.textAlign = 'center';
        ctx.shadowColor = "white"; ctx.shadowBlur = 6;
        ctx.strokeStyle = "rgba(255, 255, 255, 1)"; ctx.lineWidth = 4;
        ctx.strokeText(text, x, y);
        ctx.fillStyle = color; ctx.fillText(text, x, y);
        ctx.restore();
    }

    function setupHold(id, input, delta) {
        const btn = document.getElementById(id);
        const run = () => {
            input.value = (parseFloat(input.value) + delta).toFixed(3);
            if (input == n1Inp)
                n1Sel.value = 'custom';
            if (input == n2Inp)
                n2Sel.value = 'custom';
            updatePhysics();
        };
        btn.onmousedown = () => { run(); holdTimer = setInterval(run, 100); };
        btn.onmouseup = btn.onmouseleave = () => clearInterval(holdTimer);
        btn.ontouchstart = (e) => { e.preventDefault(); run(); holdTimer = setInterval(run, 100); };
        btn.ontouchend = () => clearInterval(holdTimer);
    }

    setupHold('n1minus', n1Inp, -0.01); setupHold('n1plus', n1Inp, 0.01);
    setupHold('n2minus', n2Inp, -0.01); setupHold('n2plus', n2Inp, 0.01);

    n1Sel.onchange = () => { if (n1Sel.value !== 'custom') n1Inp.value = n1Sel.value; updatePhysics(); };
    n2Sel.onchange = () => { if (n2Sel.value !== 'custom') n2Inp.value = n2Sel.value; updatePhysics(); };
    n1Inp.oninput = n2Inp.oninput = updatePhysics;
    slider.oninput = updatePhysics;
    angleText.onchange = () => { slider.value = angleText.value; updatePhysics(); };
    critBtn.onclick = () => { if (criticalAngle) { slider.value = criticalAngle; updatePhysics(); } };
    showValCheck.onchange = updatePhysics;

    // รอโหลดฟอนต์ให้เสร็จก่อนวาดครั้งแรกเพื่อความแม่นยำ
    document.fonts.ready.then(() => {
        updatePhysics();
    });
});