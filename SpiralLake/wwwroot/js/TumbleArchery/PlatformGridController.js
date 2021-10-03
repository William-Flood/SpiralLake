
class PlatformGridController {
	constructor() {
		this.resetGrid = this.makeResetGrid.bind(this);
		this.addRow = this.makeAddRow.bind(this);
		this.addPlatform = this.makeAddPlatform.bind(this);
		this.setPlayerCoords = this.makeSetPlayerCoords.bind(this);
		this.setCellDims = this.makeSetCellDims.bind(this);
		this.setBoardDims = this.makeSetBoardDims.bind(this);
		this.prevEntered = [];
		this.frameUpdate = this.makeFrameUpdate.bind(this);
		this.lastTick = performance.now();
		this.setGameParams = this.makeSetGameParams.bind(this);
		this.receiveBowFire = this.makeReceiveFireMessage.bind(this);
		this.setGameOver = this.makeSetGameOver.bind(this);
	}
	makeResetGrid() {
		this.grid = [];
		this.armedCells = [];
		this.turretsDisarmed = 0;
		this.boltList = [];
	}
	makeSetGameParams(options) {
		this.decayRate = options["platform_decay_speed"];
		this.deployRate = options["platform_deploy_speed"];
		this.deployLength = options["platform_deployment_line_length"];
		this.armRate = options["turret_deploy_speed"];
		this.fireRate = options["turret_fire_speed"];
		this.boltSpeed = options["bolt_speed"];
	}
	makeAddRow() {
		this.grid.push([]);
	}
	makeAddPlatform(elem, row) {
		this.grid[row].push(new Platform(elem, row, this.grid[row].length));
	}
	makeSetCellDims(height, width, platformHeight) {
		this.cellHeight = height;
		this.cellWidth = width;
		this.platformHeight = platformHeight;
		for(var rowID = 0; rowID < this.grid.length; rowID++) {
			for(var colID = 0; colID < this.grid[rowID].length; colID++) {
				this.grid[rowID][colID].setDims(height, width, platformHeight);
			}
		}
	}
	makeSetPlayerCoords(coords) {
		this.playerCoords = coords;
		var leftColumn = parseInt(coords[0] / this.cellWidth);
		var rightColumn = parseInt(coords[1] / this.cellWidth);
		var topRow = parseInt(coords[2] / this.cellHeight);
		var bottomRow = parseInt(coords[3] / this.cellHeight);
		if(bottomRow >= this.grid.length) {
			this.setGameOver()
			return;
		}
		for(var cellID = 0; cellID < this.prevEntered.length; cellID++) {
			this.prevEntered[cellID].elem.classList.remove("hasJeremy");
		}
		this.prevEntered = [this.grid[topRow][leftColumn]];
		if(leftColumn != rightColumn) {
			this.prevEntered.push(this.grid[topRow][rightColumn])
		}
		if(topRow != bottomRow) {
			this.prevEntered.push(this.grid[bottomRow][leftColumn]);
			if(leftColumn != rightColumn) {
				this.prevEntered.push(this.grid[bottomRow][rightColumn])
			}
		}
		for(var cellID = 0; cellID < this.prevEntered.length; cellID++) {
			if(!this.prevEntered[cellID].elem.classList.contains("hasJeremy")) {
				this.prevEntered[cellID].elem.classList.add("hasJeremy");
			}
		}
	}
	makeSetGameOver() {
		inGame = false;
		gameOver = true;
		document.getElementById("GameOverScreen").classList.remove("hidden");
		document.getElementById("score").innerText = this.turretsDisarmed;
		document.getElementById("theme").pause();
	}
	makeFrameUpdate() {
		var currentTick = performance.now();
		var decayProb = this.decayRate * (currentTick - this.lastTick);
		var armProb = this.armRate * (currentTick - this.lastTick);
		var deployProb = this.deployRate * (currentTick - this.lastTick);
		var fireProb = this.fireRate * (currentTick - this.lastTick);
		for(var rowID = 0; rowID < this.grid.length; rowID++) {
			if((this.grid.length - 1) == rowID) {
				decayProb *= 0.5;
			}
			for(var colID = 0; colID < this.grid[rowID].length; colID++) {
				if(decayProb > Math.random()) {
					this.grid[rowID][colID].startDeactivate();
				}
				if(armProb > Math.random() && ((this.grid.length - 1) != rowID)) {
					this.grid[rowID][colID].arm();
					this.armedCells.push([rowID, colID]);
				}
				else if((colID + this.deployLength) <= this.grid[rowID].length
					&& deployProb > Math.random()) {
					for(var deployID = 0; deployID < this.deployLength; deployID++) {
						var deployingCell = this.grid[rowID][colID + deployID];
						if(!this.prevEntered.includes(deployingCell)) {
							deployingCell.activate();
						}
					}
				}
			}
		}
		for(var activeId = 0; activeId < this.armedCells.length; activeId++) {
			if(fireProb > Math.random()) {
				var newBolt = this.grid[this.armedCells[activeId][0]][this.armedCells[activeId][1]].fire(this.playerCoords);
				this.boltList.push(newBolt);
				newBolt.setBounds(this.maxX, this.maxY);
			}
		}
		var escapedBolts = [];
		for(var boltID = 0; boltID < this.boltList.length; boltID++) {
			this.boltList[boltID].move(this.boltSpeed * (currentTick - this.lastTick));
			if(this.boltList[boltID].testCollision(this.playerCoords)) {
				this.setGameOver()
			}
			if(!this.boltList[boltID].inPlay) {
				escapedBolts.push(boltID);
			}
		}
		for(var boltID = escapedBolts.length - 1; boltID >= 0; boltID--) {
			this.boltList[escapedBolts[boltID]].destroy();
			this.boltList.splice(escapedBolts[boltID], 1);
		}
		this.lastTick = currentTick;
	}
	makeSetBoardDims(maxX, maxY) {
		this.maxX = maxX;
		this.maxY = maxY;
	}
	makeReceiveFireMessage(coords, dir) {
		var fireColumn;
		if(1 == dir) {
			fireColumn = parseInt(coords[1] / this.cellWidth);
		} else {
			fireColumn = parseInt(coords[0] / this.cellWidth);
		}
		var fireRow = parseInt(coords[3] / this.cellHeight);
		var struckCell;
		var struckDistance;
		var candidateCells = [];
		for(var cellID = 0; cellID < this.armedCells.length; cellID++) {
			if(this.armedCells[cellID][0] == fireRow) {
				var cellDistance = dir * (this.armedCells[cellID][1] - fireColumn);
				if(0 < cellDistance) {
					if(struckCell || struckCell === 0) {
						if(cellDistance < struckDistance) {
							struckCell = cellID;
							candidateCells.push([cellID, this.armedCells[cellID], cellDistance, struckDistance]);
							struckDistance = cellDistance;
						}
					} else {
						struckCell = cellID;
						struckDistance = cellDistance;
						candidateCells.push([cellID, this.armedCells[cellID], cellDistance]);
					}
				}
			}
		}
		if(struckCell || struckCell === 0) {
			this.turretsDisarmed ++;
			this.grid[this.armedCells[struckCell][0]][this.armedCells[struckCell][1]].disarm();
			this.armedCells.splice(struckCell, 1);
		}
	}
}
