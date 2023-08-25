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
var isDragging = false;
var prevX = 0;
var prevY = 0;
var panOffsetX = canvas.width / 2 - INITIAL_COORDS[0] * SCALE_FACTOR;;
var panOffsetY = canvas.height / 2 - INITIAL_COORDS[1] * SCALE_FACTOR;;
var zoomLevel = 1;
var hoveredItemKey = null;
var selectedItemKey = null; // to store the currently selected item's key
var renderRequested = false;
var startX = 0;
var startY = 0;