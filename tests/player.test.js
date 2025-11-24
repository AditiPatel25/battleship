// player.test.js
import Player from '../src/player.js';
import Gameboard from '../src/gameboard.js';
import Ship from '../src/ship.js';

describe('Player', () => {
  test('should create a human player', () => {
    const player = new Player('human');
    expect(player.type).toBe('human');
  });

  test('should create a computer player', () => {
    const player = new Player('computer');
    expect(player.type).toBe('computer');
  });

  test('should have a gameboard', () => {
    const player = new Player('human');
    expect(player.gameboard).toBeInstanceOf(Gameboard);
  });

  test('should start with empty attackedPositions', () => {
    const player = new Player('human');
    expect(player.attackedPositions.size).toBe(0);
  });

  test('attack() should return valid hit', () => {
    const player1 = new Player('human');
    const player2 = new Player('computer');
    
    // Place a ship on player2's board
    player2.gameboard.placeAllShips();
    
    // Find where a ship is located
    let x, y;
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (player2.gameboard.board[i][j] !== null) {
          x = i;
          y = j;
          break;
        }
      }
      if (x !== undefined) break;
    }
    
    const result = player1.attack(player2.gameboard, x, y);
    expect(result.valid).toBe(true);
    expect(result.isHit).toBe(true);
  });

  test('attack() should return valid miss', () => {
    const player1 = new Player('human');
    const player2 = new Player('computer');
    
    player2.gameboard.placeAllShips();
    
    // Find an empty spot
    let x, y;
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if (player2.gameboard.board[i][j] === null) {
          x = i;
          y = j;
          break;
        }
      }
      if (x !== undefined) break;
    }
    
    const result = player1.attack(player2.gameboard, x, y);
    expect(result.valid).toBe(true);
    expect(result.isHit).toBe(false);
  });

  test('attack() should prevent duplicate attacks', () => {
    const player1 = new Player('human');
    const player2 = new Player('computer');
    
    player1.attack(player2.gameboard, 0, 0);
    const result = player1.attack(player2.gameboard, 0, 0);
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Already attacked this position');
  });

  test('attack() should track attacked positions', () => {
    const player1 = new Player('human');
    const player2 = new Player('computer');
    
    player1.attack(player2.gameboard, 0, 0);
    player1.attack(player2.gameboard, 5, 5);
    
    expect(player1.attackedPositions.size).toBe(2);
    expect(player1.attackedPositions.has('0,0')).toBe(true);
    expect(player1.attackedPositions.has('5,5')).toBe(true);
  });

  test('makeRandomAttack() should throw error for human player', () => {
    const player = new Player('human');
    const opponent = new Player('computer');
    
    expect(() => {
      player.makeRandomAttack(opponent.gameboard);
    }).toThrow('Only computer players can make random attacks');
  });

  test('makeRandomAttack() should work for computer player', () => {
    const computer = new Player('computer');
    const opponent = new Player('human');
    
    opponent.gameboard.placeAllShips();
    
    const result = computer.makeRandomAttack(opponent.gameboard);
    expect(result.valid).toBe(true);
    expect(computer.attackedPositions.size).toBe(1);
  });

  test('makeRandomAttack() should not attack same position twice', () => {
    const computer = new Player('computer');
    const opponent = new Player('human');
    
    // Make 10 attacks
    for (let i = 0; i < 10; i++) {
      computer.makeRandomAttack(opponent.gameboard);
    }
    
    // All attacks should be unique
    expect(computer.attackedPositions.size).toBe(10);
  });

  test('hasLost() should return false when ships are afloat', () => {
    const player = new Player('human');
    player.gameboard.placeAllShips();
    
    expect(player.hasLost()).toBe(false);
  });

  test('hasLost() should return true when all ships are sunk', () => {
    const player = new Player('human');
    const ship = new Ship(1);
    
    player.gameboard.ships.push(ship);
    player.gameboard.board[0][0] = ship;
    player.gameboard.receiveAttack(0, 0);
    
    expect(player.hasLost()).toBe(true);
  });

  test('reset() should clear gameboard and attacked positions', () => {
    const player = new Player('human');
    const opponent = new Player('computer');
    
    player.gameboard.placeAllShips();
    player.attack(opponent.gameboard, 0, 0);
    player.attack(opponent.gameboard, 1, 1);
    
    player.reset();
    
    expect(player.gameboard.ships.length).toBe(0);
    expect(player.attackedPositions.size).toBe(0);
  });
});