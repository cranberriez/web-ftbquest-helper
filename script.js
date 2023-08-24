const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const SIZE_MULTIPLIER = 30;
const INITIAL_COORDS = [0, 0]
const SCALE_FACTOR = 100;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const zoomLevelElement = document.getElementById('zoomLevel')

var data = {
    item1: { x: 0, y: 0, size: 1, requires: ['item2']},
    item2: { x: -1, y: 1, size: 1, requires: ['item3', 'item4']},
    item3: { x: -2, y: 2, size: 1},
    item4: { x: 0, y: 2, size: 1, requires: ['item5'] },
    item5: { x: 0, y: 3, size: 1},
    item6: { x: 2, y: 1, size: 1, requires: ['item7'] },
    item7: { x: 2, y: 2, size: 1, requires: ['item8'] },
    item8: { x: 3, y: 2, size: 1, requires: ['item9'] },
    item9: { x: 3, y: 1, size: 1},
    item10: { x: 1, y: -1, size: 1, requires: ['item11', 'item12'] },
    item11: { x: 0, y: -1, size: 1},
    item12: { x: 2, y: -2, size: 1, requires: ['item13'] },
    item13: { x: 3, y: -3, size: 1, requires: ['item14'] },
    item14: { x: 4, y: -4, size: 1},
    item15: { x: -2, y: -1, size: 1, requires: ['item16'] },
    item16: { x: -3, y: -2, size: 1, requires: ['item17'] },
    item17: { x: -4, y: -2, size: 1},
    item18: { x: -1, y: -3, size: 1, requires: ['item19'] },
    item19: { x: -2, y: -4, size: 1, requires: ['item20'] },
    item20: { x: -3, y: -5, size: 1},
};

for (let key in data) {
    const item = data[key];
    if (item.requires) {
        // Initialize unlocked to true and then set it to false if any required quest is not completed
        item.unlocked = true;
        for (const req of item.requires) {
            if (!data[req].completed) {
                item.unlocked = false;
                break;
            }
        }
    } else {
        item.unlocked = true; // If there are no requirements, it's unlocked by default
    }

    item.completed = false; // Default to not completed for all quests
}


let isDragging = false;
let prevX = 0;
let prevY = 0;
let panOffsetX = canvas.width / 2 - INITIAL_COORDS[0] * SCALE_FACTOR;;
let panOffsetY = canvas.height / 2 - INITIAL_COORDS[1] * SCALE_FACTOR;;
let zoomLevel = 1;
let hoveredItemKey = null;
let selectedItemKey = null; // to store the currently selected item's key


function createItem(x = 0, y = 0, size = 1) {
    return { 
        x, 
        y, 
        size
    };
}

function drawData() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines
    for (let key in data) {
        const item = data[key];
        if (item.requires) {
            for (let req of item.requires) {
                if (data[req]) {
                    drawLine(item, data[req], key, req);
                }
            }
        }
    }

    // Draw circles
    for (let key in data) {
        drawCircle(data[key]);
    }
}

function drawLine(source, target, sourceKey, targetKey) {
    let color = "#000"; // default color
    if (hoveredItemKey === sourceKey) color = "#f00"; // requires color
    else if (hoveredItemKey === targetKey) color = "#0f0"; // unlocks color

    ctx.beginPath();
    ctx.moveTo(source.x * SCALE_FACTOR * zoomLevel + panOffsetX,
               source.y * SCALE_FACTOR * zoomLevel + panOffsetY);
    ctx.lineTo(target.x * SCALE_FACTOR * zoomLevel + panOffsetX,
               target.y * SCALE_FACTOR * zoomLevel + panOffsetY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * zoomLevel;
    ctx.stroke();
}

function drawCircle(item) {
    ctx.beginPath();
    ctx.arc((item.x * SCALE_FACTOR) * zoomLevel + panOffsetX,
            (item.y * SCALE_FACTOR) * zoomLevel + panOffsetY,
            (item.size * SIZE_MULTIPLIER) * zoomLevel, 0, Math.PI * 2);

    // Fill the circle
    if (item.completed) {
        ctx.fillStyle = "#00FF00"; // Green for completed quests
    } else if (!item.unlocked) {
        ctx.fillStyle = "#808080"; // Gray for locked quests
    } else {
        ctx.fillStyle = "#FFF"; // White for unlocked but not completed quests
    }
    ctx.fill();

    // Stroke the circle
    ctx.strokeStyle = item.unlocked ? "#000" : "#777"; // Black border for unlocked, lighter gray for locked
    ctx.lineWidth = 2 * zoomLevel; 
    ctx.stroke();
}

function drawTooltip(hoveredItemKey, tooltip) {
    // In the mousemove event listener:
    if (hoveredItemKey) {
        // Modify the tooltip content based on the hovered item
        tooltip.innerHTML = `
            <h4>Heading for ${hoveredItemKey}</h4>
            <p>Details for ${hoveredItemKey}...</p>
        `;
    } else {
        tooltip.style.display = 'none';
    }
}

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) {
        handleHoverEffect(e);
    } else {
        handleDragging(e);
    }

    drawData();
});

function handleHoverEffect(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    hoveredItemKey = getHoveredItemKey(mouseX, mouseY);

    // Show and position the tooltip if an item is hovered
    const tooltip = document.getElementById('tooltip');
    if (hoveredItemKey) {
        showTooltip(e, tooltip);
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

function showTooltip(e, tooltip) {
    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 10) + 'px'; // 10 is an offset to position the tooltip a bit right to the cursor
    tooltip.style.top = (e.clientY + 10) + 'px'; // 10 is an offset to position the tooltip a bit below the cursor
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

    drawData();
    e.preventDefault();
});

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    selectedItemKey = null; // Reset the selectedItemKey

    for (let key in data) {
        const item = data[key];
        const effectiveSize = item.size * zoomLevel * SIZE_MULTIPLIER;

        const leftBound = (item.x * SCALE_FACTOR) * zoomLevel + panOffsetX - effectiveSize;
        const rightBound = (item.x * SCALE_FACTOR) * zoomLevel + panOffsetX + effectiveSize;
        const topBound = (item.y * SCALE_FACTOR) * zoomLevel + panOffsetY - effectiveSize;
        const bottomBound = (item.y * SCALE_FACTOR) * zoomLevel + panOffsetY + effectiveSize;

        if (mouseX >= leftBound && mouseX <= rightBound && mouseY >= topBound && mouseY <= bottomBound) {
            selectedItemKey = key;
            break;
        }
    }

    if (selectedItemKey) {
        updateQuestPanel(selectedItemKey); // Show and populate the side panel with the selected quest's data
    } else {
        updateQuestPanel(null); // Hide the panel if no quest is selected
    }
});


function updateQuestPanel(itemKey) {
    const questDetails = document.getElementById('questDetails');
    const questTitle = document.getElementById('questTitle');
    const questSubheading = document.getElementById('questSubheading');

    if (itemKey) {
        const item = data[itemKey];
        questTitle.innerText = itemKey;
        questSubheading.innerText = 'Subheading for ' + itemKey;
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
    drawData(); // Re-draw the canvas to reflect the changes
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
    drawData(); // Redraw the canvas to reflect changes
}



drawData();
