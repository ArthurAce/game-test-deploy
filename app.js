
    const game = document.getElementById('game')
    const newGameBtn = document.querySelector('.new-game')

    let score = 0
    let gameOver = false

    const boardSize = 4;
    const boardSizeCount = boardSize * boardSize;

    function endGame(message) {
      gameOver = true
      window.removeEventListener('keydown', handleInput);

      addBestScore(score);
    
      setTimeout(() => {
        alert(message)
      }, 500);
    }
    
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


      
      /* combineTiles() {
        this.linkedTile.setValue(this.linkedTile.value + this.linkedTileForCombine.value)
        this.linkedTileForCombine.removeFromDOM()
        this.notLinkTileCombine()
      } */

        combineTiles() {
          const combinedValue = this.linkedTile.value + this.linkedTileForCombine.value;
          
          this.linkedTile.setValue(combinedValue);
          this.linkedTileForCombine.removeFromDOM()
          this.notLinkTileCombine()

          score += combinedValue
          updateScoreDisplay()
        }
          

    }
    

  class Tile {
    constructor(boardElement) {
        this.tileElement = document.createElement("div")
        this.tileElement.classList.add("tile")
        this.setColor(2)
        boardElement.append(this.tileElement)
    }


    setValue(value) {
      this.value = value
      this.setColor(value)

      /* function endGame(message) {
        gameOver = true
        window.removeEventListener('keydown', handleInput);

        addBestScore(score);
      
        setTimeout(() => {
          alert(message)
        }, 500);
      } */
      

      if (this.value === 2048) {
        endGame('You won! Congratulations! 🎉');
      }

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

function updateScoreDisplay() {
  const scoreElement = document.getElementById('score')
  scoreElement.textContent = `Score: ${score}`
}



async function handleInput(event) {
  //console.log('Key pressed:', event.key);

  if (gameOver) {
    return
  }

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

  /* if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    //await newTile.waitMoveCheck()
    alert('Loose???Ohhh...Dont worry, next time will be the same result)))')
    return
  } */

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {

      endGame('Loose???Ohhh...Dont worry, next time will be the same result)))')
      return;
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
    item.hasTileForCombine() && item.combineTiles()
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


newGameBtn.addEventListener('click', startNewGame)

function startNewGame() {

  gameOver = false


  board.items.forEach(item => {
    if (item.linkedTile) {
      item.linkedTile.removeFromDOM()
      item.notLinkTile()
    }
    if (item.linkedTileForCombine) {
      item.notLinkTileCombine()
    }
  });


  score = 0
  updateScoreDisplay()

  board.getRandomEmptyItem().linkTile(new Tile(game))


  setInput()
}


const bestScoresList = document.getElementById('best-scores-list')


function updateBestScoresDisplay() {
    const bestScores = getBestScores()
    bestScoresList.innerHTML = ''

    bestScores.forEach((record, index) => {
        const li = document.createElement('li')
        //li.textContent = `${index + 1}. Score: ${record}`
        li.textContent = `Score: ${record}`

        bestScoresList.appendChild(li)
    })
}

function getBestScores() {
    const bestScores = JSON.parse(localStorage.getItem('bestScores')) || []
    return bestScores
}

function addBestScore(newScore) {
    const bestScores = getBestScores()
    
    bestScores.push(newScore)
    bestScores.sort((a, b) => b - a)

    if (bestScores.length > 10) {
        bestScores.pop()
    }

    localStorage.setItem('bestScores', JSON.stringify(bestScores))


    updateBestScoresDisplay()
}

updateBestScoresDisplay()


let touchStartX = 0
let touchStartY = 0
let isTouching = false

game.addEventListener('touchstart', handleTouchStart, { 'passive': true })
game.addEventListener('touchmove', handleTouchMove, { 'passive': true })
game.addEventListener('touchend', handleTouchEnd, { 'passive': true })

function handleTouchStart(event) {
    const touch = event.touches[0]
    touchStartX = touch.clientX
    touchStartY = touch.clientY
    isTouching = true
}

function handleTouchMove(event) {
    if (!isTouching || gameOver) return

    const touch = event.touches[0]
    const touchEndX = touch.clientX
    const touchEndY = touch.clientY

    const deltaX = touchEndX - touchStartX
    const deltaY = touchEndY - touchStartY

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 50) {
            handleInput({ 'key': 'ArrowRight' })
            isTouching = false
        } else if (deltaX < -50) {
            handleInput({ 'key': 'ArrowLeft' })
            isTouching = false
        }
    } else {
        if (deltaY > 50) {
            handleInput({ 'key': 'ArrowDown' })
            isTouching = false
        } else if (deltaY < -50) {
            handleInput({ 'key': 'ArrowUp' })
            isTouching = false
        }
    }
}

function handleTouchEnd() {
    isTouching = false
}



