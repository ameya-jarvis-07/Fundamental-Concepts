# Sorting Visualizer

A beautiful and interactive sorting algorithm visualizer built with HTML, CSS, and JavaScript - runs entirely in your browser with no backend required!

## Features

- **6 Sorting Algorithms:**
  - Bubble Sort
  - Selection Sort
  - Insertion Sort
  - Merge Sort
  - Quick Sort
  - Heap Sort

- **Interactive Controls:**
  - Dynamic array size slider (10-100 elements) - generates new array in real-time
  - Variable animation speed control
  - Start/Stop sorting at any time
  - Sound toggle button (enabled by default)

- **Real-time Statistics:**
  - Number of comparisons
  - Number of swaps
  - Time complexity (displayed after sorting completes)

- **Visual & Audio Feedback:**
  - Color-coded bars for different states (comparing, swapping, sorted)
  - Smooth animations with final traversal effect
  - Musical sound effects mapped to element values during swaps
  - Responsive single-page design (no scrolling at 100% zoom)

- **No Setup Required:**
  - Pure client-side JavaScript
  - No server or backend needed
  - Works completely offline
  - No cache - always loads fresh

## Setup Instructions

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari, etc.)

### Running the Application

Simply open `index.html` in your web browser:
- Double-click the `index.html` file, or
- Right-click and open with your preferred browser

That's it! No installation, no server, no dependencies needed.

### Usage

1. Select a sorting algorithm from the dropdown
2. Adjust the array size slider - the array regenerates automatically in real-time
3. Adjust the animation speed using the speed slider
4. Click "Start Sorting" to begin the visualization
5. Watch and listen as the algorithm sorts the array with visual and audio feedback!
6. See the time complexity revealed after sorting completes
7. You can stop the sorting at any time with the "Stop" button
8. Toggle sound on/off with the sound button (your preference is saved)

## Project Structure

```
sorting-visualizer/
│
├── index.html          # Frontend HTML structure
├── styles.css          # Styling and animations
├── script.js           # JavaScript logic with sorting algorithms
└── README.md           # This file
```

## How It Works

All sorting algorithms are implemented in JavaScript and run directly in your browser. When you click "Start Sorting":

1. The selected algorithm generates step-by-step sorting data locally
2. Each step includes the current array state and highlighted elements
3. The visualizer animates each step with smooth transitions
4. Color coding shows comparisons (yellow), swaps (red), and sorted elements (green)
5. Musical tones play during swaps - higher elements produce higher pitches
6. After sorting completes, a final traversal animates through all elements
7. The time complexity is revealed once the entire process finishes

## Color Legend

- **Purple Gradient**: Unsorted elements
- **Yellow Gradient**: Elements being compared
- **Red Gradient**: Elements being swapped
- **Green Gradient**: Sorted elements

## Audio Features

- **Sound Effects**: Each swap produces a tone based on the element's value
- **Frequency Mapping**: Values are mapped to 200-800 Hz range (higher values = higher pitch)
- **Toggle Control**: Sound can be enabled/disabled with the sound button
- **Persistent Preference**: Your sound setting is saved using localStorage

## Technologies Used

- **HTML5**: Semantic structure and layout
- **CSS3**: Gradients, animations, flexbox, and responsive design
- **JavaScript (ES6+)**: All sorting algorithms, visualization logic, and audio
- **Web Audio API**: Real-time sound synthesis for swap feedback
- **localStorage**: Persistent user preferences

## Time Complexities

| Algorithm | Best Case | Average Case | Worst Case |
|-----------|-----------|--------------|------------|
| Bubble Sort | O(n) | O(n²) | O(n²) |
| Selection Sort | O(n²) | O(n²) | O(n²) |
| Insertion Sort | O(n) | O(n²) | O(n²) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) |
| Quick Sort | O(n log n) | O(n log n) | O(n²) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) |

Enjoy visualizing sorting algorithms! 🎨
