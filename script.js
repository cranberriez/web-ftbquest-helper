const MIN_ZOOM = 0.5;
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
    Unlocks: "#ff9999",    // Pastel red
    Requires: "#99ccff",    // Pastel blue
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

var data = {
    // Starting point: Getting basic resources
    quest1: { x: 0, y: 0, size: 1, title: "Mining Basics", subtitle: "Iron Age", description: "Mine your first piece of Iron." },

    // Basic Machines & Power generation
    quest2: { x: 1, y: 1, size: 1, requires: ['quest1'], title: "Coal Generator", subtitle: "Basic Power", description: "Craft a Coal Generator to produce energy." },
    quest3: { x: 2, y: 1, size: 1, requires: ['quest2'], title: "Battery", subtitle: "Energy Storage", description: "Craft a basic energy storage battery." },
    
    // Early Tech 
    quest4: { x: 3, y: 0, size: 1, requires: ['quest3'], title: "Electric Furnace", subtitle: "Upgrade!", description: "Craft an Electric Furnace to double ore output." },
    quest5: { x: 3, y: 2, size: 1, requires: ['quest3'], title: "Machine Chassis", subtitle: "Building Blocks", description: "Craft a Machine Chassis which is used for most machines." },
    
    // Mining Automation & Advanced Power
    quest6: { x: 4, y: 1, size: 1, requires: ['quest4', 'quest5'], title: "Miner", subtitle: "Automation", description: "Craft a Miner to automatically extract ores from the ground." },
    quest7: { x: 5, y: 0, size: 1, requires: ['quest6'], title: "Solar Panel", subtitle: "Green Energy", description: "Craft a Solar Panel for daytime energy production." },
    quest8: { x: 5, y: 2, size: 1, requires: ['quest6'], title: "Wind Turbine", subtitle: "Natural Power", description: "Harness the power of the wind with a Wind Turbine." },
    
    // Advanced Tech & Automation
    quest9: { x: 6, y: 1, size: 1, requires: ['quest7', 'quest8'], title: "Assembler", subtitle: "Advanced Crafting", description: "Craft an Assembler for automated crafting." },
    quest10: { x: 7, y: 0, size: 1, requires: ['quest9'], title: "Robot Arm", subtitle: "Automation Tool", description: "Craft a Robot Arm for advanced item manipulation." },
    quest11: { x: 7, y: 2, size: 1, requires: ['quest9'], title: "Fluid Pump", subtitle: "Liquid Control", description: "Automate fluid movement and control with a Fluid Pump." },

    // The Endgame
    quest12: { x: 8, y: 1, size: 1, requires: ['quest10', 'quest11'], title: "Quantum Quarry", subtitle: "Endgame Mining", description: "Mine resources from a fictional dimension." },
    quest13: { x: 9, y: 1, size: 1, requires: ['quest12'], title: "Fusion Reactor", subtitle: "Limitless Power", description: "Harness the power of fusion for endless energy." }
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
let isMouseDown = false;
let startX = 0;
let startY = 0;

function createItem(x = 0, y = 0, size = 1) {
    return { 
        x, 
        y, 
        size
    };
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
                    drawLine(item, data[req], key, req);
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

    ctx.beginPath();
    ctx.moveTo(source.x * SCALE_FACTOR * zoomLevel + panOffsetX,
               source.y * SCALE_FACTOR * zoomLevel + panOffsetY);
    ctx.lineTo(target.x * SCALE_FACTOR * zoomLevel + panOffsetX,
               target.y * SCALE_FACTOR * zoomLevel + panOffsetY);
    ctx.strokeStyle = color;
    ctx.lineWidth = LINE_COLORS.StrokeWidth * zoomLevel;
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
    if (isMouseDown) {
        isDragging = true
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
    isMouseDown = true;

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
    
    isMouseDown = false;
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

    const roundedX = Math.floor(mouseX / 10) * 10;
    const roundedY = Math.floor(mouseY / 10) * 10;

    if (roundedX === previousRoundedX && roundedY === previousRoundedY) {
        return;
    }

    previousRoundedX = roundedX;
    previousRoundedY = roundedY;

    hoveredItemKey = getHoveredItemKey(roundedX, roundedY);
    mouseXElement.innerHTML = roundedX;
    mouseYElement.innerHTML = roundedY;

    document.getElementById('hoveredItemKey').innerHTML = hoveredItemKey;

    const tooltip = document.getElementById('tooltip');
    if (hoveredItemKey) {
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
