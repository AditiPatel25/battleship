import Player from './player.js';
import Ship from './ship.js'
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
    this.placementScreen = document.getElementById('placementScreen');
    this.placementBoard = document.getElementById('placementBoard');
    this.currentShipIndex = 0;
    this.shipsToPlace = [
      { length: 5, name: 'carrier' },
      { length: 4, name: 'battleship' },
      { length: 3, name: 'cruiser' },
      { length: 3, name: 'submarine' },
      { length: 2, name: 'destroyer' }
    ];
    this.currentDirection = 'horizontal';
  }

  init() {
    this.pregameForm.addEventListener('submit', (e) => this.handleGameStart(e));
    this.playAgainBtn.addEventListener('click', () => this.resetGame());

    const rotateBtn = document.getElementById('rotateShipBtn');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => this.toggleDirection());
    }
  }

  handleGameStart(e) {
    e.preventDefault();

    const organize = document.querySelector('input[name="organize"]:checked').value;

    // creates players
    this.humanPlayer = new Player('human');
    this.computerPlayer = new Player('computer');

    this.computerPlayer.gameboard.placeAllShips();

    if (organize === 'place-yourself') {
      this.showPlacementScreen();
    } else {
      this.humanPlayer.gameboard.placeAllShips();
      this.startGame();
    }
  }

  showPlacementScreen() {
    this.pregameScreen.style.display = 'none';
    this.placementScreen.style.display = 'flex';

    this.currentShipIndex = 0;
    this.currentDirection = 'horizontal';

    this.renderPlacementBoard();
    this.updatePlacementUI();
  }

  renderPlacementBoard() {
    this.placementBoard.innerHTML = '';

    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.x = x;
        cell.dataset.y = y;

        // shows already placed ships
        const shipAtCell = this.humanPlayer.gameboard.board[x][y];
        if (shipAtCell) {
          cell.classList.add('ship');
        }

        cell.addEventListener('mouseenter', (e) => this.handlePlacementHover(e));
        cell.addEventListener('mouseleave', () => this.clearPlacementPreview());
        cell.addEventListener('click', (e) => this.handlePlacementClick(e));

        this.placementBoard.appendChild(cell);
      }
    }
  }

  handlePlacementHover(e) {
    if (this.currentShipIndex >= this.shipsToPlace.length) return;

    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const ship = this.shipsToPlace[this.currentShipIndex];

    this.clearPlacementPreview();

    // shows preview of ship placement
    const cells = this.getShipCells(x, y, ship.length);
    const isValid = this.humanPlayer.gameboard.isValidPlacement(
      { length: ship.length }, x, y, this.currentDirection
    );

    cells.forEach(([cx, cy]) => {
      const cell = this.placementBoard.querySelector(`[data-x="${cx}"][data-y="${cy}"]`);
      if (cell) {
        cell.classList.add(isValid ? 'preview-valid' : 'preview-invalid');
      }
    });
  }

  clearPlacementPreview() {
    const previewCells = this.placementBoard.querySelectorAll('.preview-valid, .preview-invalid');
    previewCells.forEach(cell => {
      cell.classList.remove('preview-valid', 'preview-invalid');
    });
  }

  handlePlacementClick(e) {
    if (this.currentShipIndex >= this.shipsToPlace.length) return;

    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    const shipConfig = this.shipsToPlace[this.currentShipIndex];

    const ship = new Ship(shipConfig.length);

    if (this.humanPlayer.gameboard.isValidPlacement(ship, x, y, this.currentDirection)) {
      this.humanPlayer.gameboard.addShipToBoard(ship, x, y, this.currentDirection);
      this.humanPlayer.gameboard.ships.push(ship);

      this.currentShipIndex++;

      if (this.currentShipIndex >= this.shipsToPlace.length) {
        setTimeout(() => this.startGame(), 500);
      } else {
        this.renderPlacementBoard();
        this.updatePlacementUI();
      }
    }
  }

  getShipCells(x, y, length) {
    const cells = [];
    for (let i = 0; i < length; i++) {
      if (this.currentDirection === 'horizontal') {
        cells.push([x, y + i]);
      } else {
        cells.push([x + i, y]);
      }
    }
    return cells;
  }

  toggleDirection() {
    this.currentDirection = this.currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
    this.updatePlacementUI();
    this.clearPlacementPreview();
  }

  updatePlacementUI() {
    const instruction = document.getElementById('placementInstruction');
    const rotateBtn = document.getElementById('rotateShipBtn');

    if (this.currentShipIndex < this.shipsToPlace.length) {
      const ship = this.shipsToPlace[this.currentShipIndex];
      instruction.textContent = `place your ${ship.name} (${ship.length} cells) - direction: ${this.currentDirection}`;
      rotateBtn.style.display = 'block';
    } else {
      instruction.textContent = 'All ships placed! Starting game...';
      rotateBtn.style.display = 'none';
    }
  }

  startGame() {
    // hides placement ships screen
    if (this.placementScreen) {
      this.placementScreen.style.display = 'none';
    }
    this.pregameScreen.style.display = 'none';
    this.gameScreen.style.display = 'flex';
    this.gameScreen.classList.add('active');

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

    // hides all screens
    this.gameScreen.classList.remove('active');
    this.gameScreen.style.display = 'none';
    if (this.placementScreen) {
      this.placementScreen.style.display = 'none';
    }

    // shows pregame screen
    this.pregameScreen.style.display = 'flex';

    document.getElementById('random').checked = true;

    this.humanPlayer = null;
    this.computerPlayer = null;

    this.playerBoard.innerHTML = '';
    this.computerBoard.innerHTML = '';
    if (this.placementBoard) {
      this.placementBoard.innerHTML = '';
    }

    this.currentShipIndex = 0;
    this.currentDirection = 'horizontal';
  }

}

export default GameUI;

document.addEventListener('DOMContentLoaded', () => {
  const gameUI = new GameUI();
  gameUI.init();
  window.gameUI = gameUI;
});