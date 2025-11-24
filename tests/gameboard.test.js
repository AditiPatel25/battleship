// gameboard.test.js
import Gameboard from '../src/gameboard.js';
import Ship from '../src/ship.js';

describe('Gameboard', () => {
  test('should create a 10x10 board', () => {
    const board = new Gameboard();
    expect(board.board.length).toBe(10);
    expect(board.board[0].length).toBe(10);
  });

  test('should start with empty ships array', () => {
    const board = new Gameboard();
    expect(board.ships.length).toBe(0);
  });

  test('placeShip() should add ship to ships array', () => {
    const board = new Gameboard();
    const ship = new Ship(3);
    board.placeShip(ship);
    expect(board.ships.length).toBe(1);
    expect(board.ships[0]).toBe(ship);
  });

  test('placeAllShips() should place 5 ships', () => {
    const board = new Gameboard();
    board.placeAllShips();
    expect(board.ships.length).toBe(5);
  });

  test('placeAllShips() should place ships with correct lengths', () => {
    const board = new Gameboard();
    board.placeAllShips();
    const lengths = board.ships.map(ship => ship.length).sort((a, b) => b - a);
    expect(lengths).toEqual([5, 4, 3, 3, 2]);
  });

  test('receiveAttack() should record a miss', () => {
    const board = new Gameboard();
    board.receiveAttack(0, 0);
    expect(board.missedAttacks.length).toBe(1);
    expect(board.missedAttacks[0]).toEqual({ x: 0, y: 0 });
  });

  test('receiveAttack() should hit a ship', () => {
    const board = new Gameboard();
    const ship = new Ship(3);
    
    // Manually place ship horizontally at (0,0)
    board.ships.push(ship);
    board.board[0][0] = ship;
    board.board[0][1] = ship;
    board.board[0][2] = ship;
    
    board.receiveAttack(0, 0);
    expect(ship.hits).toBe(1);
    expect(board.hitAttacks.length).toBe(1);
  });

  test('receiveAttack() should not record miss when hitting ship', () => {
    const board = new Gameboard();
    const ship = new Ship(2);
    
    board.ships.push(ship);
    board.board[5][5] = ship;
    board.board[5][6] = ship;
    
    board.receiveAttack(5, 5);
    expect(board.missedAttacks.length).toBe(0);
  });

  test('allShipsSunk() should return false when ships are afloat', () => {
    const board = new Gameboard();
    board.placeAllShips();
    expect(board.allShipsSunk()).toBe(false);
  });

  test('allShipsSunk() should return true when all ships are sunk', () => {
    const board = new Gameboard();
    const ship1 = new Ship(1);
    const ship2 = new Ship(1);
    
    board.ships.push(ship1);
    board.ships.push(ship2);
    board.board[0][0] = ship1;
    board.board[1][1] = ship2;
    
    board.receiveAttack(0, 0);
    board.receiveAttack(1, 1);
    
    expect(board.allShipsSunk()).toBe(true);
  });
});

