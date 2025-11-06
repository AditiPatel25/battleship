import './styles.css';

import Ship from './ship.js'; 
import GameBoard from './gameboard.js';

console.log('Testing Battleship...');

// Test Ship class
const testShip = new Ship(3);
console.log('New ship:', testShip); // Should show length: 3, hits: 0

testShip.hit();
testShip.hit();
console.log('After 2 hits:', testShip); // hits: 2, sunk: false
console.log('Is sunk?', testShip.isSunk()); // false

testShip.hit();
console.log('After 3 hits:', testShip); // hits: 3, sunk: true
console.log('Is sunk?', testShip.isSunk()); // true

// Test GameBoard
const board = new GameBoard();
console.log('Empty board:', board);

board.placeAllShips();
console.log('Board after placing ships:', board);
console.log('Ships array:', board.ships); // Should have 5 ships
console.log('Board grid:', board.board); // Should see ships placed

// Test receiveAttack
board.receiveAttack(0, 0);
console.log('Missed attacks:', board.missedAttacks);
console.log('Hit attacks:', board.hitAttacks);
