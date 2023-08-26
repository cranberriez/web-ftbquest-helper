// Initial call to adjustCanvasSize
adjustCanvasSize();

// Event listener to adjust canvas size whenever the window is resized
window.addEventListener('resize', adjustCanvasSize);

function adjustCanvasSize() {
    // Adjust the canvas's drawing buffer to match its CSS size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // Reset the transformation matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Update the initial pan offsets to center the content
    panOffsetX = canvas.width / 2 - INITIAL_COORDS[0] * SCALE_FACTOR;
    panOffsetY = canvas.height / 2 - INITIAL_COORDS[1] * SCALE_FACTOR;

    // Re-render the canvas content
    requestRender();
}

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

    // Draw Temporary Circle (if needed)
    if (currentEditingAction === 'create' && !hoveredItemKey) {
        drawTemporaryCircle();
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
    // Calculate the endpoints of the two lines forming the arrowhead
    const endX1 = x + length * Math.cos(angle - Math.PI / 4); // Adjusted the angle for a narrower arrow
    const endY1 = y + length * Math.sin(angle - Math.PI / 4);

    const endX2 = x + length * Math.cos(angle + Math.PI / 4); // Adjusted the angle for a narrower arrow
    const endY2 = y + length * Math.sin(angle + Math.PI / 4);

    ctx.strokeStyle = color;
    
    // Draw the first line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX1, endY1);
    ctx.stroke();

    // Draw the second line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX2, endY2);
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

function drawTemporaryCircle() {
    const tempX = (mouseX / zoomLevel - panOffsetX) / SCALE_FACTOR;
    const tempY = (mouseY / zoomLevel - panOffsetY) / SCALE_FACTOR;

    const drawX = (tempX * SCALE_FACTOR) * zoomLevel + panOffsetX;
    const drawY = (tempY * SCALE_FACTOR) * zoomLevel + panOffsetY;
    const tempSize = (1 * SIZE_MULTIPLIER) * zoomLevel;

    console.log(`Drawing circle at X: ${drawX} Y: ${drawY}`);

    ctx.beginPath();
    ctx.arc(drawX, drawY, tempSize, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700"; // Gold color for the temporary circle
    ctx.strokeStyle = "#B8860B"; // Dark goldenrod for the stroke
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
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (isDragging) {
        handleDragging(e);
    } else {
        handleHoverEffect(e);
        if (currentEditingAction === 'create' && !hoveredItemKey) {
            requestRender();
        }
    }
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
        handleMouseClick(e)
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

    tempHoveredItemKey = getHoveredItemKey(mouseX, mouseY);

    if (hoveredItemKey == tempHoveredItemKey) {
        return; // No change in hovered item
    }

    hoveredItemKey = tempHoveredItemKey;

    mouseXElement.innerHTML = mouseX; // Directly use mouseX, mouseY without rounding
    mouseYElement.innerHTML = mouseY;

    document.getElementById('hoveredItemKey').innerHTML = hoveredItemKey;

    const tooltip = document.getElementById('tooltip');
    if (hoveredItemKey) {
        console.log('tooltip Redraw');
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

        const circleCenterX = (item.x * SCALE_FACTOR) * zoomLevel + panOffsetX;
        const circleCenterY = (item.y * SCALE_FACTOR) * zoomLevel + panOffsetY;
        const effectiveRadius = item.size * SIZE_MULTIPLIER * zoomLevel;

        const distance = Math.sqrt((mouseX - circleCenterX)**2 + (mouseY - circleCenterY)**2);

        if (distance <= effectiveRadius) {
            return key; // Cursor is inside this circle
        }
    }
    return null; // Cursor is not inside any circle
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

    requestRender()
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

function handleMouseClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isEditMode) {
        handleEditAction(mouseX, mouseY)
        return
    }
    
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
