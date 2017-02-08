const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

class Cell {
  constructor(row, col) {
    this.row = row;
    this.col = col;
    this.elem = document.createElement('td');
    this.elem.classList.add('cell');
    this.elem.dataset.row = row;
    this.elem.dataset.col = col;
    this._color = EMPTY;
  }

  set color(newColor) {
    this._color = newColor;
    switch (newColor) {
      case EMPTY:
        this.elem.className = 'cell';
        break;
      case BLACK:
        this.elem.className = 'black';
        break;
      case WHITE:
        this.elem.className = 'white';
        break;
      default:
        break;
    }
  }

  get color() {
    return this._color;
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

    return groups;
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
    if (this.get(row, col) !== EMPTY) {
      alert('NOPE');
      return;
    }

    this.set(row, col, this.currentColor);
    const groups = this.findGroups();

    // If any opposing groups are captured, clear them, swap, and finish.
    const capturedGroups = groups.filter(
      group => group.color !== this.currentColor && this.liberties(group).length === 0
    );
    if (capturedGroups.length > 0) {
      for (const capturedGroup of capturedGroups) {
        for (const capturedCell of capturedGroup.cells) {
          this.set(capturedCell.row, capturedCell.col, EMPTY);
        }
      }

      this.swapColor();
      return;
    }

    // If no opposing groups are captured, but our own groups are, then this is
    // an impossible move and we need to revert it.
    const selfCapturedGroups = groups.filter(
      group => group.color === this.currentColor && this.liberties(group).length === 0
    );
    if (selfCapturedGroups.length > 0) {
      this.set(row, col, EMPTY);
      alert('NOPE');
      return;
    }

    // If we haven't finished, then the move was valid and we just need to swap.
    this.swapColor();
  }

  swapColor() {
    if (this.currentColor === BLACK) {
      this.currentColor = WHITE;
    } else {
      this.currentColor = BLACK;
    }
  }

  index(row, col) {
    return (row * this.size) + col;
  }

  set(row, col, color) {
    this.getCell(row, col).color = color;
  }

  get(row, col) {
    return this.getCell(row, col).color;
  }

  getCell(row, col) {
    if ((row >= 0) && (row <= this.size - 1) && (col >= 0) && (col <= this.size - 1)) {
      return this.cells[this.index(row, col)];
    }

    return null;
  }

  left(cell) {
    return this.getCell(cell.row, cell.col - 1);
  }

  right(cell) {
    return this.getCell(cell.row, cell.col + 1);
  }

  up(cell) {
    return this.getCell(cell.row - 1, cell.col);
  }

  down(cell) {
    return this.getCell(cell.row + 1, cell.col);
  }

  liberties(group) {
    const liberties = [];
    for (const cell of group.cells) {
      const siblings = [
        this.left(cell),
        this.right(cell),
        this.up(cell),
        this.down(cell),
      ].filter(c => c !== null);

      for (const sibling of siblings) {
        if (sibling.color === EMPTY) {
          liberties.push(sibling);
        }
      }
    }

    return liberties;
  }
}


window.board = new Board(9);
document.body.appendChild(window.board.elem);
