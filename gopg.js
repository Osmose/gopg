const WIDTH = 9;
const HEIGHT = 9;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

class Board {
  constructor(size) {
    this.size = size;
    this.currentColor = BLACK;
    this.elem = document.createElement('table');
    this.cells = [];

    for (let row = 0; row < size; row++) {
      const rowItems = [];
      const rowElem = document.createElement('tr');
      for (let col = 0; col < size; col++) {
        const cell = new Cell(row, col);
        rowItems.push(cell);
        rowElem.appendChild(cell.elem);
      }
      this.cells.push(rowItems);
      this.elem.appendChild(rowElem);
    }

    this.elem.addEventListener('click', this.handleClick.bind(this));
  }

  handleClick(event) {
    const cell = event.target;
    if (!cell.classList.contains('cell')) {
      return;
    }

    const row = parseInt(cell.dataset.row, 10);
    const col = parseInt(cell.dataset.col, 10);
    this.set(row, col, this.currentColor);
    if (this.currentColor === BLACK) {
      this.currentColor = WHITE;
    } else {
      this.currentColor = BLACK;
    }
  }

  set(row, col, value) {
    this.cells[row][col].value = value;
  }
}

class Cell {
  constructor(row, col) {
    this.elem = document.createElement('td');
    this.elem.classList.add('cell');
    this.elem.dataset.row = row;
    this.elem.dataset.col = col;
    this._value = EMPTY;
  }

  set value(newValue) {
    this._value = newValue;
    switch (newValue) {
      case EMPTY:
        this.elem.className = '';
        break;
      case BLACK:
        this.elem.className = 'black';
        break;
      case WHITE:
        this.elem.className = 'white';
        break;
    }
  }

  get value() {
    return this._value;
  }
}

const board = new Board(9);
document.body.appendChild(board.elem);
