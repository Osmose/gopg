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
      const rowElem = document.createElement('tr');
      for (let col = 0; col < size; col++) {
        const cell = new Cell(row, col);
        this.cells.push(cell);
        rowElem.appendChild(cell.elem);
      }
      this.elem.appendChild(rowElem);
    }

    this.elem.addEventListener('click', this.handleClick.bind(this));
  }

  findGroups() {
    const groups = [];
    const checked = new Array(this.size * this.size).fill(false);
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (checked[this.index(row, col)]) {
          continue;
        }

        const color = this.get(row, col);
        if (color === EMPTY) {
          checked[this.index(row, col)] = true;
          continue;
        }

        const group = this.findGroupAt(row, col, color, checked);
        if (group !== null) {
          groups.push(group);
        }
      }
    }
    console.log(groups);
  }

  findGroupAt(row, col, color, checked) {
    if (checked[this.index(row, col)]) {
      return null;
    }

    if (this.get(row, col) !== color) {
      return null;
    }

    checked[this.index(row, col)] = true;
    let group = new Group(color);
    group.add(this.getCell(row, col));
    if (row > 0 && this.get(row - 1, col) === color) {
      const otherGroup = this.findGroupAt(row - 1, col, color, checked);
      if (otherGroup !== null) {
        group = group.merge(otherGroup);
      }
    }
    if (row < this.size - 1 && this.get(row + 1, col) === color) {
      const otherGroup = this.findGroupAt(row + 1, col, color, checked);
      if (otherGroup !== null) {
        group = group.merge(otherGroup);
      }
    }
    if (col > 0 && this.get(row, col - 1) === color) {
      const otherGroup = this.findGroupAt(row, col - 1, color, checked);
      if (otherGroup !== null) {
        group = group.merge(otherGroup);
      }
    }
    if (col < this.size - 1 && this.get(row, col + 1) === color) {
      const otherGroup = this.findGroupAt(row, col + 1, color, checked);
      if (otherGroup !== null) {
        group = group.merge(otherGroup);
      }
    }

    return group;
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

  index(row, col) {
    return (row * this.size) + col;
  }

  set(row, col, value) {
    this.getCell(row, col).value = value;
  }

  get(row, col) {
    return this.getCell(row, col).value;
  }

  getCell(row, col) {
    return this.cells[this.index(row, col)];
  }
}

class Group {
  constructor(color, cells = []) {
    this.cells = cells;
    this.color = color;
  }

  add(cell) {
    this.cells.push(cell);
  }

  merge(otherGroup) {
    if (otherGroup.color !== this.color) {
      throw new Error('Cannot merge two groups of differing colors.');
    }
    return new Group(this.color, this.cells.concat(otherGroup.cells));
  }
}

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
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

const board = window.board = new Board(9);
document.body.appendChild(board.elem);
