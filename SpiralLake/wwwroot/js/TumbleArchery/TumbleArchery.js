var gameOptions = {};
var inGame = false;
var gameOver = false;
var platformArray = new PlatformGridController();

var Jeremy = new PlayerController();
Jeremy.setFireMessage(platformArray.receiveBowFire);

function HandlePress(e) {
	if(inGame) {
		if(39 == e.keyCode) {
			Jeremy.walk(1);
		}
		else if(37 == e.keyCode) {
			Jeremy.walk(-1);
		}
		else if(38 == e.keyCode) {
			e.preventDefault();
			Jeremy.jump();
		}
		else if(96 == e.keyCode || 32 == e.keyCode) {
			e.preventDefault();
			Jeremy.startFire();
		}
		else {
			console.log(e);
		}
	}
}

function HandleUnpress(e) {
	if(inGame) {
		if(39 == e.keyCode) {
			Jeremy.stop();
		}
		else if(37 == e.keyCode) {
			Jeremy.stop();
		}
		else if(38 == e.keyCode) {
			e.preventDefault();
			Jeremy.stopFloating();
		}
		else if(96 == e.keyCode || 32 == e.keyCode) {
			e.preventDefault();
			Jeremy.quitFire();
		}
	}
}

document.addEventListener("keydown", HandlePress);

document.addEventListener("keyup", HandleUnpress);

function ReadValues() {
	var optionCells = document.getElementsByClassName("optionCell");
	for(var cellIndex = 0; cellIndex < optionCells.length; cellIndex++) {
		var cellInputElem = optionCells[cellIndex].getElementsByTagName("input")[0];
		if ("int" == cellInputElem.dataset.type) {
			var cellValue = parseInt(cellInputElem.value);
			if(cellValue && cellValue > 0) {
				gameOptions[cellInputElem.id] = cellValue;
			}
		}
		else if("float" == cellInputElem.dataset.type) {
			var cellValue = parseFloat(cellInputElem.value);
			if(cellValue && cellValue > 0) {
				gameOptions[cellInputElem.id] = cellValue;
			}
		}
	}
}

function mainLoop() {
	Jeremy.updateDisplay();
	var JeremyBodyCoords = Jeremy.getBodyBox();
	platformArray.selectEnteredCells(JeremyBodyCoords);
	Jeremy.setCurrentCells(platformArray.prevEntered);
	platformArray.frameUpdate();
	if(inGame) {
		requestAnimationFrame(mainLoop);
	} else {
		document.getElementById("optionsOverlay").classList.remove("hidden");
	}
}

function StartBoard() {
	ReadValues();
	platformArray.setGameParams(
		gameOptions,
	);
	var boardElement = document.getElementById("board");
	board.innerHTML = "";
	var startHeight = -125;
	platformArray.resetGrid();
	for(var rowID=0; rowID < gameOptions["platform_rows"]; rowID++) {
		var platformRow = document.createElement("div");
		platformRow.classList.add("boardRow");
		platformArray.addRow();
		for(var columnID=0; columnID < gameOptions["platform_columns"]; columnID++) {
			var platformCell = document.createElement("div");
			platformCell.classList.add("platformCell");
			platformCell.classList.add("active");
			var platformClearance = document.createElement("div");
			platformCell.appendChild(platformClearance);
			platformClearance.classList.add("platformClearance");
			var turret = document.createElement("div");
			turret.classList.add("turret");
			platformClearance.appendChild(turret);
			var platformElem = document.createElement("div");
			platformElem.classList.add("platform");
			platformCell.appendChild(platformElem);
			platformRow.appendChild(platformCell);
			platformArray.addPlatform(platformCell, rowID);
		}
		boardElement.appendChild(platformRow);
		startHeight += platformRow.clientHeight;
	}
	startHeight -= document.getElementsByClassName("platform")[0].clientHeight;
	platformArray.setCellDims(
		document.getElementsByClassName("boardRow")[0].clientHeight, 
		document.getElementsByClassName("platform")[0].clientWidth,
		document.getElementsByClassName("platform")[0].clientHeight
	);
	var JeremyElem = document.createElement("div");
	JeremyElem.id = "Jeremy";
	boardElement.appendChild(JeremyElem);
	JeremyElem.style.backgroundPosition = "0px 125px";
	Jeremy.setElem(JeremyElem);
	Jeremy.place(0, startHeight);
	document.getElementById("optionsOverlay").classList.add("hidden");
	inGame = true;
	platformArray.lastTick = performance.now();
	Jeremy.lastTick = performance.now();
	requestAnimationFrame(mainLoop);
}