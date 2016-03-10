/* GLOBAL VARIABLES */
var allGroups = [];

function Sprite(x, y, w, h) {

	this.handleParams = function(x, y, w, h) {
		if(x !== undefined && y != undefined) {
			this.position = createVector(x, y);
		} else if(x !== undefined && !y) {
			this.position = createVector(x, 0);
		} else {
			this.position = createVector(0, 0);
		}

		if(w !== undefined && h !== undefined) {
			this.size = createVector(w, h);
		} else if(w !== undefined && !h) {
			this.size = createVector(w, 20);
		} else {
			this.size = createVector(20, 20);
		}
	}

	this.setImage = function(i) {
		if(i instanceof p5.Image) {
			this.image = i;
			this.isImage = true;
		} else if(i instanceof String || typeof i === 'string') {
			if(i.match(/.*\.(png|jpg)/)) {
				this.image = loadImage(i);
				this.isImage = true;
			} else {
				this.image = i;
				this.isImage = false;
			}
		} else {
			this.image = 'rect';
			this.isImage = false;
		}
	}

	this.update = function() {
		this.vel.add(this.accel);

		if(this.maxSpeed) {
			this.__limitSpeed();
		}

		this.position.add(this.vel);
	}

	this.draw = function() {
		if(this.visible) {
			if(this.isImage) {
			image(this.image, this.position.x, this.position.y);
			} else {
				fill(this.color);
				switch(this.image) {
					case 'rect': rect(this.position.x, this.position.y, this.size.x, this.size.y); break;
					case 'ellipse': ellipse(this.position.x, this.position.y, this.size.x, this.size.y); break;
					default: console.log('Unrecognized shape'); rect(this.position.x, this.position.y, this.size.x, this.size.y); break;
				}
			}
		}
		
	}

	this.setVisible = function(v) {
		if(v === undefined) {
			this.visible = true;
		} else {
			this.visible = v;
		}
	}

	this.setVel = function(x, y) {
		if(x !== undefined && y !== undefined) {
			this.vel.x = x;
			this.vel.y = y;
		} else if(x !== undefined && !y) {
			if(x instanceof p5.Vector) {
				this.vel = x;
			} else {
				this.vel.x = x;
			}
		}
	}

	this.getVel = function() {
		return this.vel.mag();
	}

	this.addVel = function(x, y) {
		if(x !== undefined && !y) {
			if(x instanceof p5.Vector) {
				this.vel.add(x);
			} else {
				this.vel.x += x;
			}
		} else {
			this.vel.x += x;
			this.vel.y += y;
		}
	}

	this.__limitSpeed = function() {
		if(Math.abs(this.getVel()) > this.maxSpeed) {
			var c = this.maxSpeed / Math.abs(this.getVel());
			this.vel.x *= c;
			this.vel.y *= c;
		}
	}

	this.setVelLimit = function(lim) {
		this.maxSpeed = lim;
	}

	this.setAccel = function(x, y) {
		if(x !== undefined && y !== undefined) {
			this.accel.x = x;
			this.accel.y = y;
		} else if(x !== undefined && !y) {
			if(x instanceof p5.Vector) {
				this.accel = x;
			} else {
				this.accel.x = x;
			}
		}
	}

	this.addAccel = function(x, y) {
		if(x !== undefined && !y) {
			if(x instanceof p5.Vector) {
				this.accel.add(x);
			} else {
				this.accel.x += x;
			}
		} else {
			this.accel.x += x;
			this.accel.y += y;
		}
	}

	this.stop = function() {
		this.vel.mult(0);
	}

	this.groups = function() {
		return allGroups.filter(function(g) {
			return g.some(function(s) {
				return s === this;
			}, this);
		}, this)
	}

	this.delete = function() {
		this.groups().forEach(function(g) {
			g.delete(this);
		}, this);
	}

	this.setColor = function(c) {
		this.color = c;
	}

	// Axis-aligned bounding box
	this.setBoundingBox = function(offX, offY, w, h, s) {
		s = s || this.image;

		offX = offX || 0;
		offY = offY || 0;

		w = w || this.size.x;
		h = h || this.size.y;

		switch(s) {
			case 'rect':
				return {left: offX, right: offX + w, top: offY, bottom: offY + h};
				break;
		}
	}

	this.colliding = function(s) {
		return (this.boundingbox.bottom + this.position.y >= s.boundingbox.top + s.position.y) &&
				(this.boundingbox.top + this.position.y <= s.boundingbox.bottom + s.position.y) &&
				(this.position.x + this.boundingbox.right >= s.position.x + s.boundingbox.left) && 
				(this.boundingbox.left + this.position.x <= s.position.x + s.boundingbox.right);
	}

	this.bounce = function(s) {
		if(this.colliding(s)) {
			this.vel.mult(-1);
		}
	}

	this.moveTowards = function(x, y, s) {
		var angle = Math.atan2(y - this.position.y, x - this.position.x);
		this.accel.x = Math.cos(angle) * s;
		this.accel.y = Math.sin(angle) * s;
	}

	this.bindKeyPress = function(key, callback) {
		this.keyPresses[key] = callback.bind(this);
	}

	this.bindKeyRelease = function(key, callback) {
		this.keyReleases[key] = callback.bind(this);
	}

	this.isImage = false;
	this.image = 'rect';
	this.color = color(random(255), random(255), random(255));
	this.handleParams(x, y, w, h);
	
	this.vel = createVector(0, 0);
	this.accel = createVector(0, 0);

	this.maxSpeed; 
	this.maxAccel;

	this.keyPresses = {};
	this.keyReleases = {};
	this.visible = true;

	this.boundingbox = this.setBoundingBox(0, 0, this.size.x, this.size.y);
}

function SpriteGroup() {

	this.add = function(s) {
		if(s instanceof Sprite) {
			this.push(s);
		}
	}

	this.get = function(i) {
		return this[i];
	}

	this.update = function() {
		this.forEach(function(x) {
			x.update();
		});
	}

	this.draw = function() {
		this.forEach(function(x) {
			x.draw();
		});
	}

	this.addVel = function(x, y) {
		this.forEach(function(s) {
			s.addVel(x, y);
		});
	}

	this.addAccel = function(x, y) {
		this.forEach(function(s) {
			s.addAccel(x, y);
		});
	}

	this.stop = function() {
		this.forEach(function(s) {
			s.stop();
		});
	}

	this.setVelLimit = function(lim) {
		this.forEach(function(s) {
			s.setVelLimit(lim);
		});
	}

	this.bindKeyPress = function(key, callback) {
		this.forEach(function(s) {
			s.bindKeyPress(key, callback);			
		})
	}

	this.bindKeyRelease = function(key, callback) {
		this.forEach(function(s) {
			s.bindKeyRelease(key, callback);			
		})
	}

	this.getFastestSprite = function() {
		return this.reduce(function(a, b) {
			return (a.vel.mag() > b.vel.mag()) ? a : b;
		});
	}

	this.clear = function() {
		while(this.length > 0) {
			this.pop(0);
		}
	}

	this.delete = function(s) {
		for(var i = 0; i < this.length; i++) {
			if(this[i] === s) {
				this.splice(i, i+1);
			}
		}
	}

	allGroups.push(this);

}

SpriteGroup.prototype = Array.prototype;

var sprites = new SpriteGroup();

function createSprite(x, y, w, h) {
	var s = new Sprite(x, y, w, h);
	sprites.push(s);
	return s;
}

function drawSprites(update) {
	if(update === true || update === undefined) {
		sprites.update();
	}
	sprites.draw();
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	createSprite(500, 100, 100, 100);
	createSprite(500, 500, 200, 200);
}

function draw() {
	clear();
	sprites[0].bounce(sprites[1]);
	drawSprites();
}

function keyPressed() {
	sprites.forEach(function(s) {
		if(s.keyPresses[keyCode] !== undefined) {
			s.keyPresses[keyCode]();
		}
	});
}

function keyReleased() {
	sprites.forEach(function(s) {
		if(s.keyReleases[keyCode] !== undefined) {
			s.keyReleases[keyCode]();
		}
	});
}