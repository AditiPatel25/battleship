import GameBoard from './gameboard.js';

class Player {
    constructor(type) {
        this.type = type; // 'human' or 'computer'
        this.gameboard = new GameBoard();
        this.attackedPositions = new Set(); // tracks all attacks made
    }

    attack(enemyGameboard, x, y) {
        const posKey = `${x},${y}`;
        if (this.attackedPositions.has(posKey)) {
            return { valid: false, message: 'Already attacked this position' };
        }

        // checks if it's a hit BEFORE attacking
        const isHit = enemyGameboard.board[x][y] !== null;

        // records and executes the attack
        this.attackedPositions.add(posKey);
        enemyGameboard.receiveAttack(x, y);

        return { valid: true, isHit, x, y };
    }

    // computer players only
    makeRandomAttack(enemyGameboard) {
        if (this.type !== 'computer') {
            throw new Error('Only computer players can make random attacks');
        }

        // keeps trying random positions until we find one that hasn't been attacked
        let x, y, posKey;
        do {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            posKey = `${x},${y}`;
        } while (this.attackedPositions.has(posKey));

        return this.attack(enemyGameboard, x, y);
    }

    // check if all ships are sunk
    hasLost() {
        return this.gameboard.ships.every(ship => ship.isSunk());
    }

    // resets for a new game
    reset() {
        this.gameboard = new GameBoard();
        this.attackedPositions.clear();
    }
}

module.exports = Player;