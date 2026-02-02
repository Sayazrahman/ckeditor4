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
    // MathLive uses CSS variables for font settings
    field.style.setProperty("--font-family", fontFamily);
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
       let processedLatex = latex;

       // Ensure MathJax recognizes these commands
       processedLatex = processedLatex.replace(
         /\\mathbb\{([A-Z])\}/g,
         "\\mathbb{$1}",
       );
       processedLatex = processedLatex.replace(
         /\\mathcal\{([A-Z])\}/g,
         "\\mathcal{$1}",
       );
       processedLatex = processedLatex.replace(
         /\\mathfrak\{([A-Z])\}/g,
         "\\mathfrak{$1}",
       );
    if (window.MathJax && MathJax.tex2mml) {
return MathJax.tex2mml(processedLatex);
    }
  } catch (e) {
    console.warn("MathML conversion failed", e);
  }
  return `<mtext>${latex}</mtext>`;
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
    field.insert(latex);
  }

  closeMatrixDialog();
}

// Close dialog on outside click
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
  field.insert(latex);
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  initMatrixBuilder();
  setupEvents(); // Your existing setup
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

function setupEvents() {
  const field = document.getElementById("mathlive-editor");
  const preview = document.getElementById("latex-preview");

  function updatePreview() {
    if (preview) {
      preview.textContent = field.getValue("latex") || "(empty)";
    }
  }
  field.addEventListener("input", updatePreview);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".symbol-btn");
    if (btn) {
      let latex = btn.getAttribute("data-latex");
      if (!latex) return;
      latex = latex.replace(/#@/g, "#0");
      latex = latex.replace(
        /\\iiiint/g,
        "\\int\\!\\!\\!\\int\\!\\!\\!\\int\\!\\!\\!\\int",
        );
        latex = latex.replace(/\\mathbb\{([A-Z])\}/g, "\\mathbb{$1}");
        latex = latex.replace(/\\mathcal\{([A-Z])\}/g, "\\mathcal{$1}");
        latex = latex.replace(/\\mathfrak\{([A-Z])\}/g, "\\mathfrak{$1}");
      latex = latex.replace(/\\iiint/g, "\\int\\!\\!\\int\\!\\!\\int");
      latex = latex.replace(/\\iint/g, "\\int\\!\\!\\int");
      latex = latex.replace(/\\oiiint/g, "\\oint\\!\\!\\oint\\!\\!\\oint");
      latex = latex.replace(/\\oiint/g, "\\oint\\!\\!\\oint");
      latex = latex.replace(/\\varointclockwise/g, "\\oint");
      latex = latex.replace(/\\ointctrclockwise/g, "\\oint");
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
      latex = latex.replace(/\\updownarrows/g, "\\uparrow\\!\\!\\!\\downarrow");
      latex = latex.replace(/\\downuparrows/g, "\\downarrow\\!\\!\\!\\uparrow");
      latex = latex.replace(/\\mapsfrom/g, "\\leftarrow\\!\\!|");
      latex = latex.replace(/\\mapsup/g, "\\upharpoonleft");
      latex = latex.replace(/\\mapsdown/g, "\\downharpoonleft");
      latex = latex.replace(/\\napprox/g, "\\not\\approx");
      latex = latex.replace(/\\iddots/g, "⋰");
      field.focus();
      field.insert(latex);
    }
  });

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
      updatePreview();
    });
  }
}

window.setInitialLatex = function (latex) {
  const field = document.getElementById("mathlive-editor");
  const preview = document.getElementById("latex-preview");

  latex = latex.replace(/\\square/g, "#?");

  if (field) {
    field.setValue(latex);
    field.focus();
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
      latex = latex.replace(/\\mathbb\{([A-Z])\}/g, "\\mathbb{$1}");
      latex = latex.replace(/\\mathcal\{([A-Z])\}/g, "\\mathcal{$1}");
      latex = latex.replace(/\\mathfrak\{([A-Z])\}/g, "\\mathfrak{$1}");
    latex = latex.replace(/\\bigsqcap/g, "\\sqcap");
    latex = latex.replace(/\\bigsqcup/g, "\\sqcup");
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
    latex = latex.replace(/\\upharpoonleft/g, "\\mapsup");
    latex = latex.replace(/\\downharpoonleft/g, "\\mapsdown");
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

    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.visibility = "hidden";
    tempContainer.style.display = "inline-block";
    tempContainer.style.fontSize = "";
    tempContainer.style.maxWidth = "none";
    tempContainer.style.whiteSpace = "nowrap";
    tempContainer.innerHTML = `<math xmlns="http://www.w3.org/1998/Math/MathML">${mathML}</math>`;
    document.body.appendChild(tempContainer);

    await new Promise((resolve) => setTimeout(resolve, 100));

    if (window.MathJax && MathJax.typesetPromise) {
      try {
        await MathJax.typesetPromise([tempContainer]);
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (e) {
        console.warn("MathJax typeset failed", e);
      }
    }

    const rect = tempContainer.getBoundingClientRect();
    const mathElement = tempContainer.querySelector("math");
    const mathRect = mathElement ? mathElement.getBoundingClientRect() : rect;

    const measuredWidth = Math.max(
      rect.width,
      mathRect.width,
      tempContainer.scrollWidth,
      tempContainer.offsetWidth,
    );
    const measuredHeight = Math.max(
      rect.height,
      mathRect.height,
      tempContainer.scrollHeight,
      tempContainer.offsetHeight,
    );

    const isMatrix =
      cleanLatex.includes("\\begin{matrix}") ||
      cleanLatex.includes("\\begin{pmatrix}") ||
      cleanLatex.includes("\\begin{bmatrix}") ||
      cleanLatex.includes("\\begin{Bmatrix}") ||
      cleanLatex.includes("\\begin{vmatrix}") ||
      cleanLatex.includes("\\begin{Vmatrix}");

    const padding = isMatrix ? 40 : 8;
    const minWidth = isMatrix ? 60 : 0;
    const minHeight = isMatrix ? 40 : 0;

    const actualWidth = Math.max(Math.ceil(measuredWidth) + padding, minWidth);
    const actualHeight = Math.max(
      Math.ceil(measuredHeight) + padding,
      minHeight,
    );

    document.body.removeChild(tempContainer);

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${actualWidth}" height="${actualHeight}" viewBox="0 0 ${actualWidth} ${actualHeight}">
  <foreignObject x="0" y="0" width="100%" height="100%">
    <math xmlns="http://www.w3.org/1998/Math/MathML">${mathML}</math>
  </foreignObject>
</svg>`;

    const imageData =
      "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));

    if (parentWin.iMathEQ_SaveImageResult) {
      parentWin.iMathEQ_SaveImageResult(
        `<img class="math-formula-img" contenteditable="true" alt="${cleanLatex}" data-imath-latex="${cleanLatex}" imatheq-mml="${encodedMathML}" src="${imageData}" style="vertical-align: middle; height: ${actualHeight}px; width: ${actualWidth}px; border: none; padding: 2px; margin: 0px 2px; cursor: pointer; display: inline-block;"/>`,
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

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    cancelDialog();
  } else if (e.key === "Enter" && e.ctrlKey) {
    saveFormula();
  }
});

window.addEventListener("load", () => {
  setupEvents();
});
