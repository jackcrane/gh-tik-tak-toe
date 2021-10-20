const game = () => {
  let table = [
    0, 0, 0, 0, 0, 0, 0, 0, 0
  ]

  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  const printTable = () => {
    console.log(table[0], table[1], table[2])
    console.log(table[3], table[4], table[5])
    console.log(table[6], table[7], table[8])
  }

  let gameRunning = true;
  let gameWon = false;
  let gameState = ''

  const registerMove = (spot, position) => {
    if(table[spot] == 0 && gameRunning) {  
      table[spot] = position;
      for(let i = 0; i < winningConditions.length; i++) {
        if(
          (
            (
              table[winningConditions[i][0]] == 
              table[winningConditions[i][1]]
            ) && (
              table[winningConditions[i][1]] ==
              table[winningConditions[i][2]]
            ) && (
              table[winningConditions[i][0]] ==
              table[winningConditions[i][2]]
            )
          ) && (
            table[winningConditions[i][0]] != 0 &&
            table[winningConditions[i][1]] != 0 &&
            table[winningConditions[i][2]] != 0
          )
        ) {
          gameRunning = false;
          gameWon = true;
          gameState = `Won by ${table[winningConditions[i][0]]}`
        }
      }
    }

    if(gameRunning) {
      console.log('Process move')
    } else {
      if(gameWon) {
        console.log(gameState)
      }
    }
  }

  registerMove(3, 1);
  registerMove(4, 1);
  registerMove(5, 1);

  printTable();
}

export default game