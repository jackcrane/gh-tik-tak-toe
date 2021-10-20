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

const makeid = (length=64) => {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}

let gameRunning = true;
let gameWon = false;
let gameState = ''

const registerMove = async (spot, position) => {
  let gs = await GAMESTORE.get('gamestate')
  table = await JSON.parse(gs)
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
        gameWon = true;
        gameState = `Won by ${table[winningConditions[i][0]]}`
      }
    }
    let player = await GAMESTORE.get('player');
    if(player === 1) {
      await GAMESTORE.put('player', '2');
    } else if(player === 2) {
      await GAMESTORE.put('player', '1');
    }
  }

  if(gameRunning) {
    await GAMESTORE.put('gamestate', JSON.stringify(table))
    return true;
  } else {
    if(gameWon) {
      await GAMESTORE.put('gamestate', '[0,0,0,0,0,0,0,0,0]')
      await GAMESTORE.put('player', '1')
      gameWon = false;
      return false;
    }
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const handleRequest = async(request) => {
  if(typeof(await GAMESTORE.get('gamestate')) === 'null') {
    await GAMESTORE.put('gamestate', '[0,0,0,0,0,0,0,0,0]')
  }
  if(typeof(await GAMESTORE.get('player')) === 'null') {
    await GAMESTORE.put('player', '1')
  }

  table = JSON.parse(await GAMESTORE.get('gamestate'))

  if(request.url.includes('/move/')) {
    let path = request.url.split('/move/')[1]?.split('?')[0]
    let player = parseInt(await GAMESTORE.get('player'));
    if(await registerMove(path, player)) {
      return new Response('Play successfully registered', {
        headers: { 'content-type': 'text/plain' },
      })
    } else {
      await GAMESTORE.put('gamestate', '[0,0,0,0,0,0,0,0,0]')
      await GAMESTORE.put('player', '1')
      gameWon = false;
      return new Response('Player has won', {
        headers: { 'content-type': 'text/plain' },
      })
    };
  } else if(request.url.includes('/image/')) {

    let blob;
    let blobBlank = await fetch('https://img.icons8.com/ios/100/000000/unchecked-checkbox.png').then(r => r.blob());
    let blobXed = await fetch('https://img.icons8.com/fluency-systems-regular/96/000000/x.png').then(r => r.blob());
    let blobCircle = await fetch('https://img.icons8.com/ios/100/000000/circled.png').then(r => r.blob());
    let blobError = await fetch('https://img.icons8.com/ios/50/000000/error--v1.png').then(r => r.blob());
    

    let path = parseInt(request.url.split('/image/')[1]?.split('?')[0]);

    console.log('pos', path, table[path])

    switch(table[path]) {
      case 0:
        blob = blobBlank
        break;
      case 1:
        blob = blobXed
        break;
      case 2:
        blob = blobCircle
        break;
      default:
        blob = blobError;
        break;
    }

    return new Response(blob, {
      headers: { 
        'content-type': 'image/png',
        'Cache-Control': 'no-cache',
        'ETag': makeid(64)
      }
    })
  } else if(request.url.includes('debug')) {
    let v = await GAMESTORE.get('gamestate');
    return new Response(v, { headers: { 'content-type': 'text/plain' }})
  } else if(request.url.includes('reset')) {
    await GAMESTORE.put('gamestate', '[0,0,0,0,0,0,0,0,0]')
    await GAMESTORE.put('player', '1')
    return new Response('Game reset', {
      headers: { 'content-type': 'text/plain' }
    })
  } else if(request.url.includes('current-player')) {
    let blob;
    let blobBlank = await fetch('https://img.icons8.com/ios/100/000000/unchecked-checkbox.png').then(r => r.blob());
    let blobXed = await fetch('https://img.icons8.com/fluency-systems-regular/96/000000/x.png').then(r => r.blob());
    let blobCircle = await fetch('https://img.icons8.com/ios/100/000000/circled.png').then(r => r.blob());
    let blobError = await fetch('https://img.icons8.com/ios/50/000000/error--v1.png').then(r => r.blob());

    let player = await GAMESTORE.get('player');
    console.log(player)

    switch(parseInt(player)) {
      case 0:
        blob = blobBlank
        break;
      case 1:
        blob = blobXed
        break;
      case 2:
        blob = blobCircle
        break;
      default:
        blob = blobError;
        break;
    }
    return new Response(blob, {
      headers: { 
        'content-type': 'image/png',
        'Cache-Control': 'no-cache',
        'ETag': makeid(64)
      }
    })
  } else {
    return new Response('Something went wrong', {
      headers: { 'content-type': 'text/plain' }
    })
  }

  
  // let lok = await GAMESTORE.get('gamestate')
  // let lok = await GAMESTORE.list();
  // lok = JSON.stringify(lok)

  // return new Response(lok, {
  //   headers: { 'content-type': 'text/plain' },
  // })
}