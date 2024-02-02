
const canvas = document.querySelector("canvas"),
  toolBtns = document.querySelectorAll(".tool"),
  fillColor = document.querySelector("#fill-color"),
  sizeSlider = document.querySelector("#size-slider"),
  colorBtns = document.querySelectorAll(".colors .option"),
  colorPicker = document.querySelector("#color-picker"),
  clearCanvas = document.querySelector(".clear-canvas"),
  saveImg = document.querySelector(".save-img"),
  exportSvgBtn = document.querySelector(".export-svg-button"),
  figuresListContainer = document.getElementById("figure-list-container"),
  ctx = canvas.getContext("2d");
let prevMouseX, prevMouseY, snapshot,
  isDrawing = false,
  selectedTool = "brush",
  brushWidth = 5,
  selectedColor = "#000";
let figuresList = [];
let selectedFigureIndex = -1;
const setCanvasBackground = () => {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
};
window.addEventListener("load", () => {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  setCanvasBackground();
});
const drawRect = (properties) => {
    if (fillColor.checked) {
        ctx.fillStyle = colorPicker.value; // Actualizați culoarea umplerii
        ctx.fillRect(properties.x, properties.y, properties.width, properties.height);
    } else {
        ctx.strokeStyle = colorPicker.value; // Actualizați culoarea conturului
        ctx.strokeRect(properties.x, properties.y, properties.width, properties.height);
    }
};
const getSelectedFigure = (x, y) => {
    return figuresList.find((figure) => {
      return (
        x >= figure.properties.x &&
        x <= figure.properties.x + figure.properties.width &&
        y >= figure.properties.y &&
        y <= figure.properties.y + figure.properties.height
      );
    });
  };
  const drawEllipse = (properties) => {
    ctx.beginPath();
    let radiusX = Math.abs(properties.width) / 2;
    let radiusY = Math.abs(properties.height) / 2;
    let centerX = properties.x + radiusX;
    let centerY = properties.y + radiusY;
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

    if (fillColor.checked) {
        ctx.fillStyle = colorPicker.value; // Actualizați culoarea umplerii
        ctx.fill();
    } else {
        ctx.strokeStyle = colorPicker.value; // Actualizați culoarea conturului
        ctx.stroke();
    }
};
const drawLinie = (properties) => {
  ctx.beginPath();
  ctx.moveTo(properties.x, properties.y);
  ctx.lineTo(properties.x + properties.width, properties.y + properties.height);
  ctx.closePath();
  ctx.stroke();
};
const changeCanvasBackground = () => {
  ctx.fillStyle = colorPicker.value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

};
const canvasHistory = [];
// ...
// ...
let isResizing = false;
let isDragging = false;
let startX, startY;
// ...
const startDraw = (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
  
    // Verificați dacă faceți clic pe o figură existentă pentru redimensionare
    const selectedFigure = getSelectedFigure(mouseX, mouseY);
    if (selectedFigure) {
      isResizing = true;
      isDrawing = false;
      isDragging = true;
      startX = mouseX;
      startY = mouseY;
      selectedFigureIndex = figuresList.indexOf(selectedFigure);
    } else {
      isResizing = false;
      isDrawing = true;
      isDragging = true;
      selectedFigureIndex = -1;
  
      prevMouseX = mouseX;
      prevMouseY = mouseY;
      ctx.beginPath();
      ctx.lineWidth = brushWidth;
      ctx.strokeStyle = colorPicker.value;
      ctx.fillStyle = colorPicker.value;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
      if (selectedTool === "rectangle" || selectedTool === "elipsa" || selectedTool === "linie") {
        const newFigure = { type: selectedTool, properties: { x: prevMouseX, y: prevMouseY, width: 0, height: 0 }, order: figuresList.length };
        figuresList.push(newFigure);
        updateFiguresList();
      }
  
      const canvasSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvasHistory.push(canvasSnapshot);
    }
  };const drawing = (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    console.log("Drawing - isResizing:", isResizing);
    console.log("Drawing - selectedFigureIndex:", selectedFigureIndex);
    if (isResizing && selectedFigureIndex !== -1) {
        // Redimensionare
        const selectedFigure = figuresList[selectedFigureIndex];
        const deltaX = mouseX - startX;
        const deltaY = mouseY - startY;
        selectedFigure.properties.width += deltaX;
        selectedFigure.properties.height += deltaY;
        startX = mouseX;
        startY = mouseY;
        // Actualizează canvas-ul
        redrawCanvas();
    } else if (isDrawing) {
        // Desenare figură nouă
        const width = mouseX - prevMouseX;
        const height = mouseY - prevMouseY;
        console.log("Drawing - width:", width);
        console.log("Drawing - height:", height);
        if (selectedTool === "brush" || selectedTool === "eraser") {
            ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : colorPicker.value;
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            prevMouseX = mouseX;
            prevMouseY = mouseY;
        } else {
            if (selectedTool === "rectangle") {
                drawRect({ x: prevMouseX, y: prevMouseY, width, height });
            } else if (selectedTool === "elipsa") {
                drawEllipse({ x: prevMouseX, y: prevMouseY, width, height });
            } else if (selectedTool === "linie") {
                // Desenează linia între punctul de start și punctul curent
                ctx.putImageData(snapshot, 0, 0); // Restaurează imaginea anterioară
                ctx.beginPath();
                ctx.moveTo(prevMouseX, prevMouseY);
                ctx.lineTo(mouseX, mouseY);
                ctx.closePath();
                ctx.stroke();
            }
            if (selectedTool === "rectangle" || selectedTool === "elipsa" || selectedTool === "linie") {
                const figure = figuresList[figuresList.length - 1];
                figure.properties.width = width;
                figure.properties.height = height;
                // Actualizează canvas-ul
                redrawCanvas();
            }
        }
    }
};

const redrawCanvas = () => {
    // Redesenăm toate figurile pe canvas
    setCanvasBackground();
    figuresList.forEach(figure => {
        if (figure.type === "rectangle") {
            drawRect(figure.properties);
        } else if (figure.type === "elipsa") {
            drawEllipse(figure.properties);
        } else if (figure.type === "linie") {
            drawLinie(figure.properties);
        }
    });
};
// ...
// ...
toolBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
  });
});
sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);
colorBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelector(".options .selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
  });
});
colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.background = colorPicker.value;
});
clearCanvas.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  setCanvasBackground();
});
document.querySelector(".change-background").addEventListener("click", changeCanvasBackground);
const updateFiguresList = () => {
  figuresListContainer.innerHTML = "";
  figuresList.forEach((figure, index) => {
    const li = document.createElement("li");
    li.innerHTML = `Figura ${index + 1}`;
    li.addEventListener("click", () => selectFigure(index));
    figuresListContainer.appendChild(li);
  });
};
const selectFigure = (index) => {
    if (index === selectedFigureIndex && isDragging) {
      // Dacă se face clic pe aceeași figură deja selectată și sunteți în modul de redimensionare, dezactivează redimensionarea
      isDragging = false;
      selectedFigureIndex = -1;
    } else {
      // Altfel, selectează figura pentru redimensionare
      selectedFigureIndex = index;
      isDragging = true;
    }
    updateFiguresList();
  };
  
 
  
const deleteSelectedFigure = () => {
  if (selectedFigureIndex !== -1) {
    const deletedFigure = figuresList[selectedFigureIndex];
    figuresList.splice(selectedFigureIndex, 1);
    selectedFigureIndex = -1;
    updateFiguresList();
    if (canvasHistory.length > 0) {
      const previousState = canvasHistory.pop();
      ctx.putImageData(previousState, 0, 0);
    }
    setCanvasBackground();
    figuresList.forEach(figure => {
      if (figure.type === "rectangle") {
        drawRect(figure.properties);
      } else if (figure.type === "elipsa") {
        drawEllipse(figure.properties);
      } else if (figure.type === "linie") {
        drawLinie(figure.properties);
      }
    });
    console.log("Ordinea figurilor după ștergere:", figuresList.map(figure => figure.type));
  }
};
document.getElementById("delete-figure").addEventListener("click", deleteSelectedFigure);
saveImg.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = `${Date.now()}.jpg`;
  link.href = canvas.toDataURL();
  link.click();
});
const exportToSVG = () => {
  const imageDataURL = canvas.toDataURL("image/png");
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
    <image href="${imageDataURL}" width="${canvas.width}" height="${canvas.height}" />
  </svg>`;
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "drawing.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
const exportButton = document.querySelector('.export-svg-button');
exportSvgBtn.addEventListener("click", exportToSVG);
canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", drawing);
canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    isResizing = false;
  });
