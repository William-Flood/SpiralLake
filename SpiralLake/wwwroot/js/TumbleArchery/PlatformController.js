
class Platform {
	constructor(elem, row, column) {
		this.elem = elem;
		this.row = row;
		this.column = column;
		this.active = true;
		this.armed = false;
		this.testBlockBottom = this.makeTestBlockBottom.bind(this);
		this.testBlockTop = this.makeTestBlockTop.bind(this);
		this.getPlatformBottom = this.makeGetPlatformBottom.bind(this);
		this.getPlatformTop = this.makeGetPlatformTop.bind(this);
		this.setDims = this.makeSetDims.bind(this);
		this.deactivate = this.makeDeactivate.bind(this);
		this.startDeactivate = this.makeStartDeactivate.bind(this);
		this.activate = this.makeActivate.bind(this);
		this.arm = this.makeArm.bind(this);
		this.disarm = this.makeDisarm.bind(this);
		this.fire = this.makeFire.bind(this);
	}
	makeTestBlockBottom(testY) {
		var platformTop = this.getPlatformBottom() - this.platformHeight;
		if(this.active) {
			if(testY > platformTop) {
				return true;
			} else {
				return false;
			}
		}
		else {
			return false;
		}
	}
	makeTestBlockTop(testYT, testYB) {
		var platformBottom = this.getPlatformBottom();
		var platformTop = platformBottom - this.platformHeight;
		if(this.active) {
			if(testYT < platformBottom && testYB > platformTop) {
				return true;
			} else {
				return false;
			}
		}
		else {
			return false;
		}
	}
	makeSetDims(height, width, platformHeight) {
		this.height = height;
		this.width = width;
		this.platformHeight = platformHeight;
	}
	makeGetPlatformBottom() {
		return (1 + this.row) * this.height;
	}
	makeGetPlatformTop() {
		return (1 + this.row) * this.height - this.platformHeight;
	}
	makeStartDeactivate() {
		this.elem.classList.remove("active");
		this.elem.classList.add("decaying");
		setTimeout(this.deactivate, 500);
	}
	makeDeactivate() {
		this.active = false;
		this.elem.classList.remove("decaying");
	}
	makeActivate() {
		this.active = true;
		this.elem.classList.add("active");
	}
	makeArm() {
		this.armed = true;
		this.elem.classList.add("armed");
	}
	makeDisarm() {
		this.armed = false;
		this.elem.classList.remove("armed");
	}
	makeFire(playerCoords) {
		var boltOrigX = this.width * (this.column + .5)
		var boltOrigY = this.height * this.row + parseInt(this.elem.getElementsByClassName("turret")[0].offsetTop);
		var xOffset = ((playerCoords[0] + playerCoords[1]) / 2 - boltOrigX);
		var yOffset = ((playerCoords[3] + playerCoords[2]) / 2 - boltOrigY);
		var angle;
		if(0 == xOffset) {
			if(0 > yOffset) {
				angle = 90;
			} else {
				angle = -90;
			}
		} else {
			var arcTan = yOffset / xOffset;
			angle = Math.atan(arcTan) * 180 / Math.PI;
			if (0 > xOffset) {
				angle = angle + 180;
			}
		}
		return new Bolt([boltOrigX, boltOrigY], angle);
	}
}