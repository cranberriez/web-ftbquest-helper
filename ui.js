const editToggle = document.getElementById('editToggle');
const editingButtons = document.getElementById('editingButtons');

let isEditMode = false;

editToggle.addEventListener('change', function() {
    isEditMode = this.checked;

    if (isEditMode) {
        editingButtons.style.display = 'block';
    } else {
        editingButtons.style.display = 'none';
        // Reset any editing state (if required)
        currentEditingAction = null;
    }
});

let currentEditingAction = null; // Can be 'move', 'create', or 'delete'

document.getElementById('moveBtn').addEventListener('click', function() {
    currentEditingAction = 'move';
});

document.getElementById('createBtn').addEventListener('click', function() {
    currentEditingAction = 'create';
});

document.getElementById('deleteBtn').addEventListener('click', function() {
    currentEditingAction = 'delete';
});
