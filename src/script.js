
const barContainer = document.querySelector('#barContainer');
const container = document.querySelector('.container');
let numbers = [];
let sortedNumbers = [];
let bars;
let sortingSpeed;
let currentState = "initial";
let currentAlgorithm;

document.addEventListener('DOMContentLoaded', hideBarContainer);

const generateBtn = document.querySelector('#generateBtn');
const startBtn = document.querySelector('#start');
const pauseBtn = document.querySelector('#pause');
const resumeBtn = document.querySelector("#resume");
const endBtn = document.querySelector("#end");

generateBtn.addEventListener('click', generateBars);
startBtn.addEventListener("click", startSorting);
pauseBtn.addEventListener("click", pauseSorting);
resumeBtn.addEventListener("click", resumeSorting);
endBtn.addEventListener("click", endSorting);

speedInput = document.querySelector("#speed");
speedInput.addEventListener("input", () => {
    sortingSpeed = parseInt(speedInput.value);
});

window.addEventListener('resize', resizeBars);

function hideBarContainer() {
    barContainer.style.display = "none";
}

function showBarContainer() {
    barContainer.style.display = "flex";
}

function generateNumbers() {
    numbers = [];
    const barCount = document.querySelector("#barCount");
    const upperLimit = 300;
    let numBars = parseInt(barCount.value);
    for (let i = 0; i < numBars; i++) {
        numbers.push(Math.floor(Math.random() * upperLimit) + 1);
    }
}
function createBar(width, height, maxValue) {
    const bar = document.createElement("div");
    bar.style.width = `${width}px`;
    bar.style.height = `${height}px`
    bar.style.margin = `${maxValue - height}px 1px 1px 1px`;
    bar.className = "bar";
    barContainer.appendChild(bar);
}

function generateBars() {
    generateNumbers();
    let numBars = numbers.length;
    let containerWidth = container.clientWidth;
    let width = Math.floor(0.7 * containerWidth / numBars);
    barContainer.innerHTML = "";
    currentState = "initial";
    

    let maxValue = Math.max(...numbers);
    

    for (let i = 0; i < numBars; i++) {
        createBar(width, numbers[i], maxValue);
    }
    showBarContainer();
}

function resizeBars() {
    let numBars = numbers.length;
    let containerWidth = container.clientWidth;
    let width;
    
    if (numBars > 0) {
        width = Math.floor(0.7 * containerWidth / numBars);
        bars = document.querySelectorAll(".bar");
        bars.forEach(bar => {
            bar.style.width = `${width}px`;
        })

    }
}



function getCurrentAlgorithm() {
    const algorithms = document.getElementsByName("sortingAlgorithm");
    for (let algorithm of algorithms) {
        if (algorithm.checked) {
            return algorithm.value;
        }
    }
}


async function startSorting() {
    if(currentState === "sorted"){
        endSorting();
        await sleep(2000);
    }

    if (currentState !== "initial") {
        return;
    }
    
    currentAlgorithm = getCurrentAlgorithm();
    switch(currentAlgorithm) {
        case "bubbleSort":
            await startBubbleSort();
            break;
        case "heapSort":
            await startHeapSort();
            break;
        case "mergeSort":
            await startMergeSort();
            break;
        case "quickSort":
            await startQuickSort();
    }
    
}

async function pauseSorting() {
    if (currentState !== "running") {
        return;
    }
    switch(currentAlgorithm) {
        case "bubbleSort":
            await pauseBubbleSort();
            break;
        case "heapSort":
            await pauseHeapSort();
            break;
        case "mergeSort":
            await pauseMergeSort();
            break;
        case "quickSort":
            await pauseQuickSort();
    }
    currentState = "onhold";
}

async function resumeSorting() {
    if (currentState !== "onhold") {
        return;
    }
    switch(currentAlgorithm) {
        case "bubbleSort":
            await resumeBubbleSort();
            break;
        case "heapSort":
            await resumeHeapSort();
            break;
        case "mergeSort":
            await resumeMergeSort();
            break;
        case "quickSort":
            await resumeQuickSort();
    }
    currentState = "running";
}

function endSorting() {
    if (currentState === "onhold" || currentState === "running" || currentState === "sorted") {
        currentState = "initial";
        
        let numBars = numbers.length;
        let containerWidth = container.clientWidth;
        let width = Math.floor(0.7 * containerWidth / numBars);
        barContainer.innerHTML = "";

        let maxValue = Math.max(...numbers);
        for (let i = 0; i < numBars; i++) {
            createBar(width, numbers[i], maxValue);
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startBubbleSort() {

    currentState = "running";
    let maxValue = Math.max(...numbers);
    // Use sortedNumbers to sort numbers, numbers change only when generateNewArray is clicked.
    // This helps sorting the same order of numbers to be sorted using different algorithms.
    sortedNumbers = [...numbers]; 
    bars = document.querySelectorAll(".bar");

    let barArray = Array.from(bars);
    
    for(let i = 0; i < sortedNumbers.length - 1; i++) {
        for(let j = 0; j < sortedNumbers.length - i - 1; j++) {
            // smaller the speed, bigger the delay
            delay = 20 * (101 - sortingSpeed); 
            // red bars when compared
            barArray[j].classList.add("comparing");
            barArray[j + 1].classList.add("comparing");
            await sleep(delay);
            // If the current bar is greater than the next one, swap them
            if(sortedNumbers[j] > sortedNumbers[j + 1]){
                
                temp = sortedNumbers[j];
                sortedNumbers[j] = sortedNumbers[j + 1];
                sortedNumbers[j + 1] = temp;

                // Update the height and margin of the bars for visualization
                barArray[j].style.height = `${sortedNumbers[j]}px`;
                barArray[j + 1].style.height = `${sortedNumbers[j + 1]}px`;
                barArray[j].style.margin = `${maxValue -sortedNumbers[j]}px 1px 1px 1px`;
                barArray[j + 1].style.margin = `${maxValue - sortedNumbers[j + 1]}px 1px 1px 1px`;
                
                // If two bars are swapped, turn them to yellow temporarily
                barArray[j].classList.add("swapping");
                barArray[j + 1].classList.add("swapping");
                await sleep(delay);
                barArray[j].classList.remove("swapping");
                barArray[j + 1].classList.remove("swapping");
                
            }
            // Check if the sorting process is put on hold
            if (currentState === "onhold") {
                await new Promise(resolve => {
                    // Wait until the sorting is resumed
                    const checkPause = () => {
                        if (currentState !== "onhold") {
                            resolve();
                        } else {
                            // Continue checking until sorting is resumed
                            requestAnimationFrame(checkPause);
                        }
                    };
                    
                    requestAnimationFrame(checkPause);
                });
            }
            barArray[j].classList.remove("comparing");
            barArray[j + 1].classList.remove("comparing");
            
        }
        // Mark the last element as sorted in each pass
        barArray[sortedNumbers.length - i - 1].classList.add("sorted");
    }
    //Only one element is left, and it's sorted.
    barArray[0].classList.add("sorted");
    currentState = "sorted";
}



async function pauseBubbleSort() {
    currentState = "onhold";
}

async function resumeBubbleSort() {
    currentState = "running";
}