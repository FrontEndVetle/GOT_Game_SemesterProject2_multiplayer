//clear local Storage before user starts selection process.
window.localStorage.clear();

//fetch the characters APi
var characters;
fetch('api/characters.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(json) {
        characters = json;
        loopThroughCharacters(json);
    })
    .catch(function() {
        alert('oops! We have a server problem, please try and reload page');
    });
//loop through characters and populate the DOM as cards
function loopThroughCharacters(characters) {
    var characterDisplay = document.querySelector('.card-container');
    for (var i = 0; i < characters.length; i++) {
        characterDisplay.innerHTML += `<div class="col-xs-5 col-md"><div class="card cards cards__index">
            <img class="card-img-top cards__img" src="${characters[i].Banner}" alt="house banner">
            <div class="card-body">
                <h4 class="card-title cards__title">${characters[i].Name}</h4>
            </div>
            <ul class="list-group list-group-flush">
                <li class="list-group-item cards__info"><p><b>BORN:</b><br> ${characters[i].Born}</p></li>
                <li class="list-group-item cards__info"><p><b>CULTURE:</b><br> ${characters[i].Culture} </p></li>
                <li class="list-group-item cards__info"><p><b>ALIAS:</b><br>  ${characters[i].Aliases[0]}</p></li>
                 <li class="list-group-item cards__info"><img class="card-img-top cards__token" src="${characters[i].Token}" alt="character token"></li>
            </ul>

                <a class="btn"> SELECT</a>

            </div>
            </div>`;
    }

    //determine character selection
    document.querySelectorAll('.cards').forEach((card) => {
        card.addEventListener('click', function() {
            var char = {
                name: card.children[1].children[0].innerText,
                banner: card.children[0].src,
                token: card.children[2].children[3].children[0].src,
            };

            //parse JSON of characters in local storage
            var player = JSON.parse(localStorage.getItem('player'));
            var player2 = JSON.parse(localStorage.getItem('player2'));

            //check if user select character for player or player 2
            if (localStorage.getItem('player') === null) {
                localStorage.setItem('player', JSON.stringify(char));
                card.children[3].innerText = 'DESELECT';
                card.classList.add('selected-style');
            } else if (player.name === char.name) {
                localStorage.removeItem('player');
                card.classList.remove('selected-style');
                card.children[3].innerText = 'SELECT';
            } else if (
                localStorage.getItem('player') !== null &&
                localStorage.getItem('player2') === null
            ) {
                localStorage.setItem('player2', JSON.stringify(char));
                card.children[3].innerText = 'DESELECT';
                card.classList.add('selected-style');
            } else if (player2.name === char.name) {
                localStorage.removeItem('player2');
                card.children[3].innerText = 'SELECT';
                card.classList.remove('selected-style');
            }

            if (
                localStorage.getItem('player') !== null &&
                localStorage.getItem('player2') !== null
            ) {
                $('#startGameModal').modal('show');
            }
        });
    });
}

//Start game modal
function toGame() {
    window.location.replace('game.html');
}

//delete local storage and reset style if click change characters
function deleteSelection() {
    window.localStorage.clear();
    document.querySelectorAll('.cards').forEach((card) => {
        card.classList.remove('selected-style');
        card.children[3].innerText = 'SELECT';
    });
}