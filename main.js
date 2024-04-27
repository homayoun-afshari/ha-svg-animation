window.addEventListener('load', function() {
	let elmSvgS = document.getElementsByClassName('haAnimation');
	for (let i = 0; i < elmSvgS.length; i++) {
		elmSvgS[i].addEventListener('click', function() {
			this.haAnimation.play('invert');
		});
	}
});

function makeProgress(elmBtn) {
	elmSvg = elmBtn.parentElement.getElementsByTagName('svg')[0];
	elmInput = elmBtn.parentElement.getElementsByTagName('input')[0];
	elmSvg.style.setProperty('--haAnimationProgress', elmInput.value);
}

function toggleNew(elmBtn, prompt) {
	elmSvg = elmBtn.parentElement.getElementsByTagName('svg')[0];
	if (prompt) {
		elmSvg.classList.add('new');
	} else {
		elmSvg.classList.remove('new');
	}
}