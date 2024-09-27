
    const game = document.getElementById('game')



    const boardSize = 4;
    const boardSizeCount = boardSize * boardSize;
    
     class Board {
      constructor(boardElement) {
        this.items = []
        for (let i = 0; i < boardSizeCount; i++) {
          this.items.push(
            new Item(boardElement, i % boardSize, Math.floor(i / boardSize))
          )
        }

        this.itemsGroupedByColumn = this.groupeItemsColumn()
        this.itemsGroupedByColumnReverse = this.itemsGroupedByColumn.map(column => [...column].reverse())
        this.itemsGroupedByRow = this.groupeItemsRow()
        this.itemsGroupedByRowReverse = this.itemsGroupedByRow.map(row => [...row].reverse())

    }
    
    getRandomEmptyItem() {
      const emptyItems = this.items.filter(item => item.isEmpty())
      const randomItems = Math.floor(Math.random() * emptyItems.length)
      return emptyItems[randomItems]
    }


    groupeItemsColumn() {
      return this.items.reduce((itemsGroup, item) => {
        itemsGroup[item.x] = itemsGroup[item.x] || []
        itemsGroup[item.x][item.y] = item
        return itemsGroup
      }, [])
    }
    

    groupeItemsRow() {
      return this.items.reduce((itemsGroup, item) => {
        itemsGroup[item.y] = itemsGroup[item.y] || []
        itemsGroup[item.y][item.x] = item
        return itemsGroup
      }, [])
    }
  }


    class Item {
    constructor(boardElement, x, y) {
        const item = document.createElement("div")
        item.classList.add("item")
        boardElement.append(item)
        this.x = x
        this.y = y
      }

      linkTile(tile) {
        tile.setXY(this.x, this.y)
        this.linkedTile = tile
      }

      notLinkTile() {
        this.linkedTile = null
      }

      isEmpty() {
        return !this.linkedTile
      }

      tileForCombine(tile) {
        tile.setXY(this.x, this.y)
        this.linkedTileForCombine = tile
      }

      notLinkTileCombine () {
        this.linkedTileForCombine = null
      }

      hasTileForCombine() {
        return !!this.linkedTileForCombine
      }


      canCombine(newTile) {
        return this.isEmpty() || (!this.hasTileForCombine() && this.linkedTile.value === newTile.value)
      }

      
      combineTiles() {
        this.linkedTile.setValue(this.linkedTile.value + this.linkedTileForCombine.value)
        this.linkedTileForCombine.removeFromDOM()
        this.notLinkTileCombine()
      }

    }
    

  class Tile {
    constructor(boardElement) {
        this.tileElement = document.createElement("div")
        this.tileElement.classList.add("tile")
        /* this.value = Math.random() > 0.5 ? 2 : 4
        this.tileElement.textContent = this.value */
        this.setColor(Math.random() > 0.5 ? 2 : 4)
        boardElement.append(this.tileElement)
    }

    setValue(value) {
      this.value = value;
      this.setColor(value);
    }

    setXY(x, y) {
      this.x = x
      this.y = y
      this.tileElement.style.setProperty('--x', x)
      this.tileElement.style.setProperty('--y', y)
    }

    setColor(color) {
      this.value = color
      this.tileElement.textContent = color
      const tilesColor = 100 - Math.log2(color) * 9
      this.tileElement.style.setProperty('--tile-color', `${tilesColor}%`)
      this.tileElement.style.setProperty('--tile-text', `${tilesColor < 50 ? 90 : 10}%`)
    }

    removeFromDOM() {
      this.tileElement.remove()
    }

    waitAnimationEnd() {
      return new Promise(resolve => {
        this.tileElement.addEventListener('transitionend', resolve, { 'once': true })
      })
    }

    waitMoveCheck() {
      return new Promise(resolve => {
        this.tileElement.addEventListener('animationend', resolve, {'once': true})
      })
    }
  }


const board = new Board(game)

board.getRandomEmptyItem().linkTile(new Tile(game))

setInput()

function setInput() {
  window.addEventListener('keydown', handleInput, {once: true})
}

async function handleInput(event) {
  //console.log('Key pressed:', event.key);
  switch(event.key) {
    case 'ArrowUp':
      if (!canMoveUp()) {
        setInput()
        return
      }
      await moveUp()
      break;
    case 'ArrowDown':
      if (!canMoveDown()) {
        setInput()
        return
      }
      await moveDown()
      break;
    case 'ArrowLeft':
      if (!canMoveLeft()) {
        setInput()
        return
      }
      await moveLeft()
      break;
    case 'ArrowRight':
      if (!canMoveRight()) {
        setInput()
        return
      }
      await moveRight()
      break;
    default:
      setInput()
      return
  }


  const newTile = new Tile(game)
  board.getRandomEmptyItem().linkTile(newTile)

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    //await newTile.waitMoveCheck()
    alert('Loose???Ohhh...Dont worry, next time will be the same result)))')
    return
  }   

  setInput()
}

async function moveUp() {
  await moveTiles(board.itemsGroupedByColumn)
}
async function moveDown() {
  await moveTiles(board.itemsGroupedByColumnReverse)
}
async function moveLeft() {
  await moveTiles(board.itemsGroupedByRow)
}
async function moveRight() {
  await moveTiles(board.itemsGroupedByRowReverse)
}

async function moveTiles(itemsGroup) {
  //console.log(itemsGroup)
  const animationEnd = []

  itemsGroup.forEach(group => moveTilesinGroup(group, animationEnd))

  await Promise.all(animationEnd)

  board.items.forEach(item => {
    item.hasTileForCombine() && item.combineTiles();
  })
  
}

function moveTilesinGroup(group, animationEnd) {
  for (let i = 1; i < group.length; i++) {
    if (group[i].isEmpty()) {
      continue
    }
    const itemWithTile = group[i]

    let targetItem
    let j = i - 1
    while (j >= 0 && group[j].canCombine(itemWithTile.linkedTile)) {
      targetItem = group[j]
      j--
    }
    if (!targetItem) {
      continue
    }

    animationEnd.push(itemWithTile.linkedTile.waitAnimationEnd())

    if (targetItem.isEmpty()) {
      targetItem.linkTile(itemWithTile.linkedTile)
    } else {
      targetItem.tileForCombine(itemWithTile.linkedTile)
    }

    itemWithTile.notLinkTile()
  }

  
}

function canMoveUp() {
  return canMove(board.itemsGroupedByColumn)
}
function canMoveDown() {
  return canMove(board.itemsGroupedByColumnReverse)
}
function canMoveLeft() {
  return canMove(board.itemsGroupedByRow)
}
function canMoveRight() {
  return canMove(board.itemsGroupedByRowReverse)
}

function canMove(groupedItem) {
  return groupedItem.some(group => canMoveInGroup(group))
}  

function canMoveInGroup(group) {
  return group.some((item, index) => {
    if (index === 0) {
      return false
    }
    if (item.isEmpty()) {
      return false
    }

    const targetItem = group[index - 1]
    return targetItem.canCombine(item.linkedTile)
  })
}


