function handleEditAction(mouseX, mouseY) {
    switch (currentEditingAction) {
        case 'create':
            createNode(mouseX, mouseY);
            break;
        case 'delete':
            deleteNode();
            break;
        case 'move':
            moveNode();
            break;
    }
}

function createNode(mouseX, mouseY) {
    const newKey = Date.now().toString();

    var newItem = {
        x: Math.round((mouseX - panOffsetX) / (SCALE_FACTOR * zoomLevel)),
        y: Math.round((mouseY - panOffsetY) / (SCALE_FACTOR * zoomLevel)),
        size: 1, // Default size
        title: 'Default',
        subtitle: 'Default',
        description: 'Default',
        // ... Add other default properties
    };
    
    data[newKey] = newItem;
    requestRender();
}

function deleteNode() {
    if (hoveredItemKey) {
        delete data[hoveredItemKey];
        requestRender();
    }
}

function moveNode() {
    // The 'move' action can utilize the existing drag functionality.
    // You'll probably want to ensure the dragged item is the one you want to move.
    // This function acts as a placeholder for any additional logic you might want.
}
