import Ship from '../src/ship.js';

describe('Ship', () => {
  test('should create a ship with correct length', () => {
    const ship = new Ship(3);
    expect(ship.length).toBe(3);
  });

  test('should start with 0 hits', () => {
    const ship = new Ship(4);
    expect(ship.hits).toBe(0);
  });

  test('hit() should increase hits by 1', () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.hits).toBe(1);
  });

  test('hit() should not exceed ship length', () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    ship.hit(); // third hit
    expect(ship.hits).toBe(2); // should cap at length
  });

  test('isSunk() should return false when hits < length', () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.isSunk()).toBe(false);
  });

  test('isSunk() should return true when hits >= length', () => {
    const ship = new Ship(2);
    ship.hit();
    ship.hit();
    expect(ship.isSunk()).toBe(true);
  });
});

