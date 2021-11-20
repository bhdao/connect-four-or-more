const boardContainer = document.querySelector("#boardContainer");

boardContainer.addEventListener("click", (e) => {
  if (e.target.classList == "UI boardSlot" && GAMEOVER == 0) {
    const slotNum = parseInt(e.target.dataset.column);
    addPieceHandler(slotNum);
  };
});

let playerTurn = Math.round(Math.random()) + 1;

let GAMEOVER = -1;
let boardData;

//Checks if there is already a board
//Eventually to be used to reset/create a new board based on specified dimensions
const BoardCheck = () => {
  if (boardContainer.children)
    if (boardContainer.children[0]) {
      return false;
    } else {
      return false;
    }
}

//Sets up the board arrays
const arrayHandler = (rows, columns) => {
  const fullBoard = Array(rows);
  fullBoard.fill("x");
  let row = Array(columns).fill("x");
  return fullBoard.map(x => [...row]);
}

//Returns single styled element for player piece to rest in
const createBoardSlot = (i, type) => {
  const slot = document.createElement('div');
  slot.dataset.column = i;
  if (type) {
    slot.classList.toggle("UI");
  };
  slot.classList.toggle("boardSlot");
  return slot;
};

//Returns a single row with row number data attribute and number of board slots according to expected number of columns as argument
const createBoardRow = (columns, i, type) => {
  const row = document.createElement('div');
  for (let i = 0; i < columns; i++) {
    row.appendChild(createBoardSlot(i, type));
  }
  if (type == "UI") {
    row.id = "UIrow";
    return row;
  }
  row.classList.toggle("boardRow");
  if (type == "spacer") {
    row.id = "spacer";
    return row;
  }
  row.dataset.row = i;
  return row;
};

const makeBoard = (rows = 6, columns = 7) => {
  BoardCheck();
  let boardBody = document.createElement('div');
  boardBody.id = "boardBody";

  boardBody.appendChild(createBoardRow(columns, undefined, "UI"))
  boardBody.appendChild(createBoardRow(columns, undefined, "spacer"));

  boardData = arrayHandler(rows, columns);

  for (let i = 0; i < rows; i++) {
    boardBody.appendChild(createBoardRow(columns, i));
  }
  boardContainer.appendChild(boardBody);

};

makeBoard();

let boardRows = document.querySelectorAll('.boardRow:not([id="spacer"])');

const addPieceHandler = (column) => {
  let columnPieceCount = boardData.reduce((acc, next) => {
    if (typeof (next[column]) == "object") {
      acc++;
    }
    return acc;
  }, 0);

  if (columnPieceCount >= boardData.length) {
    return
  }

  //Gets id of the lowest empty row
  //Example: 
  //[
  //  [0, 1, 0, 0]
  //  [0, 0, 0, 0]
  //  [0, 0, 0, 0]
  //]
  //3 - 1 - 1 = 1 ⬅ this is the index of the row to place the piece in
  let rowIdx = boardData.length - 1 - columnPieceCount;

  // UI side
  let piece = document.createElement('div');
  piece.classList.toggle("checked");
  piece.classList.toggle(`p${playerTurn}`);
  boardRows[rowIdx].childNodes[column].appendChild(piece);
  UIhoverslots[column].classList = "UI boardSlot"

  //Data side
  boardData[rowIdx][column] = { player: playerTurn };

  let matchedPieces = 1;
  matchedPieces += checkMatchingSides(playerTurn, rowIdx, column);
  matchedPieces += checkMatchingDown(playerTurn, rowIdx, column);
  matchedPieces += checkDiagonal(playerTurn, rowIdx, column, "left");
  matchedPieces += checkDiagonal(playerTurn, rowIdx, column, "right");


  setTimeout(checkWin, 10, matchedPieces);

  if (playerTurn == 1) {
    playerTurn = 2;
  } else {
    playerTurn = 1;
  };
  UIhoverslots[column].classList = "UI boardSlot";
  turnUIhandler();
}

const checkMatchingSides = (currentPlayer, row, column) => {
  let checkedRow = boardData[row];
  let matched = 0;
  let nextColumn = column;

  const check = (direction) => {
    if (nextColumn >= 0 &&
      nextColumn < boardData[row].length) {
      if (direction == "left") {
        nextColumn -= 1;
      } else if (direction == "right") {
        nextColumn += 1;
      }
      if (typeof (checkedRow[nextColumn]) == "object") {
        if (checkedRow[nextColumn].player == currentPlayer) {
          matched += 1;
          check(direction)
        }
      };
    }
  };
  //Check num pieces matching left and reset column pointer
  check("left");
  nextColumn = column;

  //Check num pieces matching right
  check("right");
  if (matched >= 3) {
    return matched;
  } else { return 0 };
}

const checkMatchingDown = (currentPlayer, row, column) => {
  let matched = 0;
  let nextRow = row + 1;
  const check = () => {
    if (nextRow < boardData.length) {
      if (typeof (boardData[nextRow][column]) == "object") {
        if (boardData[nextRow][column].player == currentPlayer) {
          matched += 1;
          nextRow += 1;
          check();
        }
      }
    }
  }
  check();
  if (matched >= 3) {
    return matched;
  } else { return 0 }
}

const checkDiagonal = (currentPlayer, row, column, diagonal) => {
  const check = (diagonal) => {
    let nextColumn = column;
    let nextRow = row;
    let diagonalMatch = 0;

    //check upper left loop
    const checkUpper = (diagonal) => {
      if (diagonal == "left") {
        nextColumn -= 1;
      } else if (diagonal == "right") {
        nextColumn += 1;
      }
      nextRow -= 1;
      if (
        nextColumn >= 0 &&
        nextColumn < boardData[row].length &&
        nextRow >= 0 &&
        nextRow < boardData.length
      ) {
        if (boardData[nextRow][nextColumn].player == currentPlayer) {
          diagonalMatch++
          checkUpper(diagonal);
        }
      }
    };

    const checkLower = (diagonal) => {
      if (diagonal == "left") {
        nextColumn += 1;
      } else if (diagonal == "right") {
        nextColumn -= 1;
      }
      nextRow += 1;
      if (
        nextColumn >= 0 &&
        nextColumn < boardData[row].length &&
        nextRow >= 0 &&
        nextRow < boardData.length
      ) {
        if (boardData[nextRow][nextColumn].player == currentPlayer) {
          diagonalMatch++
          checkLower(diagonal);
        }
      }
    }
    checkUpper(diagonal)
    nextColumn = column;
    nextRow = row;
    checkLower(diagonal)
    return diagonalMatch;
  }
  matched = check(diagonal);
  if (matched >= 3) {
    return matched;
  } else {
    return 0;
  }
};

const checkWin = (matchedPieces) => {
  let color = playerTurn == 1 ? "Hot Pink" : "Turquoise";
  if (matchedPieces >= 4) {
    window.alert(`Connect ${matchedPieces}! ${color} wins!!`)
    const player = color == "Turquoise" ? 1 : 3;
    let scoreSelector = parseInt(document.querySelector("#scores").childNodes[player].textContent);
    document.querySelector("#scores").childNodes[player].textContent = scoreSelector += 1;
    GAMEOVER = !GAMEOVER;
  };
}

let UIhoverslots = document.querySelectorAll("#spacer>.UI.boardSlot");

boardContainer.addEventListener("mouseover", (e) => {
  if (e.target.classList == "UI boardSlot" && GAMEOVER == 0) {
    const column = parseInt(e.target.dataset.column);
    UIhoverslots[column].classList.add(`p${playerTurn}`)
  };
});

boardContainer.addEventListener("mouseout", (e) => {
  if (e.target.classList == "UI boardSlot" && GAMEOVER == 0) {
    const column = parseInt(e.target.dataset.column);
    UIhoverslots[column].classList.remove(`p${playerTurn}`)
  };
});

let turnIndicator = document.querySelector("#turnIndicator");

const turnUIhandler = () => {
  if (GAMEOVER == -1) {
    GAMEOVER = 0;
  };
  turnIndicator.classList = "";
  turnIndicator.classList.add(`p${playerTurn}`);
  let player;
  if (playerTurn == 1) {
    player = "Turquoise"
  } else {
    player = "Hot Pink"
  }
  turnIndicator.textContent = `It is ${player}'s turn!`;
}

turnUIhandler();

const newGame = (row, columns) => {
  playerTurn = Math.round(Math.random()) + 1;
  turnUIhandler();
  document.querySelector("#boardBody").remove();
  boardData = 0;
  makeBoard();
  boardRows = document.querySelectorAll('.boardRow:not([id="spacer"])')
  UIhoverslots = document.querySelectorAll("#spacer>.UI.boardSlot");
  GAMEOVER = 0;
}

document.querySelector("#Restart").addEventListener("click", newGame);