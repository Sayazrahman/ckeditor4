function showPalette(paletteName) {
  document.querySelectorAll(".toolbar-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.querySelectorAll(".symbol-palette").forEach((palette) => {
    palette.classList.add("hidden");
  });

  const palette = document.getElementById("palette-" + paletteName);
  if (palette) {
    palette.classList.remove("hidden");
    event.target.classList.add("active");
  }

  requestAnimationFrame(() => {
    const field = document.getElementById("mathlive-editor");
    if (field) {
      field.focus();
    }
  });
}

/* ============================
   FONT CONTROLS
   ============================ */

function updateEditorFont() {
  const field = document.getElementById("mathlive-editor");
  const fontFamily = document.getElementById("font-family").value;
  const fontSize = document.getElementById("font-size").value;

  if (field) {
    field.style.fontSize = fontSize + "px";
    field.style.setProperty("--font-family", fontFamily);
    requestAnimationFrame(() => {
      field.focus();
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const fontFamilySelect = document.getElementById("font-family");
  const fontSizeSelect = document.getElementById("font-size");

  if (fontFamilySelect) {
    fontFamilySelect.addEventListener("change", updateEditorFont);
  }

  if (fontSizeSelect) {
    fontSizeSelect.addEventListener("change", updateEditorFont);
  }
});

function latexToMathML(latex) {
  try {
    if (!window.MathJax || !MathJax.tex2mml) {
      console.warn("MathJax not ready");
      return `<mtext>${latex}</mtext>`;
    }

    // Don't process the latex - let MathJax handle it as-is
    return MathJax.tex2mml(latex, {
      display: false,
      em: 16,
      ex: 8,
      containerWidth: 80 * 16,
    });
  } catch (e) {
    console.error("MathML conversion failed", e, latex);
    return `<mtext>${latex}</mtext>`;
  }
}
function createFallbackImage(latex, canvas, ctx) {
  const text = latex.length > 20 ? latex.substring(0, 20) + "..." : latex;

  ctx.font = "16px serif";
  const w = ctx.measureText(text).width;

  canvas.width = w + 20;
  canvas.height = 40;

  ctx.fillStyle = "#f8f9fa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#ccc";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
}
// Matrix Builder Functionality
let selectedMatrixRows = 2;
let selectedMatrixCols = 2;
let selectedMatrixType = "pmatrix";

function openMatrixDialog() {
  const dialog = document.getElementById("matrixDialog");
  dialog.style.display = "flex";
  initMatrixGridSelector();
}

function closeMatrixDialog() {
  const dialog = document.getElementById("matrixDialog");
  dialog.style.display = "none";
}

function initMatrixGridSelector() {
  const grid = document.getElementById("matrixGridSelector");
  grid.innerHTML = "";

  // Create 10×10 grid
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.className = "matrix-grid-cell";
    cell.dataset.row = Math.floor(i / 10) + 1;
    cell.dataset.col = (i % 10) + 1;
    grid.appendChild(cell);
  }

  // Handle hover
  grid.addEventListener("mouseover", handleMatrixGridHover);
  grid.addEventListener("click", handleMatrixGridClick);

  // Matrix type buttons
  document.querySelectorAll(".matrix-type-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".matrix-type-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      selectedMatrixType = this.dataset.type;
    });
  });

  // Manual input sync
  document
    .getElementById("matrixRows")
    .addEventListener("input", syncManualInput);
  document
    .getElementById("matrixCols")
    .addEventListener("input", syncManualInput);
}

function handleMatrixGridHover(e) {
  if (e.target.classList.contains("matrix-grid-cell")) {
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    const cells = document.querySelectorAll(".matrix-grid-cell");
    cells.forEach((cell) => {
      const cellRow = parseInt(cell.dataset.row);
      const cellCol = parseInt(cell.dataset.col);
      if (cellRow <= row && cellCol <= col) {
        cell.classList.add("selected");
      } else {
        cell.classList.remove("selected");
      }
    });

    selectedMatrixRows = row;
    selectedMatrixCols = col;
    document.getElementById("matrixSizeDisplay").textContent = `${row}×${col}`;
    document.getElementById("matrixRows").value = row;
    document.getElementById("matrixCols").value = col;
  }
}

function handleMatrixGridClick() {
  // User can click to confirm selection
  document.getElementById("matrixRows").value = selectedMatrixRows;
  document.getElementById("matrixCols").value = selectedMatrixCols;
}

function syncManualInput() {
  selectedMatrixRows =
    parseInt(document.getElementById("matrixRows").value) || 1;
  selectedMatrixCols =
    parseInt(document.getElementById("matrixCols").value) || 1;

  // Update grid display
  const cells = document.querySelectorAll(".matrix-grid-cell");
  cells.forEach((cell) => {
    const cellRow = parseInt(cell.dataset.row);
    const cellCol = parseInt(cell.dataset.col);
    if (cellRow <= selectedMatrixRows && cellCol <= selectedMatrixCols) {
      cell.classList.add("selected");
    } else {
      cell.classList.remove("selected");
    }
  });

  document.getElementById("matrixSizeDisplay").textContent =
    `${selectedMatrixRows}×${selectedMatrixCols}`;
}

function insertMatrixFromDialog() {
  const rows = selectedMatrixRows;
  const cols = selectedMatrixCols;
  const type = selectedMatrixType;

  let latex = `\\begin{${type}}`;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      latex += "#?";
      if (j < cols - 1) latex += "&";
    }
    if (i < rows - 1) latex += "\\\\";
  }

  latex += `\\end{${type}}`;

  const field = document.getElementById("mathlive-editor");
  if (field) {
    field.focus();
    field.insert(latex, { feedback: false, scrollIntoView: true });
    field.insert(latex, {
      selectionMode: "placeholder",
      feedback: false,
      scrollIntoView: true,
    });
    requestAnimationFrame(() => {
      field.focus();
    });
  }

  closeMatrixDialog();
}

document.addEventListener("click", function (e) {
  const dialog = document.getElementById("matrixDialog");
  if (e.target === dialog) {
    closeMatrixDialog();
  }
});

function insertMatrix(rows, cols, type) {
  const field = document.getElementById("mathlive-editor");
  if (!field) return;

  let latex = `\\begin{${type}}`;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      latex += "#?";
      if (j < cols - 1) latex += "&";
    }
    if (i < rows - 1) latex += "\\\\";
  }

  latex += `\\end{${type}}`;

  field.focus();
  field.insert(latex, { feedback: false, scrollIntoView: true });
  field.insert(latex, {
    selectionMode: "placeholder",
    feedback: false,
    scrollIntoView: true,
  });
  requestAnimationFrame(() => {
    field.focus();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initMatrixBuilder();
});

async function latexToPNG(latex) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!window.MathJax || !MathJax.tex2svg) {
        let attempts = 0;
        while ((!window.MathJax || !MathJax.tex2svg) && attempts < 30) {
          await new Promise((r) => setTimeout(r, 100));
          attempts++;
        }

        if (!window.MathJax || !MathJax.tex2svg) {
          return resolve(createFallbackPNG(latex));
        }
      }
      const svg = MathJax.tex2svg(latex);
      const svgElement = svg.querySelector("svg");

      if (!svgElement) {
        console.error("No SVG element generated");
        return resolve(createFallbackPNG(latex));
      }

      const bbox = svgElement.getBBox();
      const width = Math.max(bbox.width, 100);
      const height = Math.max(bbox.height, 40);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const scale = 4;

      canvas.width = (width + 40) * scale;
      canvas.height = (height + 40) * scale;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.scale(scale, scale);
        ctx.drawImage(img, 20, 20, width, height);

        const dataUrl = canvas.toDataURL("image/png");

        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };

      img.onerror = (err) => {
        console.error("Image load failed:", err);
        URL.revokeObjectURL(url);
        resolve(createFallbackPNG(latex));
      };

      img.src = url;
    } catch (error) {
      console.error("PNG generation failed:", error);
      resolve(createFallbackPNG(latex));
    }
  });
}

function createFallbackPNG(latex) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const fontSize = 20;
  ctx.font = `${fontSize}px Arial`;
  const text = latex.length > 30 ? latex.substring(0, 30) + "..." : latex;
  const metrics = ctx.measureText(text);
  const textWidth = metrics.width;

  canvas.width = textWidth + 40;
  canvas.height = fontSize + 30;

  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL("image/png");
}
async function renderCancelButton() {
  await window.MathJax.startup.promise;

  const cancelBtn = document.querySelector(
    '.symbol-btn[data-latex="\\\\cancel{#?}"]',
  );
  if (cancelBtn) {
    const svg = MathJax.tex2svg("\\cancel{\\square}", { display: false });
    const svgElement = svg.querySelector("svg");
    if (svgElement) {
      svgElement.style.height = "20px";
      svgElement.style.width = "auto";
      cancelBtn.innerHTML = "";
      cancelBtn.appendChild(svgElement);
    }
  }
}
function setupEvents() {
  const field = document.getElementById("mathlive-editor");
  const preview = document.getElementById("latex-preview");

  let isInteractingWithUI = false;
  let focusLockTimer = null;

  function lockFocus() {
    if (focusLockTimer) clearTimeout(focusLockTimer);
    focusLockTimer = setTimeout(() => {
      if (document.activeElement !== field && !isInteractingWithUI) {
        field.focus();
      }
    }, 100);
  }

  if (field) {
    field.addEventListener("focus", () => {
      console.log("Math field focused");
    });

    field.addEventListener("keydown", (e) => {
      if (e.key === " " || e.code === "Space") {
        e.stopPropagation();
        field.insert("\\; ");
      }

      if (e.key === "Backspace" || e.key === "Delete") {
        // Lock focus aggressively after deletion
        requestAnimationFrame(() => lockFocus());
        setTimeout(() => lockFocus(), 50);
        setTimeout(() => lockFocus(), 150);
        setTimeout(() => lockFocus(), 300);
      }
    });

    field.addEventListener("blur", (e) => {
      if (isInteractingWithUI) return;
      lockFocus();
    });

    setTimeout(() => {
      field.focus();
    }, 100);
  }

  // Track when user is interacting with toolbar/palette/dialog
  document.addEventListener(
    "mousedown",
    (e) => {
      const isUI =
        e.target.closest(".symbol-toolbar") ||
        e.target.closest(".symbol-palette") ||
        e.target.closest(".matrix-dialog") ||
        e.target.closest(".footer") ||
        e.target.tagName === "SELECT" ||
        e.target.tagName === "BUTTON";

      if (isUI) {
        isInteractingWithUI = true;
        setTimeout(() => {
          isInteractingWithUI = false;
        }, 500);
      }
    },
    true,
  );

  function updatePreview() {
    if (preview) {
      preview.textContent = field.getValue("latex") || "(empty)";
    }
  }

  if (field) {
    field.addEventListener("input", updatePreview);
  }

  document.addEventListener(
    "mousedown",
    (e) => {
      const btn = e.target.closest(".symbol-btn");
      if (btn) {
        e.preventDefault();
        e.stopPropagation();

        let latex = btn.getAttribute("data-latex");
        if (!latex) return;

        latex = latex.replace(/#@/g, "#0");
        latex = latex.replace(
          /\\iiiint/g,
          "\\int\\!\\!\\!\\int\\!\\!\\!\\int\\!\\!\\!\\int",
        );
        latex = latex.replace(/\\iiint/g, "\\int\\!\\!\\int\\!\\!\\int");
        latex = latex.replace(/\\oiiint/g, "\\oint\\!\\!\\oint\\!\\!\\oint");
        latex = latex.replace(/\\oiint/g, "\\oint\\!\\!\\oint");
        latex = latex.replace(/\\boxslash/g, "\\cancel{#?}");
        latex = latex.replace(/\\bigsqcap/g, "\\sqcap");
        latex = latex.replace(/\\bigsqcup/g, "\\sqcup");
        latex = latex.replace(/\\biguplus/g, "\\uplus");
        latex = latex.replace(/PRIME1/g, "'");
        latex = latex.replace(/PRIME2/g, "''");
        latex = latex.replace(/\\bigodot/g, "\\odot");
        latex = latex.replace(/\\bigotimes/g, "\\otimes");
        latex = latex.replace(/\\bigoplus/g, "\\oplus");
        latex = latex.replace(/\\bigwedge/g, "\\wedge");
        latex = latex.replace(/\\bigvee/g, "\\vee");
        latex = latex.replace(/\\bigcap/g, "\\cap");
        latex = latex.replace(/\\bigcup/g, "\\cup");
        latex = latex.replace(/\\arcsec/g, "\\mathrm{arcsec}");
        latex = latex.replace(/\\arccsc/g, "\\mathrm{arccsc}");
        latex = latex.replace(/\\arccot/g, "\\mathrm{arccot}");
        latex = latex.replace(/\\operatorname\{([^}]+)\}/g, "\\mathrm{$1}");
        latex = latex.replace(
          /\\updownarrows/g,
          "\\uparrow\\!\\!\\!\\downarrow",
        );
        latex = latex.replace(
          /\\downuparrows/g,
          "\\downarrow\\!\\!\\!\\uparrow",
        );
        latex = latex.replace(/\\mapsfrom/g, "\\leftarrow\\!\\!|");
        latex = latex.replace(/\\napprox/g, "\\not\\approx");
        latex = latex.replace(/\\iddots/g, "⋰");

        const mathField = document.getElementById("mathlive-editor");
        mathField.insert(latex);

        requestAnimationFrame(() => {
          mathField.focus();
        });
      }
    },
    true,
  );

  document.querySelectorAll(".export-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const type = btn.getAttribute("data-type");
      const latex = field.getValue("latex");
      if (!latex) return;

      if (type === "mathml") {
        const mathml = latexToMathML(latex);
        copyToClipboard(mathml, "MathML");
      }

      if (type === "svg") {
        try {
          const svg = MathJax.tex2svg(latex);
          const svgString = MathJax.startup.adaptor.outerHTML(svg);
          copyToClipboard(svgString, "SVG XML");
        } catch (e) {
          alert("SVG export failed: " + e.message);
        }
      }

      if (type === "png") {
        const png = await latexToPNG(latex);
        downloadImage(png, "formula.png");
      }
    });
  });

  const clearBtn = document.getElementById("math-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      field.setValue("");
      field.focus();
      updatePreview();
    });
  }
}
async function renderComplexButtons() {
  await window.MathJax.startup.promise;

  // List of buttons with complex formulas to render
  const complexButtons = [
    {
      selector: '[data-latex="\\\\int_{#@}^{#?} #? \\\\, d#?"]',
      latex: "\\int_a^b f(x)\\,dx",
    },
    {
      selector: '[data-latex="\\\\int #? \\\\, d#?"]',
      latex: "\\int f(x)\\,dx",
    },
    {
      selector: '[data-latex="\\\\iint #? \\\\, d#?"]',
      latex: "\\iint f\\,dx",
    },
    {
      selector: '[data-latex="\\\\iiint #? \\\\, d#?"]',
      latex: "\\iiint f\\,dx",
    },
    {
      selector: '[data-latex="\\\\oint #? \\\\, d#?"]',
      latex: "\\oint f\\,dx",
    },
    {
      selector: '[data-latex="\\\\iint_{#@}^{#?} #? \\\\, d#? \\\\, d#?"]',
      latex: "\\iint f\\,dx\\,dy",
    },
    {
      selector: '[data-latex="\\\\int #? \\\\, d#? \\\\, d#?"]',
      latex: "\\int f\\,dx\\,dy",
    },
    {
      selector: '[data-latex="\\\\iint_{#@}^{#?} #? \\\\, d#? \\\\, d#?"]',
      latex: "\\iint f\\,dx\\,dy",
    },
    {
      selector:
        '[data-latex="\\\\iiint_{#@}^{#?} #? \\\\, d#? \\\\, d#? \\\\, d#?"]',
      latex: "\\iiint f\\,dx\\,dy\\,dz",
    },
    {
      selector: '[data-latex="\\\\oint_{#@}^{#?} #? \\\\, d#? \\\\, d#?"]',
      latex: "\\oint f\\,dx\\,dy",
    },
  ];

  for (const btn of complexButtons) {
    const button = document.querySelector(`.symbol-btn${btn.selector}`);
    if (button) {
      const svg = MathJax.tex2svg(btn.latex, { display: false });
      const svgElement = svg.querySelector("svg");
      if (svgElement) {
        svgElement.style.height = "20px";
        svgElement.style.width = "auto";
        button.innerHTML = "";
        button.appendChild(svgElement);
      }
    }
  }
}

window.setInitialLatex = function (latex) {
  const field = document.getElementById("mathlive-editor");
  const preview = document.getElementById("latex-preview");

  latex = latex.replace(/\\square/g, "#?");

  if (field) {
    field.setValue(latex);

    setTimeout(() => {
      field.focus();

      field.executeCommand("moveToMathfieldEnd");
      field.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
      field.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    }, 300);
  }

  if (preview) {
    preview.textContent = latex;
  }
};

async function saveFormula() {
  try {
    var parentWin = window.opener || window.parent || window;
    const field = document.getElementById("mathlive-editor");
    if (!field) {
      alert("Math editor not found");
      return;
    }

    let latex = field.getValue("latex");
    latex = latex.replace(/\\degree/g, "^\\circ");
    latex = latex.replace(/\\bigsqcap/g, "\\sqcap");
    latex = latex.replace(/\\bigsqcup/g, "\\sqcup");
    latex = latex.replace(/\\differentialD/g, "d");
    latex = latex.replace(/\\varointclockwise/g, "∲");
    latex = latex.replace(/\\ointctrclockwise/g, "∳");
    latex = latex.replace(/\\diff/g, "d");
    latex = latex.replace(/\\mathrm\{d\}/g, "d");
    latex = latex.replace(/\\biguplus/g, "\\uplus");
    latex = latex.replace(/\\bigodot/g, "\\odot");
    latex = latex.replace(/\\bigotimes/g, "\\otimes");
    latex = latex.replace(/\\bigoplus/g, "\\oplus");
    latex = latex.replace(/\\bigwedge/g, "\\wedge");
    latex = latex.replace(/\\bigvee/g, "\\vee");
    latex = latex.replace(/\\bigcap/g, "\\cap");
    latex = latex.replace(/\\bigcup/g, "\\cup");
    latex = latex.replace(/\\mathrm\{arcsec\}/g, "\\arcsec");
    latex = latex.replace(/\\mathrm\{arccsc\}/g, "\\arccsc");
    latex = latex.replace(/\\mathrm\{arccot\}/g, "\\arccot");
    latex = latex.replace(/\\mathrm\{([^}]+)\}/g, "\\operatorname{$1}");
    // latex = latex.replace(/\\upharpoonleft/g, "\\mapsup");
    // latex = latex.replace(/\\downharpoonleft/g, "\\mapsdown");
    latex = latex.replace(/\\napprox/g, "\\not\\approx");
    latex = latex.replace(/\\iddots/g, "\\reflectbox{\\ddots}");
    latex = latex.replace(/PRIME1/g, "'");
    latex = latex.replace(/PRIME2/g, "''");
    latex = latex.replace(/\\doubleprime/g, "''");
    latex = latex.replace(/\\prime/g, "'");

    if (!latex || !latex.trim()) {
      alert("There is no equation to save.");
      return;
    }

    const latexWithEnclose = latex;
    let cleanLatex = latex.replace(
      /\\enclose\{updiagonalstrike\}\{([^}]+)\}/g,
      "\\cancel{$1}",
    );
    cleanLatex = cleanLatex.replace(/\\placeholder\{\}/g, "\\square");
    cleanLatex = cleanLatex.replace(/\\placeholder{}/g, "\\square");
    cleanLatex = cleanLatex.replace(/#\?/g, "\\square");
    cleanLatex = cleanLatex.replace(/#@/g, "\\square");

    let latexForMathML = latexWithEnclose;
    latexForMathML = latexForMathML.replace(/\\placeholder\{\}/g, "\\square");
    latexForMathML = latexForMathML.replace(/\\placeholder{}/g, "\\square");
    latexForMathML = latexForMathML.replace(/#\?/g, "\\square");
    latexForMathML = latexForMathML.replace(/#@/g, "\\square");

    const mathML = latexToMathML(latexForMathML);
    const encodedMathML = encodeURIComponent(mathML);

    // Detect CKEditor font size to render SVG at matching scale
    let editorFontSize = 16; // default fallback
    try {
      // Try to get font size from the parent window's editor content
      const parentBody = (
        window.opener || window.parent
      )?.document?.querySelector(
        '.ck-content, .cke_editable, [contenteditable="true"]',
      );
      if (parentBody) {
        const fs = parseFloat(window.getComputedStyle(parentBody).fontSize);
        if (fs && fs > 0) editorFontSize = fs;
      }
    } catch (e) {}
    // Render at 3x editor font size for sharpness, then scale down via CSS
    const renderEm = editorFontSize * 3;
    const renderEx = renderEm * 0.5;
    const mjxContainer = MathJax.tex2svg(cleanLatex, {
      display: false,
      em: renderEm,
      ex: renderEx,
      containerWidth: 1200,
    });
    const svgElement = mjxContainer.querySelector("svg");

    if (!svgElement) {
      alert("Failed to generate formula");
      return;
    }

    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.appendChild(mjxContainer);
    document.body.appendChild(tempDiv);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const globalDefs = document.querySelector("svg defs");
    if (globalDefs) {
      const clonedDefs = globalDefs.cloneNode(true);
      if (svgElement.firstChild) {
        svgElement.insertBefore(clonedDefs, svgElement.firstChild);
      } else {
        svgElement.appendChild(clonedDefs);
      }
    }

    const width = svgElement.getAttribute("width");
    const height = svgElement.getAttribute("height");

    // Convert ex units to px using the render scale
    const actualWidth = width
      ? parseFloat(width.replace("ex", "")) * renderEx
      : 30;
    const actualHeight = height
      ? parseFloat(height.replace("ex", "")) * renderEx
      : 30;

    document.body.removeChild(tempDiv);

    const padding = 4;
    const finalWidth = Math.ceil(actualWidth) + padding;
    const finalHeight = Math.ceil(actualHeight) + padding;

    // Preserve viewBox so SVG scales cleanly when CSS resizes the img
    if (!svgElement.getAttribute("viewBox")) {
      const vbWidth = svgElement.getAttribute("width") || finalWidth;
      const vbHeight = svgElement.getAttribute("height") || finalHeight;
      svgElement.setAttribute(
        "viewBox",
        `0 0 ${parseFloat(vbWidth)} ${parseFloat(vbHeight)}`,
      );
    }
    svgElement.setAttribute("width", finalWidth);
    svgElement.setAttribute("height", finalHeight);

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const imageData =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgString)));

    if (parentWin.iMathEQ_SaveImageResult) {
      const isMatrix =
        cleanLatex.includes("\\begin{") && cleanLatex.includes("matrix}");
      // height:1.8em makes the formula scale with the surrounding text font size
      const imgStyle = isMatrix
        ? "vertical-align: middle; height: auto; width: auto; max-height: 5.5em; border: none; padding: 2px; margin: 0px 2px; cursor: pointer; display: inline-block;"
        : `vertical-align: middle; height: ${Math.round(editorFontSize * 1.4)}px; width: auto; border: none; padding: 0px 2px; margin: 0px 2px; cursor: pointer; display: inline-block;`;

      parentWin.iMathEQ_SaveImageResult(
        `<img class="math-formula-img" contenteditable="true" alt="${cleanLatex}" data-imath-latex="${cleanLatex}" imatheq-mml="${encodedMathML}" src="${imageData}" style="${imgStyle}"/>`,
      );

      if (window.opener) {
        window.close();
      } else {
        field.setValue("");
        if (parentWin.imatheq_closeModalWindow) {
          parentWin.imatheq_closeModalWindow();
        }
      }
      return;
    }

    alert("Parent window communication not available.");
  } catch (err) {
    alert("Error: " + err.message);
  }
}
function cancelDialog() {
  const field = document.getElementById("mathlive-editor");
  field.setValue("");
  field.focus();

  if (window.parent && window.parent.closeMathDialog) {
    window.parent.closeMathDialog();
  }
}

function copyToClipboard(text, label) {
  navigator.clipboard
    .writeText(text)
    .then(() => alert(label + " copied to clipboard!"))
    .catch(() => {
      prompt("Copy " + label + ":", text);
    });
}

function downloadImage(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

document.addEventListener("DOMContentLoaded", function () {
  const mf = document.getElementById("mathlive-editor");
  if (!mf) return;

  const observer = new MutationObserver(function () {
    const keyboard = document.querySelector(".ML__keyboard.is-visible");

    if (keyboard) {
      document.body.classList.add("keyboard-active");
    } else {
      document.body.classList.remove("keyboard-active");
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    cancelDialog();
  } else if (e.key === "Enter" && e.ctrlKey) {
    saveFormula();
  }
});

window.addEventListener("load", () => {
  setupEvents();
  renderCancelButton();
  renderComplexButtons();

  setTimeout(() => {
    const field = document.getElementById("mathlive-editor");
    if (field) {
      field.focus();

      field.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
      field.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      field.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      console.log("MathLive field ready for input");
    }
  }, 500);
});
