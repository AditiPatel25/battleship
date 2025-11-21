import Player from './player.js';
import './styles.css';

class GameUI {
  constructor() {
    this.humanPlayer = null;
    this.computerPlayer = null;
    this.pregameScreen = document.getElementById('pregameScreen');
    this.gameScreen = document.getElementById('gameScreen');
    this.playerBoard = document.getElementById('playerBoard');
    this.computerBoard = document.getElementById('computerBoard');
    this.pregameForm = document.getElementById('pregame-form');
    this.gameOverModal = document.getElementById('gameOverModal');
    this.winnerText = document.getElementById('winnerText');
    this.playAgainBtn = document.getElementById('playAgainBtn');
  }

  init() {
    this.pregameForm.addEventListener('submit', (e) => this.handleGameStart(e));
    this.playAgainBtn.addEventListener('click', () => this.resetGame());
  }

  handleGameStart(e) {
    e.preventDefault();

    const organize = document.querySelector('input[name="organize"]:checked').value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;

    // creates players
    this.humanPlayer = new Player('human');
    this.computerPlayer = new Player('computer');

    // sets up ships
    this.humanPlayer.gameboard.placeAllShips();
    this.computerPlayer.gameboard.placeAllShips();

    // hides pregame screen, show game
    this.pregameScreen.style.display = 'none';
    this.gameScreen.style.display = 'flex'; 
    this.gameScreen.classList.add('active');

    // renders boards
    this.renderBoards();
  }

  renderBoard(boardType, container, player) {
    container.innerHTML = '';

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const cell = this.createCell(x, y, boardType, player);
        container.appendChild(cell);
      }
    }
  }

  renderBoards() {
    this.renderBoard('player', this.playerBoard, this.humanPlayer);
    this.renderBoard('computer', this.computerBoard, this.computerPlayer);
    this.renderShipGauge('player');
    this.renderShipGauge('computer');
  }


  renderShipGauge(boardType) {
    const player = boardType === 'player' ? this.humanPlayer : this.computerPlayer;
    const container = boardType === 'player'
      ? this.playerBoard.parentElement
      : this.computerBoard.parentElement;

    // removes existing and create new gauge
    container.querySelector('.ship-gauge')?.remove();

    const gauge = document.createElement('div');
    gauge.className = 'ship-gauge';

    player.gameboard.ships
      .sort((a, b) => b.length - a.length)
      .forEach(ship => {
        const circle = document.createElement('div');
        circle.className = `ship-circle ${ship.isSunk() ? 'sunk' : ''}`;
        circle.textContent = ship.length;
        gauge.appendChild(circle);
      });

    container.appendChild(gauge);
  }

  createCell(x, y, boardType, player) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.x = x;
    cell.dataset.y = y;

    const isHit = this.isAttackAt(player.gameboard.hitAttacks, x, y);
    const isMiss = this.isAttackAt(player.gameboard.missedAttacks, x, y);

    if (boardType === 'player' && player.gameboard.board[x][y]) {
      cell.classList.add('ship');
    }

    if (isHit) cell.classList.add('hit');
    if (isMiss) cell.classList.add('miss');

    if (boardType === 'computer') {
      cell.addEventListener('click', () => this.handleAttack(x, y));
    }

    return cell;
  }

  isAttackAt(attacks, x, y) {
    return attacks.some(attack => attack.x === x && attack.y === y);
  }

  handleAttack(x, y) {
    const result = this.humanPlayer.attack(this.computerPlayer.gameboard, x, y);

    if (!result.valid) {
      console.log(result.message);
      return;
    }

    console.log(`Attack on (${x}, ${y}): ${result.isHit ? 'HIT!' : 'MISS'}`);

    // re-renders immediately to show YOUR attack result
    this.renderBoards();

    // checks if computer lost AFTER rendering
    if (this.computerPlayer.hasLost()) {
      this.showGameOver('YOU WON!');
      return;
    }

    // computer makes attack
    setTimeout(() => this.computerAttack(), 500);
  }

  computerAttack() {
    const result = this.computerPlayer.makeRandomAttack(this.humanPlayer.gameboard);
    console.log(`Computer attacked (${result.x}, ${result.y}): ${result.isHit ? 'HIT!' : 'MISS'}`);

    // re-renders to show computer's attack
    this.renderBoards();

    // checks if human lost AFTER rendering
    if (this.humanPlayer.hasLost()) {
      this.showGameOver('Computer Won!');
      return;
    }
  }

  showGameOver(message) {
    this.winnerText.textContent = message;
    this.gameOverModal.classList.add('active');
  }

  resetGame() {
    // hides modal
    this.gameOverModal.classList.remove('active');

    // hide game screen completely, show pregame screen
    this.gameScreen.classList.remove('active');
    this.gameScreen.style.display = 'none'; 
    this.pregameScreen.style.display = 'flex';

    // clears players
    this.humanPlayer = null;
    this.computerPlayer = null;

    // clears boards
    this.playerBoard.innerHTML = '';
    this.computerBoard.innerHTML = '';
  }

}

export default GameUI;

document.addEventListener('DOMContentLoaded', () => {
  const gameUI = new GameUI();
  gameUI.init();
  window.gameUI = gameUI; 
});