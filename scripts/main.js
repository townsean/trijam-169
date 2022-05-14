const MAX_ROW_COUNT = 8;
const MAX_COLUMN_COUNT = 8;
const MAX_PLANT_STAGE = 3;

function generateGameTable(rowCount, columnCount) {
    const gameTable = document.getElementById('game-table');

    for(let row = 0; row < rowCount; row++) {
        const tr = document.createElement('tr');
        for(let col = 0; col < columnCount; col++) {
            const td = document.createElement('td');
            td.id = `${row}-${col}`;

            const div = document.createElement('div');
            div.innerHTML = 'hi';
            div.classList.add('game-cell');

            td.appendChild(div);
            tr.appendChild(td);
        }

        gameTable.appendChild(tr);
    }   
}

function createGameMatrix(rowCount, columnCount) {
    let matrix = new Array(rowCount);

    for(let row = 0; row < rowCount; row++) {
        matrix[row] = new Array(columnCount);
    }

    return matrix;
}

function startGame(matrix) {
    let isGameOver = false;
    let isMusicPlaying = false;
    let player = {
        row: 1,
        col: 1
    };

    // Initialize player starting position
    updatePlayerPosition(matrix, player, player.row, player.col);

    document.addEventListener('keydown', (event) => {
        if(event.repeat) {
            return;
        }

        // temp position
        if(!isMusicPlaying) {
            playSound('assets/sounds/soundtrack.wav', true);
            isMusicPlaying = true;
        }
    
        switch(event.key) {
            case "ArrowDown":
            case "s":
                if (player.row + 1 < MAX_ROW_COUNT && matrix[player.row + 1][player.col] != MAX_PLANT_STAGE) {
                    updatePlayerPosition(matrix, player, player.row + 1, player.col);
                }
                break;
            case "ArrowUp":
            case "w":
                if (player.row - 1 >= 0 && matrix[player.row - 1][player.col] != MAX_PLANT_STAGE) {
                    updatePlayerPosition(matrix, player, player.row - 1, player.col);
                }
                break;
            case "ArrowLeft":
            case "a":
                if (player.col - 1 >= 0 && matrix[player.row][player.col - 1] != MAX_PLANT_STAGE) {
                    updatePlayerPosition(matrix, player, player.row, player.col - 1);
                }
                break;
            case "ArrowRight":
            case "d":
                if (player.col + 1 < MAX_COLUMN_COUNT && matrix[player.row][player.col + 1] != MAX_PLANT_STAGE) {
                    updatePlayerPosition(matrix, player, player.row, player.col + 1);
                }
                break;
            default:
                return;
        }
    
        event.preventDefault();
    }, true);
    

    const intervalId = setInterval(() => {
        if (isGameOver) {
            clearInterval(intervalId);
            return;
        }

        let row = getRandomInt(0, MAX_ROW_COUNT);
        let col = getRandomInt(0, MAX_COLUMN_COUNT);

        if(!matrix[row][col]) {
            matrix[row][col] = 1;

            let td = document.getElementById(`${row}-${col}`);
            td.innerHTML = 'ho';
            td.classList.add('plant-stage-1');

            growPlant(matrix, row, col);
        }

    }, 500);
}

function updatePlayerPosition(matrix, player, row, col) {
    // clear previous player position
    matrix[player.row][player.col] = null;
    let playerTd = document.getElementById(`${player.row}-${player.col}`);
    if(playerTd) {
        playerTd.classList.remove('player');
    }

    // update to new player position
    player.row = row;
    player.col = col;
    playerTd = document.getElementById(`${player.row}-${player.col}`);

    // if monster inside cell
    if(matrix[player.row][player.col]) {
        playerTd.setAttribute("class", "")

    } 
        
    playerTd.classList.add('player');

    // update player position in matrix
    matrix[player.row][player.col] = player;
}

function growPlant(matrix, row, col) {
    if(matrix[row][col] != MAX_PLANT_STAGE && matrix[row][col] && Number.isInteger(matrix[row][col])) {
        setTimeout(() => {

            if(matrix[row][col] != MAX_PLANT_STAGE && matrix[row][col] && Number.isInteger(matrix[row][col])) {

                console.log('how', matrix[row][col]);
                matrix[row][col]++;
                let plant = document.getElementById(`${row}-${col}`);
                plant.classList.replace(`plant-stage-${matrix[row][col] - 1}`, `plant-stage-${matrix[row][col]}`)
                
                if(matrix[row][col] != MAX_PLANT_STAGE) {
                    growPlant(matrix, row, col);
                }
            }
        }, 2000);
    }
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
function playSound(url, loop = false) {
    const audio = new Audio();
    audio.src = url;
    audio.loop = loop;
    audio.play();
}

function main() {
    generateGameTable(MAX_ROW_COUNT, MAX_COLUMN_COUNT);
    let matrix = createGameMatrix(MAX_ROW_COUNT, MAX_COLUMN_COUNT);

    startGame(matrix);
}

main();