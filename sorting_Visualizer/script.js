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
const languageSelect = document.getElementById('language');
const arraySizeInput = document.getElementById('arraySize');
const arraySizeValue = document.getElementById('arraySizeValue');
const speedInput = document.getElementById('speed');
const speedValue = document.getElementById('speedValue');
const startBtn = document.getElementById('startSort');
const stopBtn = document.getElementById('stopSort');
const scrambleBtn = document.getElementById('scramble');
const showCodeBtn = document.getElementById('showCode');
const toggleSoundBtn = document.getElementById('toggleSound');
const comparisonsDisplay = document.getElementById('comparisons');
const swapsDisplay = document.getElementById('swaps');
const timeComplexityDisplay = document.getElementById('timeComplexity');
const codeModal = document.getElementById('codeModal');
const closeModalBtn = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const codeDisplay = document.getElementById('codeDisplay');

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

scrambleBtn.addEventListener('click', () => {
    if (!isSorting) {
        scrambleArray();
    }
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

showCodeBtn.addEventListener('click', () => {
    showCodeModal();
});

closeModalBtn.addEventListener('click', () => {
    codeModal.classList.remove('show');
});

codeModal.addEventListener('click', (e) => {
    if (e.target === codeModal) {
        codeModal.classList.remove('show');
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

function scrambleArray() {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    renderArray();
    resetStats();
    timeComplexityDisplay.textContent = '-';
    showToast('Array scrambled!', 2000);
}

function renderArray(comparing = [], swapping = [], sorted = []) {
    visualizer.innerHTML = '';
    const maxValue = Math.max(...array);
    
    array.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${(value / maxValue) * 100}%`;
        bar.setAttribute('data-index', index);
        
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

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function isSorted() {
    for (let i = 0; i < array.length - 1; i++) {
        if (array[i] > array[i + 1]) {
            return false;
        }
    }
    return true;
}

async function startSorting() {
    // Check if already sorted
    if (isSorted()) {
        showToast('Array is already sorted!');
        // Highlight all bars as sorted
        renderArray([], [], array.map((_, i) => i));
        updateTimeComplexity();
        return;
    }
    
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
        
        if (step.type === 'compare') {
            comparisons++;
            comparisonsDisplay.textContent = comparisons;
            array = step.array;
        } else if (step.type === 'swap') {
            swaps++;
            swapsDisplay.textContent = swaps;
            
            // Animate the swap with horizontal movement
            if (step.swapping && step.swapping.length === 2) {
                await animateSwap(step.swapping[0], step.swapping[1]);
            }
            
            array = step.array;
            
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
            step.type === 'swap' ? [] : (step.swapping || []),
            step.sorted || []
        );
        
        // Calculate delay based on speed slider (inverse relationship)
        // Reduce delay for swaps since animation already took time
        const speed = parseInt(speedInput.value);
        const baseDelay = 1000 / speed;
        const delay = step.type === 'swap' ? Math.max(0, baseDelay - 150) : baseDelay;
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

async function animateSwap(index1, index2) {
    const bars = visualizer.querySelectorAll('.bar');
    if (index1 >= bars.length || index2 >= bars.length) return;
    
    const bar1 = bars[index1];
    const bar2 = bars[index2];
    
    // Add swapping class for visual effect
    bar1.classList.add('swapping');
    bar2.classList.add('swapping');
    
    // Calculate the distance to move
    const distance = (index2 - index1) * (bar1.offsetWidth + 2); // 2px for gap
    
    // Set consistent animation duration for smooth movement
    const speed = parseInt(speedInput.value);
    const animationDuration = speed < 50 ? 250 : 150; // Smooth animation regardless of speed
    
    bar1.style.transition = `transform ${animationDuration}ms ease-in-out`;
    bar2.style.transition = `transform ${animationDuration}ms ease-in-out`;
    
    // Apply transform for horizontal movement
    bar1.style.transform = `translateX(${distance}px)`;
    bar2.style.transform = `translateX(${-distance}px)`;
    
    // Wait for animation to complete
    await sleep(animationDuration);
    
    // Reset transforms
    bar1.style.transition = '';
    bar2.style.transition = '';
    bar1.style.transform = '';
    bar2.style.transform = '';
    bar1.classList.remove('swapping');
    bar2.classList.remove('swapping');
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

// Code Snippets for Different Languages
const codeSnippets = {
    bubble: {
        javascript: `function bubbleSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
    return arr;
}`,
        python: `def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr) - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
        java: `public static void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
        cpp: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
        c: `void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
        csharp: `public static void BubbleSort(int[] arr) {
    int n = arr.Length;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
        go: `func bubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n; i++ {
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
            }
        }
    }
}`
    },
    selection: {
        javascript: `function selectionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    return arr;
}`,
        python: `def selection_sort(arr):
    for i in range(len(arr)):
        min_idx = i
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
        java: `public static void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }
}`,
        cpp: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }
}`,
        c: `void selectionSort(int arr[], int n) {
    for (int i = 0; i < n; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }
}`,
        csharp: `public static void SelectionSort(int[] arr) {
    int n = arr.Length;
    for (int i = 0; i < n; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            int temp = arr[i];
            arr[i] = arr[minIdx];
            arr[minIdx] = temp;
        }
    }
}`,
        go: `func selectionSort(arr []int) {
    n := len(arr)
    for i := 0; i < n; i++ {
        minIdx := i
        for j := i + 1; j < n; j++ {
            if arr[j] < arr[minIdx] {
                minIdx = j
            }
        }
        if minIdx != i {
            arr[i], arr[minIdx] = arr[minIdx], arr[i]
        }
    }
}`
    },
    insertion: {
        javascript: `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`,
        python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
        java: `public static void insertionSort(int[] arr) {
    int n = arr.length;
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
        cpp: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
        c: `void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
        csharp: `public static void InsertionSort(int[] arr) {
    int n = arr.Length;
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
        go: `func insertionSort(arr []int) {
    n := len(arr)
    for i := 1; i < n; i++ {
        key := arr[i]
        j := i - 1
        for j >= 0 && arr[j] > key {
            arr[j+1] = arr[j]
            j--
        }
        arr[j+1] = key
    }
}`
    },
    merge: {
        javascript: `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            result.push(right[j++]);
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}`,
        python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
        java: `public static void mergeSort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = (left + right) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

private static void merge(int[] arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    int[] L = new int[n1];
    int[] R = new int[n2];
    
    System.arraycopy(arr, left, L, 0, n1);
    System.arraycopy(arr, mid + 1, R, 0, n2);
    
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }
    
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}`,
        cpp: `void merge(int arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    int L[n1], R[n2];
    
    for (int i = 0; i < n1; i++)
        L[i] = arr[left + i];
    for (int j = 0; j < n2; j++)
        R[j] = arr[mid + 1 + j];
    
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }
    
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}`,
        c: `void merge(int arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    int L[n1], R[n2];
    
    for (int i = 0; i < n1; i++)
        L[i] = arr[left + i];
    for (int j = 0; j < n2; j++)
        R[j] = arr[mid + 1 + j];
    
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }
    
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}`,
        csharp: `public static void MergeSort(int[] arr, int left, int right) {
    if (left < right) {
        int mid = (left + right) / 2;
        MergeSort(arr, left, mid);
        MergeSort(arr, mid + 1, right);
        Merge(arr, left, mid, right);
    }
}

private static void Merge(int[] arr, int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    
    int[] L = new int[n1];
    int[] R = new int[n2];
    
    Array.Copy(arr, left, L, 0, n1);
    Array.Copy(arr, mid + 1, R, 0, n2);
    
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k++] = L[i++];
        } else {
            arr[k++] = R[j++];
        }
    }
    
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}`,
        go: `func mergeSort(arr []int, left, right int) {
    if left < right {
        mid := (left + right) / 2
        mergeSort(arr, left, mid)
        mergeSort(arr, mid+1, right)
        merge(arr, left, mid, right)
    }
}

func merge(arr []int, left, mid, right int) {
    n1 := mid - left + 1
    n2 := right - mid
    
    L := make([]int, n1)
    R := make([]int, n2)
    
    copy(L, arr[left:mid+1])
    copy(R, arr[mid+1:right+1])
    
    i, j, k := 0, 0, left
    for i < n1 && j < n2 {
        if L[i] <= R[j] {
            arr[k] = L[i]
            i++
        } else {
            arr[k] = R[j]
            j++
        }
        k++
    }
    
    for i < n1 {
        arr[k] = L[i]
        i++
        k++
    }
    for j < n2 {
        arr[k] = R[j]
        j++
        k++
    }
}`
    },
    quick: {
        javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}`,
        python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
        java: `public static void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

private static int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    return i + 1;
}`,
        cpp: `int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
        c: `int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    
    return i + 1;
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
        csharp: `public static void QuickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = Partition(arr, low, high);
        QuickSort(arr, low, pi - 1);
        QuickSort(arr, pi + 1, high);
    }
}

private static int Partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    
    int temp2 = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp2;
    
    return i + 1;
}`,
        go: `func quickSort(arr []int, low, high int) {
    if low < high {
        pi := partition(arr, low, high)
        quickSort(arr, low, pi-1)
        quickSort(arr, pi+1, high)
    }
}

func partition(arr []int, low, high int) int {
    pivot := arr[high]
    i := low - 1
    
    for j := low; j < high; j++ {
        if arr[j] < pivot {
            i++
            arr[i], arr[j] = arr[j], arr[i]
        }
    }
    
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1
}`
    },
    heap: {
        javascript: `function heapSort(arr) {
    const n = arr.length;
    
    // Build max heap
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0);
    }
    return arr;
}

function heapify(arr, n, i) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        heapify(arr, n, largest);
    }
}`,
        python: `def heap_sort(arr):
    n = len(arr)
    
    # Build max heap
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    
    # Extract elements from heap
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    
    return arr

def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2
    
    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)`,
        java: `public static void heapSort(int[] arr) {
    int n = arr.length;
    
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
    }
}

private static void heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        heapify(arr, n, largest);
    }
}`,
        cpp: `void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
    }
}`,
        c: `void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        heapify(arr, n, largest);
    }
}

void heapSort(int arr[], int n) {
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
    }
}`,
        csharp: `public static void HeapSort(int[] arr) {
    int n = arr.Length;
    
    // Build max heap
    for (int i = n / 2 - 1; i >= 0; i--) {
        Heapify(arr, n, i);
    }
    
    // Extract elements from heap
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        Heapify(arr, i, 0);
    }
}

private static void Heapify(int[] arr, int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;
    
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }
    if (largest != i) {
        int temp = arr[i];
        arr[i] = arr[largest];
        arr[largest] = temp;
        Heapify(arr, n, largest);
    }
}`,
        go: `func heapSort(arr []int) {
    n := len(arr)
    
    // Build max heap
    for i := n/2 - 1; i >= 0; i-- {
        heapify(arr, n, i)
    }
    
    // Extract elements from heap
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        heapify(arr, i, 0)
    }
}

func heapify(arr []int, n, i int) {
    largest := i
    left := 2*i + 1
    right := 2*i + 2
    
    if left < n && arr[left] > arr[largest] {
        largest = left
    }
    if right < n && arr[right] > arr[largest] {
        largest = right
    }
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)
    }
}`
    }
};

const algorithmNames = {
    bubble: 'Bubble Sort',
    selection: 'Selection Sort',
    insertion: 'Insertion Sort',
    merge: 'Merge Sort',
    quick: 'Quick Sort',
    heap: 'Heap Sort'
};

const languageNames = {
    javascript: 'JavaScript',
    python: 'Python',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    go: 'Go'
};

function showCodeModal() {
    const algorithm = algorithmSelect.value;
    const language = languageSelect.value;
    
    const code = codeSnippets[algorithm][language];
    modalTitle.textContent = `${algorithmNames[algorithm]} - ${languageNames[language]}`;
    codeDisplay.textContent = code;
    
    // Apply syntax highlighting
    highlightCode();
    
    codeModal.classList.add('show');
}

function highlightCode() {
    const code = codeDisplay.textContent;
    const language = languageSelect.value;
    
    let highlighted = escapeHtml(code);
    
    // Comments first (before keywords)
    highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>');
    highlighted = highlighted.replace(/(#.*$)/gm, '<span class="comment">$1</span>');
    
    // Keywords
    const keywords = {
        javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'new', 'Math', 'floor'],
        python: ['def', 'if', 'else', 'elif', 'for', 'while', 'return', 'in', 'range', 'len'],
        java: ['public', 'static', 'void', 'int', 'if', 'else', 'for', 'while', 'return', 'new', 'private', 'System', 'arraycopy', 'Array', 'Copy'],
        c: ['void', 'int', 'if', 'else', 'for', 'while', 'return'],
        cpp: ['void', 'int', 'if', 'else', 'for', 'while', 'return'],
        csharp: ['public', 'static', 'void', 'int', 'if', 'else', 'for', 'while', 'return', 'new', 'private', 'Array', 'Copy'],
        go: ['func', 'if', 'else', 'for', 'return', 'range', 'make', 'copy', 'len']
    };
    
    const langKeywords = keywords[language] || [];
    langKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b(?![^<]*>)`, 'g');
        highlighted = highlighted.replace(regex, '<span class="keyword">$1</span>');
    });
    
    // Function names (words followed by parentheses)
    highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="function">$1</span>(');
    
    // Numbers
    highlighted = highlighted.replace(/\b(\d+)\b(?![^<]*>)/g, '<span class="number">$1</span>');
    
    // Operators
    highlighted = highlighted.replace(/([+\-*/%=<>!&|]+)(?![^<]*>)/g, '<span class="operator">$1</span>');
    
    // Strings
    highlighted = highlighted.replace(/(&quot;)(.*?)(&quot;)/g, '<span class="string">$1$2$3</span>');
    highlighted = highlighted.replace(/(&#39;)(.*?)(&#39;)/g, '<span class="string">$1$2$3</span>');
    
    // Type annotations (int[], int, etc. - but not in keywords)
    if (language === 'java' || language === 'c' || language === 'cpp' || language === 'csharp') {
        highlighted = highlighted.replace(/\b(int\[\]|int|float|double|char|bool|boolean)\b(?![^<]*>)/g, '<span class="type">$1</span>');
    }
    
    // Variable names in specific contexts (arr, n, temp, etc.)
    highlighted = highlighted.replace(/\b(arr|array|n|temp|key|pivot|left|right|mid|minIdx|maxIdx|largest|i|j|k|L|R|n1|n2|low|high|pi)\b(?![^<]*>)/g, '<span class="variable">$1</span>');
    
    codeDisplay.innerHTML = highlighted;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
