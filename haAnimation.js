const HaAnimation = class {
	constructor() {
		this.fps = 60;
		this.pathArray = [];
		this.framesTotal = null;
		this.framesArray = null;
		this.isPlaying = false;
		this.playingRate = -1;
		this.currentFrameIndex = 0;
		this.set = function(customFrameIndex) {
			if (customFrameIndex < 0) {
				customFrameIndex = 0;
			}
			if (customFrameIndex > this.framesTotal) {
				customFrameIndex = this.framesTotal;
			}
			this.currentFrameIndex = customFrameIndex;
			for (let i = 0; i < this.pathArray.length; i++) {
				this.pathArray[i].setAttribute('d', this.framesArray[i][this.currentFrameIndex]);
			}
		}
		this.play = function(playingRate, endFrame=-1) {
			if (playingRate === 'invert') {
				this.playingRate = -this.playingRate;
			} else {
				this.playingRate = playingRate;
			}
			if (this.isPlaying) {
				return;
			}
			const period = 1000/this.fps;
			let elmHaAnim = this;
			let core;
			core = function() {
				let startTime;
				let duration = period;
				let temp;
				startTime = new Date().getTime();
				setTimeout(function() {
					duration = new Date().getTime() - startTime;
					temp = elmHaAnim.currentFrameIndex + elmHaAnim.playingRate;
					elmHaAnim.isPlaying = (0 <= temp) && (temp <= elmHaAnim.framesTotal) && (elmHaAnim.currentFrameIndex !== endFrame);
					if (elmHaAnim.isPlaying) {
						elmHaAnim.set(temp);
						core();
					}
				}, 2*period - duration);
			};
			core();
		}
	}
};

window.addEventListener('load', function() {
	let elmHaAnimS = document.getElementsByClassName('haAnimation');
	let progress;
	let customFrameIndex;
	for (let i = 0; i < elmHaAnimS.length; i++) {
		let elmMaskS;
		let elmPathS;
		let temp;
		let text;
		let origin;
		let destination;
		let idx;
		let transitionProperty;
		let transitionDuration;
		let transitionTiming;
		let timing;
		let framesTotal;
		let frames;
		elmHaAnimS[i].haAnimation = new HaAnimation();
		elmMaskS = elmHaAnimS[i].getElementsByTagName('mask');
		elmPathS = elmHaAnimS[i].getElementsByTagName('path');
		temp = [];
		for (let j = 0; j < elmMaskS.length; j++) {
			temp.push(elmMaskS[j].id);
			elmMaskS[j].id = 'haAnimationMask'+i.toString()+j.toString();
		}
		text = elmHaAnimS[i].innerHTML;
		for (let j = 0; j < temp.length; j++) {
			text = text.replace('#'+temp[j], '#'+elmMaskS[j].id);
		}
		elmHaAnimS[i].innerHTML = text;
		transitionProperty = getComputedStyle(elmHaAnimS[i]).getPropertyValue('transition-property').split(',');
		transitionDuration = 0;
		transitionTiming = '';
		for (let j = 0; j < transitionProperty.length; j++) {
			if ((transitionProperty[j].trim() === 'haAnimation') || (transitionProperty[j].trim() === 'all')) {
				transitionDuration = getComputedStyle(elmHaAnimS[i]).getPropertyValue('transition-duration').split(',');
				transitionTiming = getComputedStyle(elmHaAnimS[i]).getPropertyValue('transition-timing-function').replace(/\([^)]+\)/g, text => {return text.replace(/,/g, '#')}).split(',');
				if (transitionDuration.length === 1) {
					transitionDuration = transitionDuration[0].trim();
				} else {
					transitionDuration = transitionDuration[j].trim();
				}
				if (transitionTiming.length === 1) {
					transitionTiming = transitionTiming[0].trim();
				} else {
					transitionTiming = transitionTiming[j].trim();
				}
			}
		} 
		switch(transitionTiming.match(/[^(]*/i)[0]) {
			case 'linear':
				timing = [0, 0, 1, 1];
				break;
			case 'ease-in':
				timing = [0.42, 0, 1, 1];
				break;
			case 'ease-out':
				timing = [0, 0, 0.58, 1];
				break;
			case 'ease-in-out':
				timing = [0.42, 0, 0.58, 1];
				break;
			case 'cubic-bezier':
				timing = transitionTiming.trim().match(/\((.*?)\)/)[1].split('#');
				break;
			default:
				timing = [0.25, 0.1, 0.25, 1];
		}
		framesTotal = Math.ceil(elmHaAnimS[i].haAnimation.fps*parseFloat(transitionDuration));
		framesTotal += (framesTotal === 0);
		frames = [];
		for (let j = 0; j < elmPathS.length; j++) {
			if (elmPathS[j].dataset.hasOwnProperty('destination')) {
				frames.push([]);
				origin = elmPathS[j].attributes['d'].value.toString().split(' ');
				destination = elmPathS[j].dataset['destination'].toString().split(' ');
				idx = [];
				for (let j = 0; j < origin.length; j++) {
					if (!isNaN(origin[j]) && (origin[j]!==destination[j])) {
						origin[j] = parseFloat(origin[j]);
						destination[j] = parseFloat(destination[j]);
						idx.push(j);
					}
				}
				for (let k = 0; k <= framesTotal; k++) {
					frames[frames.length - 1].push([...origin]);
					temp = haAnimationCubicBezier(parseFloat(timing[0]), parseFloat(timing[1]), parseFloat(timing[2]), parseFloat(timing[3]), k/framesTotal);
					for (let l = 0; l < idx.length; l++) {
						frames[frames.length - 1][k][idx[l]] = origin[idx[l]] + temp*(destination[idx[l]] - origin[idx[l]]);
					}
					frames[frames.length - 1][k] = frames[frames.length - 1][k].join(' ');
				}
				elmHaAnimS[i].haAnimation.pathArray.push(elmPathS[j]);
			}
		}
		elmHaAnimS[i].haAnimation.framesTotal = framesTotal;
		elmHaAnimS[i].haAnimation.framesArray = frames;
	}
	for (let i = 0; i < elmHaAnimS.length; i++) {
		let observer = new MutationObserver(function() {
			let temp;
			progress = parseFloat(getComputedStyle(elmHaAnimS[i]).getPropertyValue('--haAnimationProgress'));
			customFrameIndex = parseInt((progress*elmHaAnimS[i].haAnimation.framesTotal/100).toFixed(0));
			temp = 2*(customFrameIndex > elmHaAnimS[i].haAnimation.currentFrameIndex) - 1;
			elmHaAnimS[i].haAnimation.play(temp, customFrameIndex);
		});
		observer.observe(elmHaAnimS[i], {
			'attributes': true,
			'attributeFilter': ['style', 'class']
		});
		progress = parseFloat(getComputedStyle(elmHaAnimS[i]).getPropertyValue('--haAnimationProgress'));
		if (!isNaN(progress)) {
			customFrameIndex = parseInt((progress*(elmHaAnimS[i].haAnimation.framesTotal - 1)/100).toFixed(0));
			elmHaAnimS[i].haAnimation.set(customFrameIndex);
		}
	}
});

function haAnimationCubicBezier(x1, y1, x2, y2, time, parameter=0.5, epsilon=1e-3, iterationMax=50) {
	let temp;
	let formula = function(p, p1, p2) {
		return 3*Math.pow(1 - p, 2)*p*p1 + 3*(1 - p)*Math.pow(p, 2)*p2 + Math.pow(p, 3);
	};
	let derivative  = function(p, p1, p2) {
		return 3*Math.pow(1 - p, 2)*p1 + 6*(1 - p)*p*(p2 - p1) + 3*Math.pow(p, 2)*(1 - p2);
	};
	for (let i = 0; i < iterationMax; i++) {
		temp = formula(parameter, x1, x2);
		if (Math.abs(time - temp) < epsilon) {
			break;
		}
		parameter += (time - temp)/derivative(parameter, x1, x2);
	} 
	return formula(parameter, y1, y2);
}