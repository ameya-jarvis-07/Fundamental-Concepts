from flask import Flask, request, jsonify
from flask_cors import CORS
import copy

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

class SortingVisualizer:
    def __init__(self, array):
        self.array = array
        self.steps = []
    
    def add_step(self, step_type, comparing=None, swapping=None, sorted_indices=None):
        """Add a step to the visualization"""
        step = {
            'array': copy.deepcopy(self.array),
            'type': step_type,
            'comparing': comparing or [],
            'swapping': swapping or [],
            'sorted': sorted_indices or []
        }
        self.steps.append(step)
    
    def bubble_sort(self):
        """Bubble Sort Algorithm"""
        n = len(self.array)
        for i in range(n):
            for j in range(0, n - i - 1):
                # Compare adjacent elements
                self.add_step('compare', comparing=[j, j + 1])
                
                if self.array[j] > self.array[j + 1]:
                    # Swap elements
                    self.array[j], self.array[j + 1] = self.array[j + 1], self.array[j]
                    self.add_step('swap', swapping=[j, j + 1])
            
            # Mark last i elements as sorted
            self.add_step('sorted', sorted_indices=list(range(n - i - 1, n)))
        
        return self.steps
    
    def selection_sort(self):
        """Selection Sort Algorithm"""
        n = len(self.array)
        
        for i in range(n):
            min_idx = i
            
            for j in range(i + 1, n):
                # Compare to find minimum
                self.add_step('compare', comparing=[min_idx, j])
                
                if self.array[j] < self.array[min_idx]:
                    min_idx = j
            
            # Swap minimum element with first unsorted element
            if min_idx != i:
                self.array[i], self.array[min_idx] = self.array[min_idx], self.array[i]
                self.add_step('swap', swapping=[i, min_idx])
            
            # Mark sorted portion
            self.add_step('sorted', sorted_indices=list(range(i + 1)))
        
        return self.steps
    
    def insertion_sort(self):
        """Insertion Sort Algorithm"""
        n = len(self.array)
        
        for i in range(1, n):
            key = self.array[i]
            j = i - 1
            
            self.add_step('compare', comparing=[i])
            
            while j >= 0 and self.array[j] > key:
                self.add_step('compare', comparing=[j, j + 1])
                
                self.array[j + 1] = self.array[j]
                self.add_step('swap', swapping=[j, j + 1])
                
                j -= 1
            
            self.array[j + 1] = key
            self.add_step('sorted', sorted_indices=list(range(i + 1)))
        
        return self.steps
    
    def merge_sort(self):
        """Merge Sort Algorithm"""
        def merge(left, right, start_idx):
            result = []
            i = j = 0
            
            while i < len(left) and j < len(right):
                self.add_step('compare', comparing=[start_idx + i, start_idx + len(left) + j])
                
                if left[i] <= right[j]:
                    result.append(left[i])
                    i += 1
                else:
                    result.append(right[j])
                    j += 1
            
            result.extend(left[i:])
            result.extend(right[j:])
            
            # Update the main array
            for k, val in enumerate(result):
                self.array[start_idx + k] = val
                self.add_step('swap', swapping=[start_idx + k])
            
            return result
        
        def merge_sort_recursive(arr, start_idx):
            if len(arr) <= 1:
                return arr
            
            mid = len(arr) // 2
            left = merge_sort_recursive(arr[:mid], start_idx)
            right = merge_sort_recursive(arr[mid:], start_idx + mid)
            
            return merge(left, right, start_idx)
        
        merge_sort_recursive(self.array, 0)
        self.add_step('sorted', sorted_indices=list(range(len(self.array))))
        
        return self.steps
    
    def quick_sort(self):
        """Quick Sort Algorithm"""
        def partition(low, high):
            pivot = self.array[high]
            i = low - 1
            
            for j in range(low, high):
                self.add_step('compare', comparing=[j, high])
                
                if self.array[j] < pivot:
                    i += 1
                    self.array[i], self.array[j] = self.array[j], self.array[i]
                    self.add_step('swap', swapping=[i, j])
            
            self.array[i + 1], self.array[high] = self.array[high], self.array[i + 1]
            self.add_step('swap', swapping=[i + 1, high])
            
            return i + 1
        
        def quick_sort_recursive(low, high):
            if low < high:
                pi = partition(low, high)
                quick_sort_recursive(low, pi - 1)
                quick_sort_recursive(pi + 1, high)
        
        quick_sort_recursive(0, len(self.array) - 1)
        self.add_step('sorted', sorted_indices=list(range(len(self.array))))
        
        return self.steps
    
    def heap_sort(self):
        """Heap Sort Algorithm"""
        def heapify(n, i):
            largest = i
            left = 2 * i + 1
            right = 2 * i + 2
            
            if left < n:
                self.add_step('compare', comparing=[largest, left])
                if self.array[left] > self.array[largest]:
                    largest = left
            
            if right < n:
                self.add_step('compare', comparing=[largest, right])
                if self.array[right] > self.array[largest]:
                    largest = right
            
            if largest != i:
                self.array[i], self.array[largest] = self.array[largest], self.array[i]
                self.add_step('swap', swapping=[i, largest])
                heapify(n, largest)
        
        n = len(self.array)
        
        # Build max heap
        for i in range(n // 2 - 1, -1, -1):
            heapify(n, i)
        
        # Extract elements from heap
        for i in range(n - 1, 0, -1):
            self.array[0], self.array[i] = self.array[i], self.array[0]
            self.add_step('swap', swapping=[0, i])
            self.add_step('sorted', sorted_indices=list(range(i, n)))
            heapify(i, 0)
        
        self.add_step('sorted', sorted_indices=list(range(len(self.array))))
        
        return self.steps

@app.route('/sort', methods=['POST'])
def sort_array():
    """Endpoint to receive array and return sorting steps"""
    try:
        data = request.get_json()
        array = data.get('array', [])
        algorithm = data.get('algorithm', 'bubble')
        
        if not array:
            return jsonify({'error': 'Array is empty'}), 400
        
        # Create visualizer instance
        visualizer = SortingVisualizer(array)
        
        # Execute the selected sorting algorithm
        if algorithm == 'bubble':
            steps = visualizer.bubble_sort()
        elif algorithm == 'selection':
            steps = visualizer.selection_sort()
        elif algorithm == 'insertion':
            steps = visualizer.insertion_sort()
        elif algorithm == 'merge':
            steps = visualizer.merge_sort()
        elif algorithm == 'quick':
            steps = visualizer.quick_sort()
        elif algorithm == 'heap':
            steps = visualizer.heap_sort()
        else:
            return jsonify({'error': 'Invalid algorithm'}), 400
        
        return jsonify({
            'steps': steps,
            'algorithm': algorithm
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    print("Starting Sorting Visualizer Backend Server...")
    print("Server running on http://localhost:5000")
    print("Open index.html in your browser to use the visualizer")
    app.run(debug=True, port=5000)
