const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const n1Select = document.getElementById("n1select");
const n2Select = document.getElementById("n2select");
const n1Input = document.getElementById("n1");
const n2Input = document.getElementById("n2");
const n1Custom = document.getElementById("n1custom");
const n2Custom = document.getElementById("n2custom");
const n1ValueSpan = document.getElementById("n1value");
const n2ValueSpan = document.getElementById("n2value");
const angleSlider = document.getElementById("angle");
const angleInput = document.getElementById("angleInput");
const resultDiv = document.getElementById("result");
const showAnglesCheckbox = document.getElementById("showAngles");
const controlsCenter = document.querySelector(".controls-center");

let holdTimer;

function holdButton(btn, callback) {
  if (!btn) return;
  btn.addEventListener("mousedown", () => {
    callback();
    holdTimer = setInterval(callback, 100);
  });
  btn.addEventListener("mouseup", () => clearInterval(holdTimer));
  btn.addEventListener("mouseleave", () => clearInterval(holdTimer));
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    callback();
    holdTimer = setInterval(callback, 100);
  });
  btn.addEventListener("touchend", () => clearInterval(holdTimer));
}

holdButton(document.getElementById("n1plus"), () => changeN1(0.01));
holdButton(document.getElementById("n1minus"), () => changeN1(-0.01));
holdButton(document.getElementById("n2plus"), () => changeN2(0.01));
holdButton(document.getElementById("n2minus"), () => changeN2(-0.01));

function changeN1(d) {
  let current = parseFloat(n1Input.value);
  if (isNaN(current)) current = 0;
  n1Input.value = Math.max(0, current + d).toFixed(2);
  updateDisplayedValues();
  draw();
}

function changeN2(d) {
  let current = parseFloat(n2Input.value);
  if (isNaN(current)) current = 0;
  n2Input.value = Math.max(0, current + d).toFixed(2);
  updateDisplayedValues();
  draw();
}

function validateInput(input) {
  let v = parseFloat(input.value);
  if (input.value.trim() === "" || isNaN(v) || v < 0) {
    input.value = 0;
  }
  draw();
}

function drawArc(cx, cy, r, start, end, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, end);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawLabel(x, y, text, color) {
  const padding = 4;
  ctx.font = "16px Arial";
  const metrics = ctx.measureText(text);
  const w = metrics.width + padding * 2;
  const h = 16 + padding * 2;
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.fillRect(x - w / 2, y - h / 2, w, h);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function getNValue(selectElem, inputElem) {
  if (!selectElem) return parseFloat(inputElem.value) || 0;
  if (selectElem.value === "custom") return parseFloat(inputElem.value) || 0;
  return parseFloat(selectElem.value) || 0;
}

function updateDisplayedValues() {
  if (n1ValueSpan) n1ValueSpan.textContent = (getNValue(n1Select, n1Input) || 0).toFixed(4);
  if (n2ValueSpan) n2ValueSpan.textContent = (getNValue(n2Select, n2Input) || 0).toFixed(4);
}

function draw() {
  const n1 = getNValue(n1Select, n1Input);
  const n2 = getNValue(n2Select, n2Input);

  let theta1Deg = parseFloat(angleSlider.value);
  if (!isFinite(theta1Deg)) theta1Deg = 0;

  let criticalAngleDeg = null;
  if (n1 > n2 && n1 > 0 && n2 > 0) {
    const ratio = n2 / n1;
    if (ratio <= 1) {
      criticalAngleDeg = (Math.asin(ratio) * 180) / Math.PI;
    }
  }

  theta1Deg = Math.round(theta1Deg * 100) / 100;

  if (criticalAngleDeg !== null) {
    const snapTolerance = 0.1;
    if (Math.abs(theta1Deg - criticalAngleDeg) < snapTolerance) {
      theta1Deg = criticalAngleDeg;
      angleSlider.value = criticalAngleDeg.toFixed(2);
    }
  }

  const theta1 = (theta1Deg * Math.PI) / 180;

  if (angleInput) angleInput.value = theta1Deg.toFixed(2);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  const centerX = displayWidth / 2;
  const centerY = displayHeight / 2;
  const length = Math.max(120, Math.min(displayWidth, displayHeight) * 0.45);

  function clampPoint(x, y) {
    return {
      x: Math.max(0, Math.min(displayWidth, x)),
      y: Math.max(0, Math.min(displayHeight, y)),
    };
  }

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  ctx.lineTo(canvas.width, centerY);
  ctx.stroke();

  const labelFontSize = displayWidth < 500 ? 14 : 18;
  ctx.font = `${labelFontSize}px Arial`;
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const n1Label = n1Select.options[n1Select.selectedIndex]?.text || "";
  const n2Label = n2Select.options[n2Select.selectedIndex]?.text || "";
  const labelMarginX = 8;
  const labelMarginY = 6;
  ctx.fillText(`ตัวกลางที่ 1 : ${n1Label}`, labelMarginX, labelMarginY);
  ctx.textBaseline = "bottom";
  ctx.fillText(`ตัวกลางที่ 2 : ${n2Label}`, labelMarginX, displayHeight - labelMarginY);

  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(centerX, 0);
  ctx.lineTo(centerX, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);

  const x1 = centerX - length * Math.sin(theta1);
  const y1 = centerY - length * Math.cos(theta1);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(centerX, centerY);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.stroke();

  const xOffset = -20;
  const mid1 = -Math.PI / 2 - theta1 / 2;
  let labelRadius = 60;
  if (showAnglesCheckbox.checked) {
    drawArc(centerX, centerY, 40, -Math.PI / 2 - theta1, -Math.PI / 2, "red");
    const lx1 = centerX + labelRadius * Math.cos(mid1) + xOffset;
    const ly1 = centerY + labelRadius * Math.sin(mid1);
    ctx.fillStyle = "red";
    ctx.font = "16px Arial";
    drawLabel(lx1, ly1, `${theta1Deg.toFixed(2)}°`, "red");
  }

  const sinTheta2 = (n1 / n2) * Math.sin(theta1);

  let resultHTML = "";

  if (Math.abs(sinTheta2) <= 1) {
    const theta2 = Math.asin(sinTheta2);
    const theta2Deg = (theta2 * 180) / Math.PI;
    if (criticalAngleDeg !== null && Math.abs(theta1Deg - criticalAngleDeg) < 0.05) {
      resultHTML += `<div class="warning">มุมวิกฤต ≈ ${criticalAngleDeg.toFixed(2)}°</div>`;
    } else {
      resultHTML += `<div class="warning"> </div>`;
    }
    resultHTML += `มุมหักเห = ${theta2Deg.toFixed(2)}°<br>`;

    let x2 = centerX + length * Math.sin(theta2);
    let y2 = centerY + length * Math.cos(theta2);
    ({ x: x2, y: y2 } = clampPoint(x2, y2));

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "blue";
    ctx.stroke();

    if (showAnglesCheckbox.checked) {
      drawArc(centerX, centerY, 40, Math.PI / 2 - theta2, Math.PI / 2, "blue");
      const mid2 = Math.PI / 2 - theta2 / 2;
      const lx2 = centerX + labelRadius * Math.cos(mid2) + xOffset;
      const ly2 = centerY + labelRadius * Math.sin(mid2);
      ctx.fillStyle = "blue";
      ctx.font = "16px Arial";
      drawLabel(lx2, ly2, `${theta2Deg.toFixed(2)}°`, "blue");
    }
  } else {
    let x2 = centerX + length * Math.sin(theta1);
    let y2 = centerY - length * Math.cos(theta1);
    ({ x: x2, y: y2 } = clampPoint(x2, y2));

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "green";
    ctx.stroke();

    if (showAnglesCheckbox.checked) {
      drawArc(centerX, centerY, 40, -Math.PI / 2, -Math.PI / 2 + theta1, "green");
      const midR = -Math.PI / 2 + theta1 / 2;
      const lxR = centerX + labelRadius * Math.cos(midR) + xOffset;
      const lyR = centerY + labelRadius * Math.sin(midR);
      ctx.fillStyle = "green";
      ctx.font = "16px Arial";
      drawLabel(lxR, lyR, `${theta1Deg.toFixed(2)}°`, "green");
    }

    resultHTML += `<div class="warning">เกิดการสะท้อนกลับหมด</div>`;
    resultHTML += `มุมสะท้อน = ${theta1Deg.toFixed(2)}°<br>`;
  }

  resultDiv.innerHTML = resultHTML;
}

angleSlider.oninput = () => {
  let v = parseFloat(angleSlider.value);
  if (!isFinite(v)) v = 0;
  if (v < 0) v = 0;
  if (v > 89) v = 89;
  angleSlider.value = v.toFixed(2);
  if (angleInput) angleInput.value = v.toFixed(2);
  draw();
};

function applyAngleInput() {
  if (!angleInput) return;
  let v = parseFloat(angleInput.value);
  if (isNaN(v)) v = 0;
  if (v < 0) v = 0;
  if (v > 89) v = 89;
  v = Math.round(v * 100) / 100;
  angleInput.value = v.toFixed(2);
  angleSlider.value = v.toFixed(2);
  draw();
}

if (angleInput) {
  angleInput.addEventListener("blur", applyAngleInput);
  angleInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyAngleInput();
    }
  });
}

showAnglesCheckbox.addEventListener("change", draw);
n1Input.addEventListener("blur", () => validateInput(n1Input));
n2Input.addEventListener("blur", () => validateInput(n2Input));

function updateCustomVisibility(selectElem, customElem, inputElem, valueElem) {
  if (selectElem.value === "custom") {
    customElem.classList.remove("hidden");
    if (valueElem) valueElem.classList.add("hidden");
    inputElem.disabled = false;
  } else {
    customElem.classList.add("hidden");
    if (valueElem) valueElem.classList.remove("hidden");
    inputElem.disabled = true;
    inputElem.value = parseFloat(selectElem.value).toFixed(2);
  }
  updateDisplayedValues();
  draw();
}

n1Select.addEventListener("change", () => {
  updateCustomVisibility(n1Select, n1Custom, n1Input, n1ValueSpan);
});
n2Select.addEventListener("change", () => {
  updateCustomVisibility(n2Select, n2Custom, n2Input, n2ValueSpan);
});

n1Input.addEventListener("input", () => {
  updateDisplayedValues();
  draw();
});
n2Input.addEventListener("input", () => {
  updateDisplayedValues();
  draw();
});

updateCustomVisibility(n1Select, n1Custom, n1Input, n1ValueSpan);
updateCustomVisibility(n2Select, n2Custom, n2Input, n2ValueSpan);
updateDisplayedValues();

function resizeCanvas() {
  const containerWidth = Math.min(document.querySelector(".container").clientWidth, 900);
  const aspect = 600 / 400;
  const displayWidth = Math.max(280, containerWidth * 0.98);
  const displayHeight = Math.round(displayWidth / aspect);
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = displayWidth + "px";
  canvas.style.height = displayHeight + "px";
  canvas.width = Math.floor(displayWidth * dpr);
  canvas.height = Math.floor(displayHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (controlsCenter) {
    if (window.innerWidth >= 900) {
      const indicesElem = document.querySelector(".indices");
      const gapValue = parseFloat(getComputedStyle(indicesElem).gap) || 18;
      const canvasRendered = Math.round(canvas.getBoundingClientRect().width) || displayWidth;
      let targetTotal = canvasRendered;
      const minPerBlock = 260;
      const minTotal = minPerBlock * 2 + gapValue;
      if (minTotal > targetTotal) targetTotal = minTotal;

      controlsCenter.style.width = Math.round(targetTotal) + "px";
      controlsCenter.style.margin = "12px auto";
      controlsCenter.style.boxSizing = "border-box";

      const indices = document.querySelector(".indices");
      if (indices) indices.style.width = Math.round(targetTotal) + "px";
    } else {
      controlsCenter.style.width = "";
      controlsCenter.style.margin = "";
      controlsCenter.style.boxSizing = "";
    }
  }

  const indices = document.querySelector(".indices");
  const blocks = document.querySelectorAll(".index-block");
  if (indices && blocks.length >= 2) {
    if (window.innerWidth >= 900) {
      const canvasRendered =
        Math.round(canvas.getBoundingClientRect().width) ||
        parseFloat(canvas.style.width) ||
        indices.clientWidth;
      indices.style.width = canvasRendered + "px";
      indices.style.margin = "0 auto";
      const gapValue = parseFloat(getComputedStyle(indices).gap) || 18;
      const totalW = canvasRendered;
      const perBlock = Math.max(260, (totalW - gapValue) / 2);
      blocks.forEach((b) => {
        b.style.width = Math.round(perBlock) + "px";
        b.style.boxSizing = "border-box";
      });
    } else {
      indices.style.width = "";
      blocks.forEach((b) => {
        b.style.width = "";
        b.style.boxSizing = "";
      });
    }
  }

  if (angleSlider) {
    const sliderWidth = Math.round(displayWidth * 0.72);
    angleSlider.style.width = sliderWidth + "px";
  }

  const angleBlock = document.getElementById("angleBlockBelow");
  if (angleBlock && window.innerWidth >= 900) {
    const canvasRendered = Math.round(canvas.getBoundingClientRect().width);
    angleBlock.style.width = canvasRendered + "px";
    angleBlock.style.margin = "20px auto 8px";
    angleBlock.style.boxSizing = "border-box";
  } else if (angleBlock) {
    angleBlock.style.width = "";
    angleBlock.style.margin = "";
    angleBlock.style.boxSizing = "";
  }

  draw();
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("orientationchange", resizeCanvas);

resizeCanvas();

