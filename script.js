const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3.0;
const SIZE_MULTIPLIER = 30;
const INITIAL_COORDS = [0, 0]
const SCALE_FACTOR = 100;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const zoomLevelElement = document.getElementById('zoomLevel')
const mouseXElement = document.getElementById('mouseX')
const mouseYElement = document.getElementById('mouseY')

const LINE_COLORS = {
    Default: "#b0b0b0",    // Pastel gray
    Requires: "#ff9999",    // Pastel red
    Unlocks: "#99ccff",    // Pastel blue
    StrokeWidth: 3,
};

const CIRCLE_COLORS = {
    Unlocked: {
        fill: "#6677cc",         // Dark pastel blue
        stroke: "#8899dd"        // Brighter variant of dark pastel blue
    },
    Locked: {
        fill: "#555555",         // Dark gray
        stroke: "#767676"        // Brighter variant of dark gray
    },
    Completed: {
        fill: "#99ff99",         // Pastel green
        stroke: "#bbffbb"        // Brighter variant of pastel green
    },
    StrokeWidth: 2,
};

// Canvas Interaction Global Variables
let isDragging = false;
let prevX = 0;
let prevY = 0;
let panOffsetX = canvas.width / 2 - INITIAL_COORDS[0] * SCALE_FACTOR;;
let panOffsetY = canvas.height / 2 - INITIAL_COORDS[1] * SCALE_FACTOR;;
let zoomLevel = 1;
let hoveredItemKey = null;
let selectedItemKey = null; // to store the currently selected item's key
let renderRequested = false;
let startX = 0;
let startY = 0;

function dynamicThrottle(func, delayFunc) {
    let lastCall = 0;
    return function(...args) {
        const now = new Date().getTime();
        const delay = delayFunc();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return func(...args);
    };
}

function isItemInView(item) {
    const itemX = (item.x * SCALE_FACTOR) * zoomLevel + panOffsetX;
    const itemY = (item.y * SCALE_FACTOR) * zoomLevel + panOffsetY;
    const itemSize = item.size * SIZE_MULTIPLIER * zoomLevel;

    return (
        itemX + itemSize >= 0 &&
        itemX - itemSize <= canvas.width &&
        itemY + itemSize >= 0 &&
        itemY - itemSize <= canvas.height
    );
}

function drawData() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    for (let key in data) {
        const item = data[key];
        if (item.requires) {
            for (let req of item.requires) {
                if (data[req] && (isItemInView(item) || isItemInView(data[req]))) {
                    drawLine(data[req], item, key, req);
                }
            }
        }
    }

    // Draw circles
    for (let key in data) {
        if (isItemInView(data[key])) {
            drawCircle(data[key]);
        }
    }
}

function drawLine(source, target, sourceKey, targetKey) {
    let color = LINE_COLORS.Default;
    if (hoveredItemKey === sourceKey) color = LINE_COLORS.Requires;
    else if (hoveredItemKey === targetKey) color = LINE_COLORS.Unlocks;

    const startX = source.x * SCALE_FACTOR * zoomLevel + panOffsetX;
    const startY = source.y * SCALE_FACTOR * zoomLevel + panOffsetY;
    const endX = target.x * SCALE_FACTOR * zoomLevel + panOffsetX;
    const endY = target.y * SCALE_FACTOR * zoomLevel + panOffsetY;

    // Calculate the midpoint
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = LINE_COLORS.StrokeWidth * zoomLevel;
    ctx.stroke();

    // Draw the arrowhead at the midpoint
    const arrowLength = 10 * zoomLevel;  // Adjust this value as needed
    const arrowWidth = 3 * zoomLevel;  // Adjust this value to make the arrow narrower

    // Calculate the angle of the line
    const angle = Math.atan2(startY - endY, startX - endX);

    // Draw the arrow using the relevent function
    drawArrow(midX, midY, angle, arrowLength, arrowWidth, color);
}

function drawArrow(x, y, angle, length, width, color) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length * Math.cos(angle - Math.PI / 4), y + length * Math.sin(angle - Math.PI / 4));  // Adjusted the angle for a narrower arrow
    ctx.lineTo(x + length * Math.cos(angle + Math.PI / 4), y + length * Math.sin(angle + Math.PI / 4));  // Adjusted the angle for a narrower arrow
    ctx.closePath(); // Close the triangle of the arrowhead
    ctx.strokeStyle = color;
    ctx.fillStyle = color;  // Fill the arrowhead with the same color as the line
    ctx.fill();
    ctx.stroke();
}

function drawCircle(item) {
    ctx.beginPath();
    ctx.arc((item.x * SCALE_FACTOR) * zoomLevel + panOffsetX,
            (item.y * SCALE_FACTOR) * zoomLevel + panOffsetY,
            (item.size * SIZE_MULTIPLIER) * zoomLevel, 0, Math.PI * 2);

    if (item.completed) {
        ctx.fillStyle = CIRCLE_COLORS.Completed.fill;
        ctx.strokeStyle = CIRCLE_COLORS.Completed.stroke;
    } else if (!item.unlocked) {
        ctx.fillStyle = CIRCLE_COLORS.Locked.fill;
        ctx.strokeStyle = CIRCLE_COLORS.Locked.stroke;
    } else {
        ctx.fillStyle = CIRCLE_COLORS.Unlocked.fill;
        ctx.strokeStyle = CIRCLE_COLORS.Unlocked.stroke;
    }
    
    ctx.fill();
    ctx.lineWidth = CIRCLE_COLORS.StrokeWidth * zoomLevel; 
    ctx.stroke();
}

function drawTooltip(questKey) {
    const quest = data[questKey];
    if (!quest) return;

    document.getElementById('tooltipTitle').innerHTML = quest.title;
    document.getElementById('tooltipSubtitle').innerHTML = quest.subtitle;
}

function mouseHandler(e) {
    switch (e.type) {
        case 'mousemove':
            handleMouseMove(e);
            break;
        case 'mousedown':
            handleMouseDown(e)
            break;
        case 'mouseup':
            handleMouseUp(e)
            break;
    }
}

function handleMouseMove(e) {
    if (isDragging) {
        handleDragging(e);
    } else {
        handleHoverEffect(e);
    }

    requestRender();
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
}

function handleMouseUp(e) {
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    
    // If the mouse hasn't moved much, it's a click, not a drag
    if (Math.abs(endX - startX) < 5 && Math.abs(endY - startY) < 5) {
        handleMouseClick()
    }
    
    isDragging = false;
}

function requestRender() {
    if (!renderRequested) {
        renderRequested = true;
        requestAnimationFrame(() => {
            drawData();
            renderRequested = false;
        });
    }
}

canvas.addEventListener('mousemove', dynamicThrottle(mouseHandler, () => isDragging || hoveredItemKey ? 20 : 200));
canvas.addEventListener('mousedown', mouseHandler);
canvas.addEventListener('mouseup', mouseHandler);

let previousRoundedX = null;
let previousRoundedY = null;

function handleHoverEffect(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const roundedX = (Math.floor(mouseX / 10) * 10) + 2.5;
    const roundedY = (Math.floor(mouseY / 10) * 10) + 2.5;

    if (roundedX === previousRoundedX && roundedY === previousRoundedY) {
        return;
    }

    previousRoundedX = roundedX;
    previousRoundedY = roundedY;

    tempHoveredItemKey = getHoveredItemKey(roundedX, roundedY);
    if (hoveredItemKey == tempHoveredItemKey)
        return

    hoveredItemKey = tempHoveredItemKey

    mouseXElement.innerHTML = roundedX;
    mouseYElement.innerHTML = roundedY;

    document.getElementById('hoveredItemKey').innerHTML = hoveredItemKey;

    const tooltip = document.getElementById('tooltip');
    if (hoveredItemKey) {
        console.log('tooltip Redraw')
        const hoveredItem = data[hoveredItemKey];
        showTooltip(hoveredItem, tooltip);
        drawTooltip(hoveredItemKey, tooltip);
    } else {
        hideTooltip(tooltip);
    }
}

function getHoveredItemKey(mouseX, mouseY) {
    for (let key in data) {
        const item = data[key];
        const effectiveSize = item.size * zoomLevel * SIZE_MULTIPLIER;

        // Compute the bounding box of the circle
        const leftBound = (item.x * SCALE_FACTOR) * zoomLevel + panOffsetX - effectiveSize;
        const rightBound = (item.x * SCALE_FACTOR) * zoomLevel + panOffsetX + effectiveSize;
        const topBound = (item.y * SCALE_FACTOR) * zoomLevel + panOffsetY - effectiveSize;
        const bottomBound = (item.y * SCALE_FACTOR) * zoomLevel + panOffsetY + effectiveSize;

        if (mouseX >= leftBound && mouseX <= rightBound && mouseY >= topBound && mouseY <= bottomBound) {
            return key;
        }
    }
    return null;
}

function showTooltip(hoveredItem, tooltip) {
    const tooltipX = (hoveredItem.x * SCALE_FACTOR) * zoomLevel + panOffsetX;
    const tooltipY = (hoveredItem.y * SCALE_FACTOR) * zoomLevel + panOffsetY;

    tooltip.style.display = 'block';
    tooltip.style.left = (tooltipX + SIZE_MULTIPLIER + 10) + 'px';  // Add an offset of 10 to position the tooltip to the right
    tooltip.style.top = (tooltipY - SIZE_MULTIPLIER + 10) + 'px';   // Add an offset of 10 to position the tooltip below
}

function hideTooltip(tooltip) {
    tooltip.style.display = 'none';
}

function handleDragging(e) {
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;

    panOffsetX += dx;
    panOffsetY += dy;

    prevX = e.clientX;
    prevY = e.clientY;
}

canvas.addEventListener('wheel', (e) => {
    const scaleFactor = 1.1;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate world coordinates of the mouse before zooming
    const worldXBeforeZoom = (mouseX - panOffsetX) / zoomLevel;
    const worldYBeforeZoom = (mouseY - panOffsetY) / zoomLevel;

    // Adjust zoom level
    if (e.deltaY < 0) {
        zoomLevel *= scaleFactor;
    } else {
        zoomLevel /= scaleFactor;
    }

    // Clamp zoom level to the specified min and max
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel));
    zoomLevelElement.innerHTML = zoomLevel

    // Calculate world coordinates of the mouse after zooming
    const worldXAfterZoom = (mouseX - panOffsetX) / zoomLevel;
    const worldYAfterZoom = (mouseY - panOffsetY) / zoomLevel;

    // Adjust pan offsets to keep the mouse on the same world point after zoom
    panOffsetX += (worldXAfterZoom - worldXBeforeZoom) * zoomLevel;
    panOffsetY += (worldYAfterZoom - worldYBeforeZoom) * zoomLevel;

    requestRender();
    e.preventDefault();
});

function handleMouseClick() {
    if (hoveredItemKey) {
        selectedItemKey = hoveredItemKey;

        // Change selected DEBUG text to show hovered item
        document.getElementById('selectedItemKey').innerHTML = selectedItemKey
    
        updateQuestPanel(hoveredItemKey); // Show and populate the side panel with the selected quest's data
    } else {
        selectedItemKey = null;
        updateQuestPanel(null); // Hide the panel if no quest is selected
    }
};

function updateQuestPanel(itemKey) {
    const questDetails = document.getElementById('questDetails');
    const questTitle = document.getElementById('questTitle');
    const questSubheading = document.getElementById('questSubheading');
    const questDescription = document.getElementById('questDescription');

    if (itemKey) {
        const item = data[itemKey];
        questTitle.innerText = item.title;
        questSubheading.innerText = item.subtitle;
        questDescription.innerText = item.description;
        questDetails.style.display = 'block';
    } else {
        questDetails.style.display = 'none';
    }
}

let completeButton = document.getElementById('completeButton');
completeButton.addEventListener('click', () => {
    if (!selectedItemKey) return;
    
    completeQuest(selectedItemKey);
    
    updateQuestPanel(null); // Hide the panel
    requestRender(); // Re-draw the canvas to reflect the changes
});

function completeQuest(questKey) {
    if (data[questKey].unlocked && !data[questKey].completed) {
        data[questKey].completed = true;
        // Check if completing this quest unlocks others
        for (let key in data) {
            const item = data[key];
            if (item.requires && item.requires.includes(questKey)) {
                if (item.requires.every(req => data[req].completed)) {
                    item.unlocked = true; // Unlock the quest if all requirements are met
                }
            }
        }
    }
    requestRender(); // Redraw the canvas to reflect changes
}



requestRender();
