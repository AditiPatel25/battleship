import Ship from './ship.js';

class GameBoard {
    static BOARD_SIZE = 10;
    static SHIP_LENGTHS = [5, 4, 3, 3, 2];

    constructor() {
        this.board = Array(GameBoard.BOARD_SIZE).fill(null)
            .map(() => Array(GameBoard.BOARD_SIZE).fill(null));
        this.ships = [];
        this.missedAttacks = [];
        this.hitAttacks = [];
    }

    placeShip(ship) {
        let placed = false;
        while (!placed) {
            const x = Math.floor(Math.random() * GameBoard.BOARD_SIZE);
            const y = Math.floor(Math.random() * GameBoard.BOARD_SIZE);
            const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';

            // checks if ship fits and is valid
            if (this.isValidPlacement(ship, x, y, direction)) {
                // places the ship on the board
                this.addShipToBoard(ship, x, y, direction);
                this.ships.push(ship);
                placed = true;
            }
        }
    }

    placeAllShips() {
        this.ships = [];
        this.board = Array(GameBoard.BOARD_SIZE).fill(null)
            .map(() => Array(GameBoard.BOARD_SIZE).fill(null));

        GameBoard.SHIP_LENGTHS.forEach(length => {
            this.placeShip(new Ship(length));
        });
    }

    receiveAttack(x, y) {
        if (this.board[x][y] === null) {
            // Miss
            this.missedAttacks.push({ x, y });
        } else {
            // Hit! this.board[x][y] contains the ship
            const ship = this.board[x][y];
            ship.hit();
            this.hitAttacks.push({ x, y });
        }
    }

    isValidPlacement(ship, x, y, direction) {
        // check if ship goes off board
        if (direction === 'horizontal' && y + ship.length > GameBoard.BOARD_SIZE) {
            return false;
        }
        if (direction === 'vertical' && x + ship.length > GameBoard.BOARD_SIZE) {
            return false;
        }

        // check if all cells are empty
        if (direction === 'horizontal') {
            for (let i = 0; i < ship.length; i++) {
                if (this.board[x][y + i] !== null) { // same row, increase column
                    return false;
                }
            }
        } else { // vertical
            for (let i = 0; i < ship.length; i++) {
                if (this.board[x + i][y] !== null) { // increase row, same column
                    return false;
                }
            }
        }
        return true;
    }

    addShipToBoard(ship, x, y, direction) {
        if (direction === 'horizontal') {
            for (let i = 0; i < ship.length; i++) {
                this.board[x][y + i] = ship; // same row, increase column (go right)
            }
        } else { // vertical
            for (let i = 0; i < ship.length; i++) {
                this.board[x + i][y] = ship; // increase row, same column (go down)
            }
        }
    }

    allShipsSunk() {
        return this.ships.every(ship => ship.isSunk());
    }
}

export default GameBoard;