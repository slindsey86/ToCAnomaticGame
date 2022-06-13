
var bossLife;
function timer() {
	bossLife = bossLife - 1;
	if (bossLife <= 0) {
		clearInterval(bossCounter);
		return;
	}
	$('#boss-life').html(bossLife)
}

var audio = {};
audio["intro"] = new Audio();
audio["intro"].src = 'assets/js/Anomatic-Intro.wav'
audio["loop"] = new Audio();
audio["loop"].src = 'assets/js/Anomatic-Loop.wav'

function rand(min, max) { return Math.floor(Math.random() * (max - min)) + min; }
function frand(min, max) { return Math.random() * (max - min) + min; } //float arandom
var bossCounter;
var lS = localStorage;
function fakeFinishGame(score) {
	const data = { type: 'FINISH_MINIGAME', payload: { score: score } };
	window.parent.postMessage(data, '*');
}
(function () {
	var J = {
		lastTime: (new Date()).getTime(),  //lasttime
		BossLife: 30,
		canvasWidth: 600,
		canvasHeight: 600,
		interval: 0,
		level: 1,
		fps: 30,
		Boss: false,
		BossLiveInterval: false,
		bossFireRate: 100,
		scoreNeeded: 30,
		Player: {
			x: this.canvasWidth / 2,
			y: this.canvasHeight / 2,
			x: this.canvasWidth / 2,
			y: this.canvasHeight / 2,
			radius: 10,
			score: 0
		},
		circleRadius: 10,
		maxCircleRadiusInterval: 10,
		maxCircles: 45,
		maxScore: 0,
		totalEaten: 0,
		spawnCirclesCounter: 0,
		circles: [],
		colors: ['Blue', 'DeepSkyBlue', 'MediumSlateBlue', 'Aquamarine', 'Lime', 'Indigo', 'Red', 'DarkRed', 'Fuchsia', 'Magenta', 'Orange', 'OrangeRed', 'GreenYellow', 'Purple'],

		resetStartValues: function () {
			J.lastTime = (new Date()).getTime(),  //lasttime
				J.startx = 100,
				J.starty = 100,
				J.circleRadius = 10
			J.deleteAll()


			J.Player.x = J.canvasWidth / 2
			J.Player.y = J.canvasHeight / 2
			J.Player.rx = J.canvasWidth / 2
			J.Player.ry = J.canvasHeight / 2
			J.Player.radius = 10
			J.Player.score = 0

		},
		resetLevelValues: function () {
			J.lastTime = (new Date()).getTime(),  //lasttime
				J.startx = 100,
				J.starty = 100,
				J.circleRadius = 10 + J.level
			J.deleteAll()

			J.Player.x = J.canvasWidth / 2
			J.Player.y = J.canvasHeight / 2
			J.Player.rx = J.canvasWidth / 2
			J.Player.ry = J.canvasHeight / 2
			J.Player.radius = 12


		},
		init: function (restart) {
			J.canvas = document.getElementById('canvas');
			J.ctx = J.canvas.getContext('2d')
			J.canvasWidth = 1080
			J.canvasHeight = 856

			J.setScore(0)
			J.setMaxScore(lS.getItem('maxScore') | 0);

			J.setLocalStorage();
			J.Boss = false;
			$(J.canvas).attr({ width: J.canvasWidth, height: J.canvasHeight })




			if (restart) {
				$('#start').show()
				$('#start-button').css('display', 'none')
				$('#end-button').show()
			}
			$('#start-button').unbind('click').bind('click', function () {
				audio["intro"].pause(); // Stop playing
				audio["intro"].currentTime = 0; // Reset time
				audio["loop"].pause(); // Stop playing
				audio["loop"].currentTime = 0; // Reset time
				audio["intro"].play();

				J.canvasWrite('Level ' + J.level, J.start)
				audio["intro"].addEventListener('ended', function () {
					audio["loop"].play();
					audio["loop"].loop = true;
				})
			})

			$('#boss-life').html(0)

		},


		canvasWrite: (text, cb) => {
			J.deleteItem(J.Player.rx, J.Player.ry, J.Player.radius)
			$(J.canvas).unbind('mousemove').css('cursor', 'default')
			J.ctx.fillStyle = "#fff";
			J.ctx.textBaseLine = 'middle';
			J.ctx.textAlign = 'center';

			if (text == 'Level ' + J.level) {
				//J.scoreNeeded = 30;
				$(".content").css("background-image", "url(anomatic-bg.png)");
				J.ctx.font = "bold 24px lunchTime";
				J.ctx.fillText(text, 500, 400);

			}

			if (text == 'boss1') {
				$(".content").css("background-image", "url(anomatic-bg-boss.png)");
				J.ctx.font = "bold 24px lunchTime";
				J.ctx.fillText('Mega Particle!', 500, 400);

				J.ctx.font = "bold 18px lunchTime";
				J.ctx.fillText('Dodge the deadly particles for 30 seconds!', 500, 440);

			}


			$('#start').css('display', 'none')
			setTimeout(() => {

				J.ctx.fillStyle = "#000"
				J.ctx.font = "bold 24px lunchTime";
				J.ctx.clearRect(200, 200, 400, 300);
				$(J.canvas).mousemove(J.mouseMove).css('cursor', 'none')
				cb()
			}, 3000);

		},

		deleteItem: function (x, y, radius) {
			J.ctx.beginPath();
			J.ctx.arc(x, y, radius + 1, 0, Math.PI * 2, false)
			J.ctx.fillStyle = "#000"
			J.ctx.closePath()
			 
			J.ctx.fill();

		},

		deleteObj: function (obj) {
			J.ctx.beginPath();
			J.ctx.arc(obj.x, obj.y, obj.radius + 1, 0, Math.PI * 2, false)
			J.ctx.fillStyle = "#000"
			J.ctx.closePath()
			J.ctx.fill();

		},
		draw: function (x, y, radius, color) {
			J.ctx.beginPath()
			J.ctx.arc(x, y, radius, Math.PI * 2, false)
			J.ctx.fillStyle = color
			J.ctx.closePath()
			J.ctx.fill()
		},


		start: function () {

			if (J.level < 2) {
				J.resetStartValues();
			}
			else {
				J.resetLevelValues()
			}
			J.interval = setInterval(J.tick, J.fps);
			J.spawnCircles()
			$('canvas').css('cursor', 'none')
			$(J.canvas).mousemove(J.mouseMove)
			$(document).bind('touchmove', J.touchMove)
			$(document).bind('keypress', J.keyPress)

		},

		spawnCircles: function () {
			setTimeout(function () {
				J.circles[J.spawnCirclesCounter] = J.createCircle()
				J.spawnCirclesCounter++
				if (J.spawnCirclesCounter <= J.maxCircles) {
					J.spawnCircles()
				}
				else J.spawnCirclesCounter = 0;
			}, 60)


		},

		spawnBoss: function () {
			J.deleteObj(J.Player)
			J.Player.radius = 10;

			J.Boss = J.createBoss();
			J.draw(J.Boss.x, J.Boss.y, J.Boss.radius, J.Boss.color);


			bossLife = J.BossLife;
			$('#boss-life').html(bossLife).show()
			J.scoreNeeded += 30
			setTimeout(function () {
				bossCounter = setInterval(function () {
					//timer
					J.setScore(++J.Player.score)

					bossLife = bossLife - 1;
					$('#boss-life').html(bossLife).show()
					if (bossLife <= 0) {
						clearInterval(bossCounter);
						return;
					}
				}, 1000);
				J.Boss.shoot()

				J.BossLiveInterval = setTimeout(J.Boss.die, (bossLife + 1) * 1000);
			}, 3000)
		},

		createBoss: function () {
			boss = {
				radius: 20,
				color: '#f00',
				//x : J.canvasHeight / 4 * 3,
				//y : J.canvasWidth / 2,
				x: J.canvasWidth / 2,
				y: 40,

				alive: true,
				shoot: function () {
					J.bossInterval = setTimeout(J.createShoot, J.bossFireRate)
				},
				die: function () {
					J.Boss = {};
					J.BossKilled = 1;
					J.level += 1;
					J.scoreNeeded += 15;
					J.bossFireRate += 2;
					J.Boss.BossLife += 5;
					J.Player.radius += 10;
					lS.setItem('BossKilled', 1);
					clearInterval(bossCounter)
					clearInterval(J.bossInterval)
					J.deleteAll();
					J.deleteItem(J.Player.rx, J.Player.ry, J.Player.radius)
					J.canvasWrite('Level ' + J.level, J.start)


				},
				erase: function () {

				},
				shootSeed: 0
			}
			return boss

		},
		createShoot: function () {
			circle = {
				radius: 50,
				color: '#ff0',

				move: function () {
					if (this.inBounds()) {
						r = 5
						this.x += this.vx * r
						this.y += this.vy * r
					}
				},

				inBounds: function () {
					if (this.x + this.radius < 0 ||
						this.x - this.radius > J.canvasWidth ||
						this.y + this.radius < 0 ||
						this.y - this.radius > J.canvasHeight)
						return false
					else
						return true
				}
			}
			r = Math.random()

			circle.x = J.Boss.x
			circle.y = J.Boss.y

			J.Boss.shootSeed++;
			if (J.Boss.shootSeed == 2) {
				J.Boss.shootSeed = 0;
			}
			switch (J.Boss.shootSeed) {
				case 0:
					circle.vx = -1
					circle.vy = 1

					break;
				case 1:
					circle.vx = 1
					circle.vy = 1


					break;

			}
			r = Math.random()
			circle.vx += frand(-1, 1)
			circle.vy += frand(-1, 1)

			J.circles.push(circle)

			J.Boss.shoot()

		},

		setScore: function (score) {
			$('#score').html(score)
			$('#scoreNeeded').html(J.scoreNeeded)
			if (score > lS.getItem('maxScore')) {
				J.setMaxScore(score);
			}

			if (score) {
				J.totalEaten++;
				lS.setItem('totalEaten', J.totalEaten)
			}

		},

		setMaxScore: function (score) {
			lS.setItem('maxScore', score);
			$('#max-score').html(lS.getItem('maxScore'))
			$('#60maxScore-progress').html(score)
		},
		tick: function () {

			now = (new Date()).getTime()
			window.elapsed = now - J.lastTime
			J.lastTime = now
			J.ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (var i = 0; i < J.circles.length; i++) {
				var circle = J.circles[i];
				J.deleteItem(circle.x, circle.y, circle.radius)
				circle.move();
				J.draw(circle.x, circle.y, circle.radius, circle.color);
			}

			J.deleteItem(J.Boss.rx, J.Boss.ry, J.Boss.radius)
			J.draw(J.Boss.x, J.Boss.y, J.Boss.radius, J.Boss.color);

			J.deleteItem(J.Player.rx, J.Player.ry, J.Player.radius)
			J.draw(J.Player.x, J.Player.y, J.Player.radius, "#fff");
			J.detectCollision()
		},
		createCircle: function () {

			circle = {
				radius: rand(J.circleRadius - J.maxCircleRadiusInterval, J.circleRadius + J.maxCircleRadiusInterval + 7),
				color: J.colors[rand(0, J.colors.length - 1)],

				move: function () {
					if (this.inBounds()) {

						this.x += this.vx * elapsed / 15
						this.y += this.vy * elapsed / 15
					} else {

						for (var i = 0; i < J.circles.length; i++) {
							
							if (J.circles[i].x == this.x && J.circles[i].y == this.y) {
								J.circles[i] = J.createCircle();
							}
						}
					}
				},

				inBounds: function () {
					if (this.x + this.radius < 0 ||
						this.x - this.radius > J.canvasWidth ||
						this.y + this.radius < 0 ||
						this.y - this.radius > J.canvasHeight)
						return false
					else
						return true
				}
			}
			r = Math.random()
			if (r <= .25) {
				circle.x = 1 - circle.radius
				circle.y = Math.random() * J.canvasHeight
				circle.vx = Math.random()
				circle.vy = Math.random()
			} else if (r > .25 && r <= .5) {
				circle.x = J.canvasWidth + circle.radius - 1
				circle.y = Math.random() * J.canvasHeight
				circle.vx = - Math.random()
				circle.vy = Math.random()
			} else if (r > .5 && r <= .75) {
				circle.x = Math.random() * J.canvasHeight
				circle.y = 1 - circle.radius
				circle.vx = Math.random()
				circle.vy = Math.random()
			} else {
				circle.x = Math.random() * J.canvasHeight
				circle.y = J.canvasHeight + circle.radius - 1
				circle.vx = Math.random()
				circle.vy = - Math.random()
			}

			if (Math.abs(circle.vx) + Math.abs(circle.vy) < 1) {
				circle.vx = circle.vx < 0 ? -1 : 1
				circle.vy = circle.vy < 0 ? -1 : 1
			}


			return circle;
		},

		mouseMove: function (e) {
			var mouseX, mouseY;

			if (e.offsetX) {
				mouseX = e.offsetX;
				mouseY = e.offsetY;
			}
			else if (e.layerX) {
				mouseX = e.layerX;
				mouseY = e.layerY;
			}


			J.Player.rx = J.Player.x,
				J.Player.ry = J.Player.y
			J.Player.x = mouseX
			J.Player.y = mouseY
			J.deleteItem(J.Player.rx, J.Player.ry, J.Player.radius)
			J.draw(J.Player.x, J.Player.y, J.Player.radius, "#fff");
		},
		touchMove: function (e) {
			e.preventDefault()
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]
			J.mouseMove(touch)
		},

		detectCollision: function () {
			for (var i = 0; i < J.circles.length; i++) {
				circle = J.circles[i]
				dist = Math.pow(
					Math.pow(circle.x - J.Player.x, 2) +
					Math.pow(circle.y - J.Player.y, 2),
					.5)

				if (dist < J.Player.radius + circle.radius) {
					if (circle.radius > J.Player.radius) {
						J.death()
					} else {
						J.eat(i)
					}
				}
			}

			if (J.Boss) {
				dist = Math.pow(
					Math.pow(J.Boss.x - J.Player.x, 2) +
					Math.pow(J.Boss.y - J.Player.y, 2),
					.5)

				if (dist < J.Player.radius + J.Boss.radius) {
					if (J.Boss.radius > J.Player.radius) {
						J.death()
					}
				}
			}

		},

		eat: function (index) {
			circle = J.circles[index]
			J.deleteItem(circle.x, circle.y, circle.radius)
			J.circles.splice(index, 1)
			J.circleRadius = J.circleRadius + 1;
			J.circles.push(J.createCircle());
			J.Player.radius = J.Player.radius + 1;
			J.Player.score++
			J.setScore(J.Player.score)
			if ((J.Player.score) == J.scoreNeeded) {
				J.deleteAll();
				J.deleteItem(J.Player.rx, J.Player.ry, J.Player.radius)
				J.canvasWrite('boss1', J.spawnBoss)
			}
		},
		death: function () {
			score = J.Player.score
			$(J.canvas).unbind('mousemove').css('cursor', 'default')
			wordpoints = (score > 1) ? 'points' : 'point'
			$('#you-died-score').html(score)
			$('#you-died-points-word').html(wordpoints)
			$(".content").css("background-image", "url(anomatic-bg-end.png)");
			$('#you-died').show()
			J.scoreNeeded = 30;
			J.deleteAll();
			clearInterval(J.interval)
			clearInterval(J.bossInterval)
			clearInterval(J.BossLiveInterval)
			clearInterval(J.maxCircleRadiusInterval)
			clearInterval(bossCounter)
			J.level = 1;

			J.init(true);
		},
		deleteAll: function () {
			for (var i = 0; i < J.circles.length; i++) {
				circle = J.circles[i];
				J.deleteItem(circle.x, circle.y, circle.radius)
			}
			J.circles = [];
		},
		setLocalStorage: function () {

			if (lS.getItem('totalEaten')) {
				J.totalEaten = lS.getItem('totalEaten')
			}

			if (lS.getItem('maxScore')) {
				J.maxScore = lS.getItem('maxScore')
			}

			if (lS.getItem('deathsAbove10')) {
				J.deathsAbove10 = lS.getItem('deathsAbove10')
			}
			if (lS.getItem('BossKilled')) {
				J.BossKilled = lS.getItem('BossKilled') | 0
			}
		},

	}

	J.init(false);
})()

