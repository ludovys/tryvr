// Utilities Module - Common utility functions

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('status-notification');
    const messageElement = document.getElementById('status-message');
    
    // Set message
    messageElement.textContent = message;
    
    // Set color based on type
    if (type === 'success') {
        notification.classList.remove('bg-red-500');
        notification.classList.add('bg-green-500');
    } else {
        notification.classList.remove('bg-green-500');
        notification.classList.add('bg-red-500');
    }
    
    // Show notification
    notification.classList.remove('translate-y-20', 'opacity-0');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

export {
    showNotification
}; 