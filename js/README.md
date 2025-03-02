# TryVR JavaScript Modules

This directory contains the modular JavaScript code for the TryVR application.

## Module Structure

- **app.js**: Main application file that imports and coordinates all modules
- **modules/**: Directory containing all the individual modules
  - **database.js**: Handles all database operations (SQLite in browser)
  - **products.js**: Manages product display and related functionality
  - **modals.js**: Controls the product detail and video modals
  - **utils.js**: Contains utility functions like notifications

## Benefits of Modular Structure

1. **Maintainability**: Each module has a single responsibility, making the code easier to maintain
2. **Readability**: Smaller, focused files are easier to understand
3. **Reusability**: Functions can be imported and reused across modules
4. **Testability**: Modules can be tested independently
5. **Scalability**: New features can be added by creating new modules without modifying existing code

## Usage

The modules use ES6 module syntax with import/export statements. The main app.js file imports all necessary functionality from the modules and coordinates their usage. 