//get DOM elements
const storyBoard = document.getElementById('story-board-list');
const modalBoard = document.querySelector('.modalsHere');
let playerTurn = document.getElementById('nextPlayer');
let boardHTML;
let moveAudio;
let diceAudio;

//multiplayer
const log = (text) => {
    const liEvent = document.createElement('li');
    const online = document.createTextNode(text);
    storyBoard.prepend(liEvent);
    liEvent.append(online);
    liEvent.classList.add('story-board__event');
};

const onChatSubmitted = (sock) => (e) => {
    e.preventDefault();
    const input = document.querySelector('#chat');
    const text = input.value;
    input.value = '';

    sock.emit('message', text);
};

//mute audio/sounds
function enableMute() {
    moveAudio.muted = true;
    diceAudio.muted = true;
}

function disableMute() {
    moveAudio.muted = false;
    diceAudio.muted = false;
}

(() => {
    const sock = io();
    sock.on('turn', ({ roll }) => console.log(roll));
    sock.on('message', log);

    document
        .querySelector('#chat-form')
        .addEventListener('submit', onChatSubmitted(sock));

    //player starts
    let currentPlayerTurn = 0;
    //display next player variable
    let nextPlayer = 0;
    let roll;

    var player = JSON.parse(localStorage.getItem('player'));
    var player2 = JSON.parse(localStorage.getItem('player2'));

    function createPlayer() {
        var player = JSON.parse(localStorage.getItem('player'));
        let playerDisplay = document.querySelector('.player');
        playerDisplay.innerHTML += `
    <div class="card cards cards__game">
    <img class="card-img-top cards__img cards__img--game" src="${player.banner}" alt="house banner">
    <div class="card-body">
                <h3 class="card-title cards__title">${player.name}</h3>
                  <ul class="list-group list-group-flush">
                  </div>
                        </div>
                        <img class="game-token game-token__fighters" src="${player.token}" alt="player token">`;
        playerTurn.innerHTML = '';
        playerTurn.innerHTML += `
           <p class="player-turn">NEXT PLAYER IS ${player.name}<img class="player-turn__token" src="${player.token}" alt="player token"></p>
            `;
    }
    createPlayer();

    function createplayer2() {
        var player2 = JSON.parse(localStorage.getItem('player2'));

        let player2Display = document.querySelector('.player2');
        player2Display.innerHTML += `
    <div class="card cards cards__game">
    <img class="card-img-top cards__img" src="${player2.banner}" alt="house banner">
    <div class="card-body">
                <h3 class="card-title cards__title">${player2.name}</h3>
                  <ul class="list-group list-group-flush">
                  </div>
                        </div>
                        <img class="game-token game-token__fighters" src="${player2.token}" alt="player token">`;
    }
    createplayer2();

    //spin button to animate the roll and make unclickable for 2,7 secounds
    $('.rotate').click(function() {
        diceAudio = document.getElementById('diceAudio');
        diceAudio.play();
        $(this).toggleClass('down');
        document.getElementById('rollBtn').disabled = true;
        setTimeout(function() {
            document.getElementById('rollBtn').disabled = false;
        }, 2700);
    });

    //dice roll and and token movement
    window.rollDice = () => {
        const max = 6;
        roll = Math.ceil(Math.random() * max);
        currentPlayer = players[currentPlayerTurn];
        currentRoll = diceEyes[roll];
        currentPlayer.throws++;
        sock.emit('turn', { roll });
        showTurn();

        const rolledEvent = document.createTextNode(
            currentPlayer.name + ' ROLLED ' + roll
        );
        const liEvent = document.createElement('li');
        storyBoard.prepend(liEvent);
        liEvent.append(rolledEvent);
        liEvent.classList.add('story-board__event');

        //change dice image depending on roll

        function updateDie() {
            var dice = document.querySelector('#dice');
            setTimeout(() => {
                $(this).toggleClass('down');
                dice.setAttribute('src', currentRoll.path);
            }, 400);
        }

        updateDie();

        //add dice value to current position of player and animate movement
        var counter = 0;
        var interval = setInterval(function() {
            moveAudio = document.getElementById('tokenAudio');
            moveAudio.play();

            counter++;
            currentPlayer.position++;

            if (counter === roll) {
                clearInterval(interval);
                checkJoker();
            }
            if (currentPlayer.position > 29) {
                loadWinner();
            }
            renderBoard();
        }, 500);

        //check if player landed on joker and display joker modal

        function checkJoker() {
            jokers.forEach((joker) => {
                if (joker.start === currentPlayer.position) {
                    currentPlayer.position = joker.end;
                    modalBoard.innerHTML = `
        <div class="modal" id="jokerModal">
           <div class="modal-dialog">
    <div class="modal-content">

      <div class="modal-header">
        <h4 class="modal-title">YOU LANDED ON A JOKER!</h4>
        <button type="button" class="close" data-dismiss="modal">&times;</button>
      </div>

      <div class="modal-body">
       <img src="${joker.img}" class="joker-modal__img" alt="joker image" style="width="100%""/>
        ${currentPlayer.name} ${joker.description}
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
  </div>
                    `;
                    $('#jokerModal').modal('show');

                    //show joker event in storyboard
                    const jokerEvent = document.createTextNode(
                        currentPlayer.name + joker.description
                    );
                    const liEvent = document.createElement('li');
                    storyBoard.prepend(liEvent);
                    liEvent.append(jokerEvent);
                    liEvent.classList.add('story-board__event');
                }
            });
        }

        //determine whos turn it is
        if (roll < 6) {
            currentPlayerTurn++;
        }

        if (currentPlayerTurn >= players.length) {
            currentPlayerTurn = 0;
        }

        renderBoard();
    };

    //display whos turn it is to throw dice

    function showTurn() {
        if (currentPlayerTurn === 1) {
            nextPlayer = 0;
        } else {
            nextPlayer = 1;
        }

        if (roll === 6) {
            playerTurn.innerHTML = '';
            playerTurn.innerHTML += `
             <p class="player-turn">${currentPlayer.name} ROLLED A SIX AND CAN ROLL AGAIN!<img class="player-turn__token" src="${currentPlayer.token}" alt="player token"></p>
            `;
        } else {
            playerTurn.innerHTML = '';
            playerTurn.innerHTML += `
             <p class="player-turn">NEXT PLAYER IS ${players[nextPlayer].name}<img class="player-turn__token" src="${players[nextPlayer].token}" alt="player token"></p>
            `;
        }
    }

    //dice images
    const diceEyes = [{
            path: '',
        },
        {
            path: 'icons/dice1.png',
        },
        {
            path: 'icons/dice2.png',
        },
        {
            path: 'icons/dice3.png',
        },
        {
            path: 'icons/dice4.png',
        },
        {
            path: 'icons/dice5.png',
        },
        {
            path: 'icons/dice6.png',
        },
    ];

    //players
    const players = [{
            name: player.name,
            position: 0,
            token: player.token,
            class: 'game-token__player1',
            throws: 0,
        },
        {
            name: player2.name,
            position: 0,
            token: player2.token,
            class: 'game-token__player2',
            throws: 0,
        },
    ];

    //determine the location of the jokers and where user will end when hitting them.
    const jokers = [{
            start: 3,
            end: 2,
            description: " HIDES DURING NED STARK'S EXECUTION AND RETREATS 1 SPACE",
            img: 'images/eddard.png',
        },
        {
            start: 5,
            end: 18,
            description: " GET'S A RIDE BY VISERION THE DRAGON FOR 13 SPACES",
            img: 'images/dragon.jpg',
        },
        {
            start: 7,
            end: 9,
            description: ' IS EXHAUSTED AND GETS CARRIED 2 SPACES BY HODOR',
            img: 'images/hodor.jpg',
        },
        {
            start: 14,
            end: 1,
            description: ' MUST GO INTO HIDING AFTER THE RED WEDDING. MOVE BACK TO START',
            img: 'images/wedding.jpg',
        },
        {
            start: 16,
            end: 15,
            description: 'FINDS OUT ABOUT THE SONS OF THE HARPY COUP, AND HIDES 1 SPACE BACK',
            img: 'images/harpy.jpg',
        },

        {
            start: 19,
            end: 12,
            description: ' FIGHT HOPELESSLY IN THE BATTLE OF HARDHOME. ROW BACK 7 SPACES',
            img: 'images/hardhome.jpg',
        },

        {
            start: 24,
            end: 26,
            description: 'HEARD THAT THE NIGHT KING IS DEAD. NO BOUNDARIES LEFT, RUN TWO SPACES FORWARD',
            img: 'images/winter.jpg',
        },
        {
            start: 25,
            end: 15,
            description: 'IS MED BY A ROGUE DROGON, RETREAT FOR YOUR LIFE 10 SPACES',
            img: 'images/dragon.jpg',
        },
    ];

    //create the board
    const width = 5;
    const height = 5;
    const board = [];
    let position = 0;
    let pattern = false;

    for (var y = height; y >= 0; y--) {
        let row = [];
        board.push(row);
        for (var x = 0; x < width; x++) {
            row.push({
                x,
                y,
                occupied: null,
                position,
                color: pattern ? '#2C4459' : '#000',
            });
            pattern = !pattern;
            position++;
        }
    }

    const boardSize = 75;
    //render Gameboard
    const renderBoard = () => {
        let boardHTML = '';
        board.forEach((row) => {
            row.forEach((square) => {
                boardHTML += `<div class="square" style="top:${
					square.y * boardSize
				}px; left:${square.x * boardSize}px; background-color:${
					square.color
				}"></div>`;
                jokers.forEach((joker) => {
                    if (joker.start === square.position) {
                        boardHTML += `<div class="square square__joker" style="top:${
							square.y * boardSize
						}px; left:${square.x * boardSize}px; background-color:${
							square.jokers
						}"></div>`;
                    }
                });
            });
        });

        //positioning of each player and token

        players.forEach((player) => {
            board.forEach((row) => {
                row.forEach((square) => {
                    if (square.position === player.position) {
                        boardHTML += `<img class="game-token ${player.class}" src="${
							player.token
						}" id="boardToken" alt="player token" style="top:${
							square.y * boardSize + 8
						}px; left:${square.x * boardSize + 8}px;">`;
                    }
                    //change token style if players are on same tile.
                    if (players[0].position !== players[1].position) {
                        player.class = '';
                    } else {
                        (players[0].class = 'game-token__player1'),
                        (players[1].class = 'game-token__player2');
                    }
                });
            });
        });

        //board placement
        document.getElementById('board').innerHTML = boardHTML;
        boardHTML = document.getElementById('board');
    };
    renderBoard();

    //Store winner in localStorage and load winning page
    function loadWinner() {
        window.localStorage.clear();
        var winner = {
            name: currentPlayer.name,
            token: currentPlayer.token,
            throws: currentPlayer.throws,
        };
        localStorage.setItem('winner', JSON.stringify(winner));
        window.location.replace('win.html');
    }
})();