const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let data = {};

function createDataPoint(x = 0, y = 0, size = 10) {
    const id = Math.random().toString(36).substr(2, 9);  // Generate a random ID for each data point
    data[id] = { x, y, size };
}

// Example usage
createDataPoint(100, 100, 15);
createDataPoint(300, 200, 20);

let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let lastX = 0;
let lastY = 0;
let zoom = 1;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        offsetX += e.clientX - lastX;
        offsetY += e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        draw();
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
        zoom *= 1.1;
    } else {
        zoom /= 1.1;
    }
    draw();
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(zoom, zoom);
    for (let id in data) {
        const point = data[id];
        ctx.beginPath();
        ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

draw();
