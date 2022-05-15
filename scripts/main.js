/**
 * This is not beautiful code
 */
const MAX_ROW_COUNT = 8;
const MAX_COLUMN_COUNT = 8;
const MAX_PLANT_STAGE = 3;
const MAX_IMPASSABLE_PLANT_COUNT = (MAX_ROW_COUNT * MAX_COLUMN_COUNT) / 4;

/**
 * Generate game table
 * @param {*} rowCount 
 * @param {*} columnCount 
 */
function generateGameTable(rowCount, columnCount) {
    const gameTable = document.getElementById('game-table');
    gameTable.innerHTML = '';

    for(let row = 0; row < rowCount; row++) {
        const tr = document.createElement('tr');
        for(let col = 0; col < columnCount; col++) {
            const td = document.createElement('td');
            td.id = `td-${row}-${col}`;

            const div = document.createElement('div');
            div.id = `${row}-${col}`;
            div.classList.add('game-cell');

            td.appendChild(div);
            tr.appendChild(td);
        }

        gameTable.appendChild(tr);
    }   
}

/**
 * Generate game matrix for tracking player and plant positions
 * @param {*} rowCount 
 * @param {*} columnCount 
 * @returns 
 */
function createGameMatrix(rowCount, columnCount) {
    let matrix = new Array(rowCount);

    for(let row = 0; row < rowCount; row++) {
        matrix[row] = new Array(columnCount);
    }

    return matrix;
}

/**
 * Start game
 * @param {*} matrix 
 */
function startGame() {
    generateGameTable(MAX_ROW_COUNT, MAX_COLUMN_COUNT);

    _gameState = {
        isGameOver: false,
        impassablePlantCount: 0,
        matrix: createGameMatrix(MAX_ROW_COUNT, MAX_COLUMN_COUNT),
        playerRow: 1,
        playerCol: 1
    };

    // Initialize player starting position
    updatePlayerPosition(_gameState.playerRow, _gameState.playerCol);

    // Initialize population label
    let populationLabel = document.getElementById('max-population-label');
    populationLabel.innerHTML = `${_gameState.impassablePlantCount}/${MAX_IMPASSABLE_PLANT_COUNT}`;

    // Initialize time remaining label
    let elaspedTimeLabel = document.getElementById('elasped-time-label');
    elaspedTimeLabel.innerHTML = '00:00';
    
    // Create interval for triggering plant growth
    const plantGrowthIntervalId = setInterval(() => {
        if (_gameState.isGameOver) {
            clearInterval(plantGrowthIntervalId);
            return;
        }

        let row = getRandomInt(0, MAX_ROW_COUNT);
        let col = getRandomInt(0, MAX_COLUMN_COUNT);

        if(!_gameState.matrix[row][col]) {
            _gameState.matrix[row][col] = 1;

            let div = document.getElementById(`${row}-${col}`);
            div.classList.add('plant-stage-1');

            growPlant(_gameState.matrix, row, col);
        }
    }, 500);

    const startTime = moment();

    // Start incrementing current time label
    const timeRemainingIntervalId = setInterval(() => {
        if (_gameState.isGameOver) {
            clearInterval(timeRemainingIntervalId);
            return;
        }
        
        const elaspedTime = moment(moment().diff(startTime));

        let elaspedTimeLabel = document.getElementById('elasped-time-label');
        elaspedTimeLabel.innerHTML = elaspedTime.format('mm:ss');
    }, 1000);
}

function updatePlayerPosition(row, col) {
    // clear previous player position
    _gameState.matrix[_gameState.playerRow][_gameState.playerCol] = null;
    let playerTd = document.getElementById(`${_gameState.playerRow}-${_gameState.playerCol}`);
    if(playerTd) {
        playerTd.classList.remove('player');
    }

    // update to new player position
    _gameState.playerRow = row;
    _gameState.playerCol = col;
    playerTd = document.getElementById(`${_gameState.playerRow}-${_gameState.playerCol}`);

    // if monster inside cell, clear it
    if(_gameState.matrix[_gameState.playerRow][_gameState.playerCol]) {
        playerTd.setAttribute("class", "")
        playSound('assets/sounds/eat.wav');
    } 
        
    playerTd.classList.add('player');

    // update player position in matrix
    _gameState.matrix[_gameState.playerRow][_gameState.playerCol] =  { row: _gameState.playerRow, col: _gameState.playerCol };
}

/**
 * Increase plant growth in timed intervals
 * @param {*} matrix 
 * @param {*} row 
 * @param {*} col 
 */
function growPlant(matrix, row, col) {
    if(canPlantGrow(matrix[row][col])) {
        setTimeout(() => {
            if(canPlantGrow(matrix[row][col])) {
                matrix[row][col]++;
                let plant = document.getElementById(`${row}-${col}`);
                plant.classList.replace(`plant-stage-${matrix[row][col] - 1}`, `plant-stage-${matrix[row][col]}`)
                
                if(matrix[row][col] != MAX_PLANT_STAGE) {
                    growPlant(matrix, row, col);
                } else {
                    let plantTd = document.getElementById(`td-${row}-${col}`);
                    plantTd.classList.add('impassable');

                    _gameState.impassablePlantCount++;

                    let populationLabel = document.getElementById('max-population-label');
                    populationLabel.innerHTML = `${_gameState.impassablePlantCount}/${MAX_IMPASSABLE_PLANT_COUNT}`;

                    // End game if plant population is overgrown
                    if(_gameState.impassablePlantCount == MAX_IMPASSABLE_PLANT_COUNT) {
                        _gameState.isGameOver = true;
                        let elaspedTimeLabel = document.getElementById('elasped-time-label');
                        elaspedTimeLabel.classList.add('flashing-red');
                        populationLabel.classList.add('flashing-red');

                        // Show restart game screen
                        const overlay = document.getElementById('end-game-table-overlay');
                        overlay.classList.remove('hidden');
                    }
                }
            }
        }, 2000);
    }
}

/**
 * Determines whether or not plant is valid and can grow
 * @param {*} plant 
 * @returns 
 */
function canPlantGrow(plant) {
    return plant != MAX_PLANT_STAGE && plant && Number.isInteger(plant) && !_gameState.isGameOver;
}

/**
 * Gets a random number between min (inclusive) and max (exclusive)
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values
 * @param {*} min Minimum number
 * @param {*} max Maximum number
 * @returns A random number between min and max
 */
 function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Play the sound file at the specified location
 * @param {*} url 
 * @param {*} loop 
 */
function playSound(url, volume = 1, loop = false) {
    const audio = new Audio();
    audio.src = url;
    audio.volume = volume;
    audio.loop = loop;
    audio.play();
}

/**
 * 
 * @param {*} event 
 * @returns 
 */
function onKeydown(event) {
    switch(event.key) {
        case "ArrowDown":
        case "s":
        case "S":
            if (_gameState.playerRow + 1 < MAX_ROW_COUNT && _gameState.matrix[_gameState.playerRow + 1][_gameState.playerCol] != MAX_PLANT_STAGE) {
                updatePlayerPosition(_gameState.playerRow + 1, _gameState.playerCol);
            } else {
                playSound('assets/sounds/bump.wav');
            }
            break;
        case "ArrowUp":
        case "w":
        case "W":
            if (_gameState.playerRow - 1 >= 0 && _gameState.matrix[_gameState.playerRow - 1][_gameState.playerCol] != MAX_PLANT_STAGE) {
                updatePlayerPosition(_gameState.playerRow - 1, _gameState.playerCol);
            } else {
                playSound('assets/sounds/bump.wav');
            }
            break;
        case "ArrowLeft":
        case "a":
        case "A":
            if (_gameState.playerCol - 1 >= 0 && _gameState.matrix[_gameState.playerRow][_gameState.playerCol - 1] != MAX_PLANT_STAGE) {
                updatePlayerPosition(_gameState.playerRow, _gameState.playerCol - 1);
            } else {
                playSound('assets/sounds/bump.wav');
            }
            break;
        case "ArrowRight":
        case "d":
        case "D":
            if (_gameState.playerCol + 1 < MAX_COLUMN_COUNT && _gameState.matrix[_gameState.playerRow][_gameState.playerCol + 1] != MAX_PLANT_STAGE) {
                updatePlayerPosition(_gameState.playerRow, _gameState.playerCol + 1);
            } else {
                playSound('assets/sounds/bump.wav');
            }
            break;
        default:
            return;
    }
}

/**
 * Main
 */
function main() {
    generateGameTable(MAX_ROW_COUNT, MAX_COLUMN_COUNT);

    // Initialize population label
    let populationLabel = document.getElementById('max-population-label');
    populationLabel.innerHTML = `0/${MAX_IMPASSABLE_PLANT_COUNT}`;

    // Initialize time remaining label
    let elaspedTimeLabel = document.getElementById('elasped-time-label');
    elaspedTimeLabel.innerHTML = '00:00';

    const startButton = document.getElementById('start-button');
    startButton.addEventListener("click", () => {
        playSound('assets/sounds/soundtrack.wav', 0.75, true);

        const overlay = document.getElementById('start-game-table-overlay');
        overlay.classList.add('hidden');

        startGame();

        document.addEventListener('keydown', onKeydown, true);
    });

    const restartButton = document.getElementById('restart-button');
    restartButton.addEventListener("click", () => {
        let populationLabel = document.getElementById('max-population-label');
        populationLabel.classList.remove('flashing-red');

        let elaspedTimeLabel = document.getElementById('elasped-time-label');
        elaspedTimeLabel.classList.remove('flashing-red');

        const overlay = document.getElementById('end-game-table-overlay');
        overlay.classList.add('hidden');

        startGame();
    });
}

let _gameState = {};

main();