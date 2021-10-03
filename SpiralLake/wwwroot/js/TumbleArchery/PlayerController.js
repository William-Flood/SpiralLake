
class PlayerController {
	constructor() {
		this.walking = false;
		this.onGround = true;
		this.direction = 1;
		this.walk = this.makeWalk.bind(this);
		this.makeStop = this.makeStop.bind(this);
		this.setElem = this.makeSetElem.bind(this);
		this.place = this.makePlace.bind(this);
		this.advanceWalkState = this.makeAdvanceWalkState.bind(this);
		this.stop = this.makeStop.bind(this);
		this.jumping = false;
		this.floating = false;
		this.jump = this.makeJump.bind(this);
		this.stopFloating = this.makeStopFloating.bind(this);
		this.updateDisplay = this.makeUpdateDisplay.bind(this);
		this.getBodyBox = this.makeGetBodyBox.bind(this);
		this.setCurrentCells = this.makeSetCurrentCells.bind(this);
		this.startFire = this.makeStartFire.bind(this);
		this.quitFire = this.makeQuitFire.bind(this);
		this.bowPull = this.makeBowPull.bind(this);
		this.bowFire = this.makeBowFire.bind(this);
		this.setFireMessage = this.makeSetBowFireMessage.bind(this);
		this.setMaxX = this.makeSetMaxX.bind(this);
		this.speed = .5;
		this.BodyHitBoxLeft = 100;
		this.BodyHitBoxWidth = 30;
		this.BodyHitBoxTop = 25;
		this.BodyHitBoxHeight = 100;
		this.TailHitBoxLeft = 25;
		this.TailHitBoxWidth = 80;
		this.TailHitBoxTop = 70;
		this.TailHitBoxHeight = 40;
		this.verticalVelocity = 0;
		this.verticalAcceleration = 0.02;
		this.currentCells = [];
		this.bowReady = true;
		this.bowDrawn = false;
		this.lastTick = performance.now();
	}
	makeWalk(direction) {
		if(!this.walking && !this.bowDrawn) {
			this.walking = true;
			this.direction = direction;
			this.elem.style.transform = "scaleX(" + direction + ")";
			this.walkState = 0;
			this.elem.style.backgroundPosition = "0px 0px";
			this.animTimer = setTimeout(this.advanceWalkState, 150);
		}
	}
	makeStartFire() {
		if(this.bowReady) {
			this.bowDrawn = true;
			this.bowReady = false;
			this.walking = false;
			this.elem.style.backgroundPosition = "-350px 125px";
			clearTimeout(this.animTimer);
			this.animTimer = setTimeout(this.bowPull, 500);
		}
	}
	makeBowPull() {
		this.elem.style.backgroundPosition = "-525px 125px";
		this.animTimer = setTimeout(this.bowFire, 500);
	}
	makeBowFire() {
		this.elem.style.backgroundPosition = "0px 125px";
		var bodyBox = this.getBodyBox();
		this.bowDrawn = false;
		this.bowReady = true;
		this.bowFireMessage(bodyBox, this.direction);
	}
	makeQuitFire() {
		if(this.bowDrawn) {
			this.bowDrawn = false;
			this.elem.style.backgroundPosition = "0px 125px";
		}
	}
	makeUpdateDisplay() {
		var currentTick = performance.now();
		var timestep = currentTick - this.lastTick
		if(this.walking) {
			if(this.onGround) {
				this.place(this.x + this.direction * parseInt(this.speed * timestep), this.y);
			}
		}
		if(this.jumping) {
			var pendingNewY = this.y + this.verticalVelocity * timestep;
			if(pendingNewY < 0) {
				pendingNewY = 0;
			}
			if(0 < this.verticalVelocity) {
				var keepJumping = true;
				for(var cellID = 0; cellID < this.currentCells.length; cellID++) {
					if(this.currentCells[cellID].testBlockBottom(pendingNewY + 125)){
						pendingNewY = this.currentCells[cellID].getPlatformTop() - 125;
						keepJumping = false;
						break;
					}
				}
				if(keepJumping) {
					if(this.floating) {
						this.verticalVelocity += (this.verticalAcceleration / 2);
					}
					else {
						this.verticalVelocity += this.verticalAcceleration;
					}
				}
				else {
					this.onGround = true;
					this.jumping = false;
					this.floating = false;
					this.verticalVelocity = 0;
					if(this.walking) {
						this.elem.style.backgroundPosition = "0px 0px";
						this.animTimer = setTimeout(this.advanceWalkState, 150);
					}
				}
			}
			else {
				for(var cellID = 0; cellID < this.currentCells.length; cellID++) {
					var testYT = pendingNewY + this.BodyHitBoxTop;
					var testYB = pendingNewY + 125;
					if(this.currentCells[cellID].testBlockTop(testYT, testYB)){
						pendingNewY = this.currentCells[cellID].getPlatformBottom() - this.BodyHitBoxTop;
						this.verticalVelocity = 0;
						break;
					}
				}
				if(this.floating) {
					this.verticalVelocity += (this.verticalAcceleration / 4);
				}
				else {
					this.verticalVelocity += this.verticalAcceleration;
				}
			}
			this.y = pendingNewY;
			var deltaX = 0;
			if(this.walking) {
				deltaX = this.direction * parseInt(this.speed * timestep);
			}
			this.place(this.x + deltaX, pendingNewY);
		} else {
			var inActiveCell = (0 == this.currentCells.length);
			for(var cellID = 0; cellID < this.currentCells.length; cellID++) {
				if(this.currentCells[cellID].active) {
					inActiveCell = true;
					break;
				}
			}
			if(!inActiveCell){
				this.onGround = false;
				this.jumping = true;
				this.bowReady = true;
				this.bowDrawn = false;
				clearTimeout(this.animTimer);
				this.elem.style.backgroundPosition = "-175px 125px";
			}
		}
		this.lastTick = currentTick;
		var boundCheck = this.getBodyBox();
		if(boundCheck[0] < 0) {
			this.place(this.x - boundCheck[0], this.y);
		}
		if(boundCheck[2] < 0) {
			this.place(this.x, this.y - boundCheck[2]);
		}
		if(boundCheck[1] > this.maxX) {
			this.place(this.x - (boundCheck[1] - this.maxX), this.y);
			console.log("maxX reached!");
		}
	}
	makeJump() {
		if(!this.jumping && !this.bowDrawn) {
			this.verticalVelocity = -.35;
			this.onGround = false;
			this.elem.style.backgroundPosition = "-175px 125px";
		}
		this.jumping = true;
		this.floating = true;
		clearTimeout(this.animTimer);
	}
	makeStop() {
		if(this.walking) {
			clearTimeout(this.animTimer);
			this.elem.style.backgroundPosition = "0px 125px";
			this.walking = false;
		}
	}
	makeStopFloating() {
		this.floating = false;
	}
	makeSetElem(elem) {
		this.elem = elem;
	}
	makePlace(x, y) {
		this.elem.style.top = y + "px";
		this.elem.style.left = x + "px";
		this.x = x;
		this.y = y;
	}
	makeAdvanceWalkState() {
		this.walkState = (this.walkState + 1) % 4;
		this.elem.style.backgroundPosition = (this.walkState * -175) + "px " + "0px";
		if(this.walking && this.onGround) {
			this.animTimer = setTimeout(this.advanceWalkState, 150);
		}
	}
	makeGetBodyBox() {
		var xL, xR;
		if(1 == this.direction) {
			xL = this.x + this.BodyHitBoxLeft;
			xR = xL + this.BodyHitBoxWidth;
		} else {
			xR = this.x + 175 - this.BodyHitBoxLeft;
			xL = xR - this.BodyHitBoxWidth;
		}
		var yT = this.y + this.BodyHitBoxTop;
		var yB = yT + this.BodyHitBoxHeight;
		return [xL, xR, yT, yB];
	}
	makeSetCurrentCells(cells) {
		this.currentCells = cells;
	}
	makeSetBowFireMessage(messageFn) {
		this.bowFireMessage = messageFn;
	}
	makeSetMaxX(maxX) {
		this.maxX = maxX;
	}
}