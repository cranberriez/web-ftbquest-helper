const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const SIZE_MULTIPLIER = 30;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const zoomLevelElement = document.getElementById('zoomLevel')

const data = {
    item1: { x: 100, y: 100, size: 1 },
    item2: { x: 200, y: 200, size: 1 },
    // ... add more data as required
};

function createItem(x = 0, y = 0, size = 1) {
    return { 
        x, 
        y, 
        size
    };
}

function drawData() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let key in data) {
        const item = data[key];
        ctx.beginPath();
        ctx.arc(item.x * zoomLevel + panOffsetX, item.y * zoomLevel + panOffsetY, (item.size * SIZE_MULTIPLIER) * zoomLevel, 0, Math.PI * 2);
        ctx.strokeStyle = "#000"; // Black border, for example
        ctx.lineWidth = 2 * zoomLevel; // Border width
        ctx.stroke();
    }
}

let isDragging = false;
let prevX = 0;
let prevY = 0;
let panOffsetX = 0;
let panOffsetY = 0;
let zoomLevel = 1;

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
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        hoveredItemKey = null;

        for (let key in data) {
            const item = data[key];
            const dx = mouseX - (item.x * zoomLevel + panOffsetX);
            const dy = mouseY - (item.y * zoomLevel + panOffsetY);

            if (Math.sqrt(dx * dx + dy * dy) <= item.size * zoomLevel) {
                hoveredItemKey = key;
                break;
            }
        }

        // Show and position the tooltip if an item is hovered
        const tooltip = document.getElementById('tooltip');
        if (hoveredItemKey) {
            tooltip.style.display = 'block';
            tooltip.style.left = (e.clientX + 10) + 'px'; // 10 is an offset to position the tooltip a bit right to the cursor
            tooltip.style.top = (e.clientY + 10) + 'px'; // 10 is an offset to position the tooltip a bit below the cursor
        } else {
            tooltip.style.display = 'none';
        }

        drawData();
    }

    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;

    panOffsetX += dx;
    panOffsetY += dy;

    prevX = e.clientX;
    prevY = e.clientY;

    drawData();
});

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

drawData();
