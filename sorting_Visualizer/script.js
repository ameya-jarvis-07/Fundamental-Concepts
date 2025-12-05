let array = [];
let isSorting = false;
let stopRequested = false;
let steps = [];

// Audio Context for sound effects
let audioContext = null;
let soundEnabled = true;

// DOM Elements
const visualizer = document.getElementById('visualizer');
const algorithmSelect = document.getElementById('algorithm');
const arraySizeInput = document.getElementById('arraySize');
const arraySizeValue = document.getElementById('arraySizeValue');
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
const startBtn = document.getElementById('startSort');
const stopBtn = document.getElementById('stopSort');
const toggleSoundBtn = document.getElementById('toggleSound');
const comparisonsDisplay = document.getElementById('comparisons');
const swapsDisplay = document.getElementById('swaps');
const timeComplexityDisplay = document.getElementById('timeComplexity');

// Time complexities for each algorithm
const timeComplexities = {
    bubble: 'O(n²)',
    selection: 'O(n²)',
    insertion: 'O(n²)',
    merge: 'O(n log n)',
    quick: 'O(n log n)',
    heap: 'O(n log n)'
};

// Initialize
function initializeApp() {
    // Load sound preference from localStorage (default to true)
    const savedSoundPref = localStorage.getItem('soundEnabled');
    soundEnabled = savedSoundPref === null ? true : savedSoundPref === 'true';
    toggleSoundBtn.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
    if (!soundEnabled) {
        toggleSoundBtn.classList.add('active');
    }
    
    timeComplexityDisplay.textContent = '-';
    generateArray();
}

initializeApp();

// Event Listeners
arraySizeInput.addEventListener('input', (e) => {
    arraySizeValue.textContent = e.target.value;
    if (!isSorting) {
        generateArray();
    }
});

speedInput.addEventListener('input', (e) => {
    speedValue.textContent = e.target.value;
});

algorithmSelect.addEventListener('change', () => {
    if (!isSorting) {
        timeComplexityDisplay.textContent = '-';
    }
});

startBtn.addEventListener('click', async () => {
    if (!isSorting) {
        initAudio(); // Initialize audio context on user interaction
        await startSorting();
    }
});

stopBtn.addEventListener('click', () => {
    stopSorting();
});

toggleSoundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    toggleSoundBtn.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
    toggleSoundBtn.classList.toggle('active');
    
    // Save preference to localStorage
    localStorage.setItem('soundEnabled', soundEnabled);
    
    if (soundEnabled) {
        initAudio();
    }
});

// Functions
function generateArray() {
    const size = parseInt(arraySizeInput.value);
    array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
    renderArray();
    resetStats();
    timeComplexityDisplay.textContent = '-';
}

function renderArray(comparing = [], swapping = [], sorted = []) {
    visualizer.innerHTML = '';
    const maxValue = Math.max(...array);
    
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${(value / maxValue) * 100}%`;
        
        if (comparing.includes(index)) {
            bar.classList.add('comparing');
        }
        if (swapping.includes(index)) {
            bar.classList.add('swapping');
        }
        if (sorted.includes(index)) {
            bar.classList.add('sorted');
        }
        
        visualizer.appendChild(bar);
    });
}

function updateTimeComplexity() {
    const algorithm = algorithmSelect.value;
    timeComplexityDisplay.textContent = timeComplexities[algorithm];
}

function resetStats() {
    comparisonsDisplay.textContent = '0';
    swapsDisplay.textContent = '0';
}

async function startSorting() {
    const algorithm = algorithmSelect.value;
    
    isSorting = true;
    stopRequested = false;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    algorithmSelect.disabled = true;
    arraySizeInput.disabled = true;
    
    try {
        // Generate sorting steps locally
        steps = [];
        const arrayCopy = [...array];
        
        switch(algorithm) {
            case 'bubble':
                await bubbleSort(arrayCopy);
                break;
            case 'selection':
                await selectionSort(arrayCopy);
                break;
            case 'insertion':
                await insertionSort(arrayCopy);
                break;
            case 'merge':
                await mergeSort(arrayCopy);
                break;
            case 'quick':
                await quickSort(arrayCopy);
                break;
            case 'heap':
                await heapSort(arrayCopy);
                break;
        }
        
        await animateSorting(steps);
        
        // Show time complexity only after sorting is completely done
        if (!stopRequested) {
            updateTimeComplexity();
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during sorting.');
    } finally {
        isSorting = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        algorithmSelect.disabled = false;
        arraySizeInput.disabled = false;
    }
}

async function animateSorting(steps) {
    let comparisons = 0;
    let swaps = 0;
    const maxValue = Math.max(...array);
    
    for (let i = 0; i < steps.length; i++) {
        if (stopRequested) {
            break;
        }
        
        const step = steps[i];
        array = step.array;
        
        if (step.type === 'compare') {
            comparisons++;
            comparisonsDisplay.textContent = comparisons;
        } else if (step.type === 'swap') {
            swaps++;
            swapsDisplay.textContent = swaps;
            
            // Play sound for swap
            if (step.swapping && step.swapping.length > 0) {
                const swapIndex = step.swapping[0];
                if (array[swapIndex] !== undefined) {
                    playSwapSound(array[swapIndex], maxValue);
                }
            }
        }
        
        renderArray(
            step.comparing || [],
            step.swapping || [],
            step.sorted || []
        );
        
        // Calculate delay based on speed slider (inverse relationship)
        const speed = parseInt(speedInput.value);
        const delay = 1000 / speed; // Higher speed = shorter delay
        await sleep(delay);
    }
    
    // Final traversal animation after sorting is complete
    if (!stopRequested) {
        // Animate through each element one by one
        for (let i = 0; i < array.length; i++) {
            if (stopRequested) break;
            
            renderArray([], [i], Array.from({length: i}, (_, k) => k));
            playSwapSound(array[i], maxValue);
            
            const speed = parseInt(speedInput.value);
            const delay = 500 / speed; // Slightly faster for final traversal
            await sleep(delay);
        }
        
        // Mark all as sorted at the end
        renderArray([], [], array.map((_, i) => i));
    }
}

function stopSorting() {
    stopRequested = true;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSwapSound(value, maxValue) {
    if (!soundEnabled || !audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Map array value to frequency (200Hz to 800Hz)
        const frequency = 200 + (value / maxValue) * 600;
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.error('Audio error:', error);
    }
}

function addStep(arr, stepType, comparing = [], swapping = [], sorted = []) {
    steps.push({
        array: [...arr],
        type: stepType,
        comparing: comparing,
        swapping: swapping,
        sorted: sorted
    });
}

// Sorting Algorithms

async function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            addStep(arr, 'compare', [j, j + 1]);
            
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                addStep(arr, 'swap', [], [j, j + 1]);
            }
        }
        addStep(arr, 'sorted', [], [], Array.from({length: i + 1}, (_, k) => n - 1 - k));
    }
}

async function selectionSort(arr) {
    const n = arr.length;
    
    for (let i = 0; i < n; i++) {
        let minIdx = i;
        
        for (let j = i + 1; j < n; j++) {
            addStep(arr, 'compare', [minIdx, j]);
            
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
            addStep(arr, 'swap', [], [i, minIdx]);
        }
        
        addStep(arr, 'sorted', [], [], Array.from({length: i + 1}, (_, k) => k));
    }
}

async function insertionSort(arr) {
    const n = arr.length;
    
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        
        addStep(arr, 'compare', [i]);
        
        while (j >= 0 && arr[j] > key) {
            addStep(arr, 'compare', [j, j + 1]);
            
            arr[j + 1] = arr[j];
            addStep(arr, 'swap', [], [j, j + 1]);
            
            j--;
        }
        
        arr[j + 1] = key;
        addStep(arr, 'sorted', [], [], Array.from({length: i + 1}, (_, k) => k));
    }
}

async function mergeSort(arr) {
    function merge(arr, left, mid, right, startIdx) {
        const leftArr = arr.slice(left, mid + 1);
        const rightArr = arr.slice(mid + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            addStep(arr, 'compare', [left + i, mid + 1 + j]);
            
            if (leftArr[i] <= rightArr[j]) {
                arr[k] = leftArr[i];
                i++;
            } else {
                arr[k] = rightArr[j];
                j++;
            }
            addStep(arr, 'swap', [], [k]);
            k++;
        }
        
        while (i < leftArr.length) {
            arr[k] = leftArr[i];
            addStep(arr, 'swap', [], [k]);
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            arr[k] = rightArr[j];
            addStep(arr, 'swap', [], [k]);
            j++;
            k++;
        }
    }
    
    function mergeSortHelper(arr, left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            mergeSortHelper(arr, left, mid);
            mergeSortHelper(arr, mid + 1, right);
            merge(arr, left, mid, right, left);
        }
    }
    
    mergeSortHelper(arr, 0, arr.length - 1);
    addStep(arr, 'sorted', [], [], Array.from({length: arr.length}, (_, k) => k));
}

async function quickSort(arr) {
    function partition(arr, low, high) {
        const pivot = arr[high];
        let i = low - 1;
        
        for (let j = low; j < high; j++) {
            addStep(arr, 'compare', [j, high]);
            
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                addStep(arr, 'swap', [], [i, j]);
            }
        }
        
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        addStep(arr, 'swap', [], [i + 1, high]);
        
        return i + 1;
    }
    
    function quickSortHelper(arr, low, high) {
        if (low < high) {
            const pi = partition(arr, low, high);
            quickSortHelper(arr, low, pi - 1);
            quickSortHelper(arr, pi + 1, high);
        }
    }
    
    quickSortHelper(arr, 0, arr.length - 1);
    addStep(arr, 'sorted', [], [], Array.from({length: arr.length}, (_, k) => k));
}

async function heapSort(arr) {
    function heapify(arr, n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n) {
            addStep(arr, 'compare', [largest, left]);
            if (arr[left] > arr[largest]) {
                largest = left;
            }
        }
        
        if (right < n) {
            addStep(arr, 'compare', [largest, right]);
            if (arr[right] > arr[largest]) {
                largest = right;
            }
        }
        
        if (largest !== i) {
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            addStep(arr, 'swap', [], [i, largest]);
            heapify(arr, n, largest);
        }
    }
    
    const n = arr.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        addStep(arr, 'swap', [], [0, i]);
        addStep(arr, 'sorted', [], [], Array.from({length: n - i}, (_, k) => i + k));
        heapify(arr, i, 0);
    }
    
    addStep(arr, 'sorted', [], [], Array.from({length: arr.length}, (_, k) => k));
}
