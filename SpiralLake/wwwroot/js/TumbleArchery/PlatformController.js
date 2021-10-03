
class Platform {
	constructor(elem, row, column) {
		this.elem = elem;
		this.row = row;
		this.column = column;
		this.platformHeight = elem.getElementsByClassName("platform")[0].clientHeight;
		this.active = true;
		this.armed = false;
		this.testBlockBottom = this.makeTestBlockBottom.bind(this);
		this.testBlockTop = this.makeTestBlockTop.bind(this);
		this.getPlatformTop = this.makeGetPlatformTop.bind(this);
		this.getPlatformBottom = this.makeGetPlatformBottom.bind(this);
		this.getHeight = this.makeGetHeight.bind(this);
		this.getPlatformHeight = this.makeGetPlatformHeight.bind(this);
		this.deactivate = this.makeDeactivate.bind(this);
		this.startDeactivate = this.makeStartDeactivate.bind(this);
		this.activate = this.makeActivate.bind(this);
		this.arm = this.makeArm.bind(this);
		this.disarm = this.makeDisarm.bind(this);
	}
	makeTestBlockBottom(testY) {
		var platformTop = this.getPlatformTop();
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
		var platformTop = this.getPlatformBottom();
		var platformBottom = platformTop + this.getPlatformHeight();
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
	makeGetPlatformTop() {
		var height = this.getHeight();
		var platformHeight = this.getPlatformHeight();
		return (1 + this.row) * height - platformHeight;
	}
	makeGetHeight() {
		return this.elem.clientHeight;
	}
	makeGetPlatformHeight() {
		return this.elem.getElementsByClassName("platform")[0].clientHeight;
	}
	makeGetPlatformBottom() {
		var height = this.getHeight();
		return (1 + this.row) * height;
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
}