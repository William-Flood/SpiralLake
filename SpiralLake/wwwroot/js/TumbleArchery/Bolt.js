
class Bolt {
	constructor(pos, angle) {
		this.elem = document.createElement("div");
		this.elem.classList.add("bolt");
		this.elem.style.top = pos[1] + "px";
		this.elem.style.left = pos[0] + "px";
		this.elem.innerHTML = document.getElementById("BoltData").innerHTML;
		this.elem.getElementsByClassName("rotator")[0].setAttribute("transform", "rotate(" + angle + ", 10, 10)");
		document.getElementById("board").appendChild(this.elem);
		this.x = pos[0];
		this.y = pos[1];
		this.angle = angle;
		this.move = this.makeMove.bind(this);
		this.destroy = this.makeDestroy.bind(this);
		this.inPlay = true;
		this.shouldRemove = false;
		this.setBounds = this.makeSetBounds.bind(this);
		this.testCollision = this.makeTestCollision.bind(this);
	}
	makeMove(distance) {
		this.x += distance * Math.cos(this.angle * Math.PI / 180);
		this.y += distance * Math.sin(this.angle * Math.PI / 180);
		if(this.x < 0
			|| this.y < 0
			|| this.x > this.maxX
			|| this.y > this.maxY
		) {
			this.shouldRemove = true;
			this.inPlay = false;
		}
		this.elem.style.top = this.y + "px";
		this.elem.style.left = this.x + "px";
	}
	makeDestroy() {
		this.elem.remove();
	}
	makeSetBounds(maxX, maxY) {
		this.maxX = maxX;
		this.maxY = maxY;
	}
	makeTestCollision(playerCoords) {
		return this.x > playerCoords[0]
		&& this.x < playerCoords[1]
		&& this.y > playerCoords[2]
		&& this.y < playerCoords[3]
	}
}
