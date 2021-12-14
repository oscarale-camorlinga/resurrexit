console.log("Started script");
var lang = "";
var tagList = [];
var stepList = [];
var searchList = [];
var menuOpen = false;
var searching = false;
var duration;

/*----------------------------- CONSTANTS -----------------------------*/

const langBtn = document.querySelectorAll(".default-lang"); // Language button
const optionBtn = document.querySelector("#option-button"); // option button (three dots)
const optionDiv = document.querySelector("#option-menu"); // option menu div
const resetLangBtn = document.querySelector("#reset-lang"); // reset preferred language button
const headerDiv = document.querySelector("header"); // header
const langLinkES = document.querySelectorAll(".es.lang"); // language es link
const langLinkEN = document.querySelectorAll(".en.lang"); // language en link
const headerLangLinkES = document.querySelector("#es"); // language es link in header
const headerLangLinkEN = document.querySelector("#en"); // language en link in header
const psalmSection = document.querySelector("#psalm"); // psalm title for id
const psalmTitle = document.querySelector("#psalm h1"); // psalm title for id
const psalmSubtitle = document.querySelector("#psalm h2"); // psalm title for id
const psalmCapo = document.querySelector("#psalm .capo"); // psalm title for id
const psalmCol1 = document.querySelector("#psalm #col1"); // psalm title for id
const psalmCol2 = document.querySelector("#psalm #col2"); // psalm title for id
const searchInput = document.querySelector("input");
const psalmList = document.querySelector("#psalmlist"); // full psalm list div
const noResults = document.querySelector("#no-results"); // no results div in order to insert adjacent
const menuBtn = document.querySelector("#menu-button"); // left side hamburger menu button
const closeBtn = document.querySelector("#close-button"); // left side menu close button
const aside = document.querySelector("aside"); //left side menu
const overlay = document.querySelector("#overlay"); // black transparent overlay when menus is open
const tagBtns = document.querySelectorAll(".tag-button");
const stepBtns = document.querySelectorAll(".step-button");
const playerWrapper = document.querySelector("#player");
const player = document.querySelector("audio");
const playerButton = document.querySelector("#player-button");
const audioProgress = document.querySelector("#player-progress");
const timeline = document.querySelector("#player-progress-wrapper");
const playingTime = document.querySelector("#player-start");
const endingTime = document.querySelector("#player-end");

/*----------------------------- PWS -----------------------------*/

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js').then(function(registration) {
		console.log('Registration successful, scope is:', registration.scope);
	}).catch(function(error) {
		console.log('Service worker registration failed, error:', error);
	});
}

/*----------------------------- EVENT LISTENERS -----------------------------*/

if(langBtn) langBtn.forEach(function(button) {
	// Setting language button event listeners
	button.addEventListener("click", setLanguage);
});

if(optionBtn) optionBtn.addEventListener("click", toggleOptionDiv);
if(resetLangBtn) resetLangBtn.addEventListener("click", resetLanguage);
if(searchInput) searchInput.addEventListener("input", search);
if(menuBtn) menuBtn.addEventListener("click", openMenu);
if(closeBtn) closeBtn.addEventListener("click", closeMenu);

if(stepBtns) stepBtns.forEach(function(button) {
	button.addEventListener("click", updatePsalmList);
});

if(tagBtns) tagBtns.forEach(function(button) {
	button.addEventListener("click", updatePsalmList);
});

if(playerButton) playerButton.addEventListener("click", playAudio);

if(player) {
	player.addEventListener("timeupdate", timeUpdate, false);
	player.addEventListener("canplaythrough", function() {
		duration = player.duration;
	});
	player.addEventListener("error", playerError);
}

if(timeline) {
	timeline.addEventListener("click", function(e) {
		player.currentTime = duration * clickPercent(e);
		player.currentTime = String(duration * clickPercent(e));
	});
}

/*----------------------------- FUNCTIONS -----------------------------*/

function setCookie(name, value, days) {
	// Cookie function
	document.cookie = name + "=" + value + "; max-age=" + days * 24 * 60 * 60 + "; path=/";
}

function checkLanguage() {
	// Checking cookie for preferred language, redirect to preference
	defaultLang = document.cookie.split("=")[1];
	if(defaultLang) {
		console.log("Redirecting to " + defaultLang);
		window.location.replace("/" + defaultLang);
	} else {
		console.log("Need to set language preference");
	}
}

function setLanguage(e) {
	// Setting cookie for preferred language to 30 days, redirect to preference
	e.stopPropagation();
	e.stopImmediatePropagation();
	setCookie("lang", this.name, 30);
	console.log("Set default language to: " + this.name);
	window.location.replace("/" + this.name);
}

function toggleOptionDiv() {
	// Open/close the option-menu div
	var headerHeight = parseInt(getComputedStyle(headerDiv).height.replace("px", ""));
	var optionDivTop = getComputedStyle(optionDiv).top;
	if(window.innerWidth < 600) {
		if(optionDivTop == "-140px") {
			optionDiv.style.top = headerHeight + "px";
		} else {
			optionDiv.style.top = "-140px";
		}
	} else {
		if(optionDivTop == "-140px") {
			optionDiv.style.top = headerHeight - 95 + "px";
		} else {
			optionDiv.style.top = "-140px";
		}
	}
}

function resetLanguage(e) {
	e.stopPropagation();
	e.stopImmediatePropagation();
	setCookie("lang", "", -1);
	window.location.href = "/";
}

function openMenu(e) {
	aside.style.left = "0";
	overlay.style.display = "block";
	menuOpen = true;
}

function closeMenu(e) {
	aside.style.left = "-320px";
	overlay.style.display = "none";
	menuOpen = false;
}

function generatePsalmList(l) {
	lang = l;
	psalms[lang].reduceRight((_, psalm) => {
		noResults.insertAdjacentHTML("afterend",
			`<a id='${psalm.id}' class='${psalm.classes}' href='/${lang}/psalmus.html?id=${psalm.id}'>${psalm.title}[${psalm.classes}]<span>${psalm.subtitle}</span></a>`);
	}, null);
}

function generatePsalm(l) {
	lang = l;
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const psalmId = urlParams.get("id");
	console.log(`ID: ${psalmId}`);

	const psalm = psalms[lang].find(psalm => psalm.id == psalmId);
	if(psalm) {
		console.log(`Opening psalm: ${psalm.title}`);
		psalmSection.className = psalm.classes;
		psalmTitle.innerHTML = psalm.title;
		psalmSubtitle.innerHTML = psalm.subtitle;
		psalmCapo.innerHTML = psalm.capo;
		psalm.psalm.col1.forEach(verse => {
			psalmCol1.innerHTML += `<p class='${verse.type}'>${verse.verse}</p>`;
		});
		if(psalm.psalm.col2) {
			psalm.psalm.col2.forEach(verse => {
				psalmCol2.innerHTML += `<p class='${verse.type}'>${verse.verse}</p>`;
			});
		}
		langLinkEN.forEach(link => {
			link.href = `/en/psalmus.html?id=${psalm.id}`;
		});
		langLinkES.forEach(link => {
			link.href = `/es/psalmus.html?id=${psalm.id}`;
		});
		if(player) {
			player.src = "/audio/" + lang + "/" +
				psalm.title.replace(/\s/g, "-").toLowerCase()
				.normalize("NFD").replace(/[\u0300-\u036f]/g, "") + ".mp3";
			console.log(player.src);
		}
	} else {
		console.log(`Could not find psalm with id: ${psalmId}`);
		if(lang == "en") psalmSubtitle.innerHTML = "Could not reproduce psalm";
		if(lang == "es") psalmSubtitle.innerHTML = "No se pudo reproducir el salmo";
	}
}

function playerError(e) {
	if(lang == "en") playerWrapper.innerHTML = "<p id='no-audio'>AUDIO COULD NOT BE REPRODUCED</p>"
	if(lang == "es") playerWrapper.innerHTML = "<p id='no-audio'>EL AUDIO NO SE PUDO REPRODUCIR</p>"
}

function playAudio() {
	if(player.paused) {
		player.play();
		playerButton.classList.remove("play");
		playerButton.classList.add("pause");
	} else {
		player.pause();
		playerButton.classList.remove("pause");
		playerButton.classList.add("play");
	}
}

function timePadding(string, pad, length) {
	return(new Array(length + 1).join(pad) + string).slice(-length);
}

function formatSeconds(s) {
	return(s - (s %= 60)) / 60 + (9 < s ? ':' : ':0') + s;
}

function timeUpdate() {
	var playPercent = 100 * (player.currentTime / duration);
	audioProgress.style.width = playPercent + "%";
	if(duration) {
		var playingMinutes = Math.floor(player.currentTime / 60),
			playingSeconds = player.currentTime - playingMinutes * 60,
			endingMinutes = Math.floor(duration / 60),
			endingSeconds = duration - endingMinutes * 60;
		playingTime.innerHTML = formatSeconds(Math.floor(player.currentTime));
		endingTime.innerHTML = formatSeconds(Math.floor(duration));
	}
}

function getPosition(el) {
	return el.getBoundingClientRect().left;
}

function clickPercent(e) {
	return (e.clientX - getPosition(timeline)) / timeline.offsetWidth;
}

function setLangHref() {
	if(langLinkEN && langLinkES) {
		var currentPsalm = parseInt(psalmTitle.id);
		let psalmEN = psalmsEN.find(psalmEN => psalmEN.id === currentPsalm);
		let psalmES = psalmsES.find(psalmES => psalmES.id === currentPsalm);
		linkEN = psalmEN.link;
		linkES = psalmES.link;
		langLinkEN.forEach(function(link) {
			link.href = "/en/" + linkEN + ".html";
		});
		langLinkES.forEach(function(link) {
			link.href = "/es/" + linkES + ".html";
		});
	}
}

function search(e) {
	searchList = []; // clear out the search list
	if(e.target.value.length > 2 && lang) { //search must contain atleast 3 letters
		searching = true;
		query = e.target.value.toLowerCase();
		regex = new RegExp("\\b" + query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
		matches = psalms[lang].filter(psalm => psalm.text.match(regex)); // return array of all matches
		matches.forEach(function(psalm) {
			searchList.push("#" + psalm.id); // add each matched psalm id to the search list array
		});
	} else {
		searching = false;
	}
	updatePsalmList(e);
	// console.log(searchList);
}

function windowResize() {
	if(aside) {
		if(window.innerWidth < 1000) {
		 	if(!menuOpen) {
				closeMenu(null);
			}
			headerLangLinkES.innerHTML = "ES";
			headerLangLinkEN.innerHTML = "EN";
		} else {
			aside.style.left = "0";
			overlay.style.display = "none";
			menuOpen = false;
			headerLangLinkES.innerHTML = "Español";
			headerLangLinkEN.innerHTML = "English";
		}
	}
}

function hidePsalms(queryList) {
	queryList.forEach(function(psalm) {
		psalm.classList.add("hide");
	});
}

function showPsalms(queryList) {
	queryList.forEach(function(psalm) {
		psalm.classList.remove("hide");
	});
}

const combine = ([head, ...[headTail, ...tailTail]]) => {
	if(!headTail) return head;
	const combined = headTail.reduce((acc, x) => {
		return acc.concat(head.map(h => `${h}${x}`))
	}, []);
	return combine([combined, ...tailTail]);
}

function updatePsalmList(e) {
	if(this.parentNode) {
		if(this.parentNode.id == "tags") {
			if(tagList.indexOf("." + this.id) >= 0) { // if the tag already exists
				tagList.splice(tagList.indexOf("." + this.id),1); // delete it from the array
				this.classList.remove("selected");
			} else {
				tagList.push("." + this.id); // else add the tag to the end of the array
				this.classList.add("selected");
			}
		} else if(this.parentNode.id == "steps") {
			if(stepList.indexOf("." + this.id) >= 0) { // if the step already exists
				stepList.splice(stepList.indexOf("." + this.id),1); // delete it from the array
				this.classList.remove("selected");
			} else {
				stepList.push("." + this.id); // else add the step to the end of the array
				this.classList.add("selected");
			}
		}
	}

	allPsalms = document.querySelectorAll("#psalmlist a");
	if(tagList.length || stepList.length || searchList.length || searching) { // if there are tags or steps selected or a search was made
		hidePsalms(allPsalms);
		query = [];
		if(tagList.length && stepList.length && searchList.length) query = combine([searchList, stepList, tagList]);
		else if(tagList.length && stepList.length) query = combine([stepList, tagList]);
		else if(tagList.length && searchList.length) query = combine([searchList, tagList]);
		else if(stepList.length && searchList.length) query = combine([searchList, stepList]);
		else if(tagList.length) query = tagList;
		else if(stepList.length) query = stepList;
		else if(searchList.length) query = searchList;
		if(query.length) {
			query = query.join(", ")
			selectedPsalms = psalmList.querySelectorAll(query);
			showPsalms(selectedPsalms);
		}
	} else { // if no tags or steps selected show all the psalms
		showPsalms(allPsalms);
	}
	//console.log(stepList);
}

/*----------------------------- MAIN -----------------------------*/

windowResize();
window.onresize = windowResize;
