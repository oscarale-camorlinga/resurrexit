console.log("Started script");
var tagList = [];
var stepList = [];
var searchList = [];
var app = {
	currentLang: null,
	state: "choose",
	defaultLang: null,
	menuOpen: false,
	optionOpen: false,
	searching: false,
};
var duration;

/*----------------------------- CONSTANTS -----------------------------*/

const receiver = new BroadcastChannel("sw-messages");

const aside = document.querySelector("aside");
const backBtn = document.querySelector("#back-button");
const choose = document.querySelector("#choose");
const closeBtn = document.querySelector("#close-button");
const footer = document.querySelector("footer");
const header = document.querySelector("header");
const langNav = document.querySelector("#lang");
const langNavCurrent = document.querySelector("#lang label");
const langNavList = document.querySelector("#lang-menu");
const logo = document.querySelector("#logo");
const menuBtn = document.querySelector("#menu-button");
const optionBtn = document.querySelector("#option-button");
const optionMenu = document.querySelector("#option-menu");
const overlay = document.querySelector("#overlay");
const player = document.querySelector("audio");
const playerButton = document.querySelector("#player-button");
const playerEnd = document.querySelector("#player-end");
const playerMessage = document.querySelector("#player-message");
const playerProgress = document.querySelector("#player-progress");
const playerProgressWrapper = document.querySelector("#player-progress-wrapper");
const playerStart = document.querySelector("#player-start");
const playerWrapper = document.querySelector("#player");
const psalmCapo = document.querySelector("#psalm .capo");
const psalmCard = document.querySelector("#psalm");
const psalmCol1 = document.querySelector("#psalm #col1");
const psalmCol2 = document.querySelector("#psalm #col2");
const psalmList = document.querySelector("#psalmlist");
const psalmSubtitle = document.querySelector("#psalm h2");
const psalmTitle = document.querySelector("#psalm h1");
const resetLangBtn = document.querySelector("#reset-lang");
const searchField = document.querySelector("#search-field");
const searchWrapper = document.querySelector("#search");
const steps = document.querySelector("#steps");
const tags = document.querySelector("#tags");
const timeline = document.querySelector("#player-progress-wrapper");
const title = document.querySelector("#title");

/*----------------------------- EVENT LISTENERS -----------------------------*/

window.addEventListener("load", function(e) {
	console.log(">> Window loaded");
});

window.addEventListener("popstate", function(e) {
	console.log(">> Window popped");
});

receiver.addEventListener("message", function(e) {
	if(footer) footer.innerHTML = e.data;
});

optionBtn.addEventListener("click", toggleOptionMenu);
resetLangBtn.addEventListener("click", resetLanguage);
searchField.addEventListener("input", search);
menuBtn.addEventListener("click", toggleMenu);
closeBtn.addEventListener("click", closeMenu);
overlay.addEventListener("click", closeMenu);
playerButton.addEventListener("click", playAudio);
player.addEventListener("timeupdate", timeUpdate, false);
player.addEventListener("error", playerError);

player.addEventListener("canplaythrough", function() {
	duration = player.duration;
});

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

function checkLang() {
	// Checking cookie for preferred language, redirect to preference
	defaultLang = document.cookie.split("=")[1];
	if(defaultLang) {
		console.log("Language set: " + defaultLang);
		app.defaultLang = defaultLang;
		app.currentLang = defaultLang;
		app.state = "list";
		window.history.pushState(app, null);
		console.log(window.history.state);
		generatePage();
		openHeader();
		if(window.innerWidth > 1000) {
			openMenu();
			hideMenuBtn();
		} else {
			showMenuBtn();
		}
		openList();
		hidePlayer();
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
	app.defaultLang = this.name;
	app.currentLang = this.name;
	app.state = "list";
	window.history.pushState(app, null);
	console.log(window.history.state);
	generatePage();
	openHeader();
	if(window.innerWidth > 1000) {
		openMenu();
		hideMenuBtn();
	} else {
		showMenuBtn();
	}
	openList();
	hidePlayer();
}

function toggleOptionMenu() {
	// Open/close the option-menu div
	if(app.optionOpen) {
		optionMenu.style.maxHeight = "0";
		optionMenu.style.borderWidth = "0"
		optionMenu.style.padding = "0";
		app.optionOpen = false;
	} else {
		optionMenu.style.maxHeight = "200px";
		optionMenu.style.borderWidth = "1px"
		optionMenu.style.padding = "10px 20px";
		app.optionOpen = true;
	}
}

function resetLanguage(e) {
	e.stopPropagation();
	e.stopImmediatePropagation();
	setCookie("lang", "", -1);
	app.currentLang = null;
	app.defaultLang = null;
	app.state = "choose";
	window.history.replaceState(app, null);
	closeHeader();
	closeMenu();
	closeList();
}

function toggleMenu(e) {
	console.log(this.firstChild.src);
	if(this.firstChild.src.includes("menu")) {
		openMenu();
	} else {
		closePsalm();
	}
}

function openMenu() {
	aside.style.left = "0";
	if(window.innerWidth < 1000) overlay.style.display = "block";
	app.menuOpen = true;
}

function closeMenu() {
	aside.style.left = "-320px";
	overlay.style.display = "none";
}

function openHeader() {
	header.style.top = "0";
}

function closeHeader() {
	header.style.top = "-100px";
}

function showMenuBtn() {
	menuBtn.style.display = "block";
}

function hideMenuBtn() {
	menuBtn.style.display = "none";
}

function switchMenuBtn(img) {
	menuBtn.firstChild.src = `/images/${img}.svg`;
}

function openPsalm() {
	console.log(`Opening psalm: ${this.id}`);
	app.state = "psalm";
	showPlayer();
	generatePsalm(this.id);
	psalm.style.top = "0";
	header.classList.add("full");
	closeMenu();
	switchMenuBtn("back");
	showMenuBtn();
	closeList();
}

function closePsalm() {
	app.state = "list";
	psalm.style.top = "-2000px";
	header.classList.remove("full");
	openList();
	hidePlayer();
	removePlayerMessage();
	switchMenuBtn("menu");
	if(window.innerWidth > 1000) {
		openMenu();
		hideMenuBtn();
	}
	else showMenuBtn();
}

function openList() {
	psalmList.style.left = "0";
}

function closeList() {
	psalmList.style.left = "-1520px";
}

function showPlayer() {
	playerWrapper.classList.remove("hide");
	searchWrapper.classList.add("hide");
}

function hidePlayer() {
	playerWrapper.classList.add("hide");
	searchWrapper.classList.remove("hide");
}

function removePlayerMessage() {
	playerMessage.classList.add("hide");
	playerMessage.innerHTML = '';
}

function switchLang(e) {
	if(this.id == app.currentLang) {
	} else {
		app.currentLang = this.id;
		window.history.replaceState(app, null);
		console.log(window.history.state);
		generatePage();
	}
}

function generateChooseLang() {
	choose.classList.remove("hide"); // unhide if hidden
	languages.forEach(function(lang) { // insert choose language buttons
		logo.insertAdjacentHTML("afterend", `<button name="${lang.name}" class="default-lang">${lang.longName}</button>`);
	});
	languages.forEach(function(lang) { // insert choose language prompts
		logo.insertAdjacentHTML("afterend", `<p>${lang.chooseLang}</p>`);
	});
	const langBtn = document.querySelectorAll(".default-lang"); // Language button
	langBtn.forEach(function(button) {
		// Setting language button event listeners
		button.addEventListener("click", setLanguage);
	});
}

function generatePage() {
	const language = languages.find(language => language.name == app.currentLang);

	// hide choose
	choose.classList.add("hide");

	// aside title
	title.innerHTML = language.title;
	if(language.title.length > 10) title.classList.add("short");
	else title.classList.remove("short");

	// aside steps and tags
	var stepsHTML = '';
	var tagsHTML = '';
	for(const [key, step] of Object.entries(language.steps)) {
		stepsHTML += `<button id="${key}" name="${key}" class="step-button">${step}</button>`;
	}
	steps.innerHTML = stepsHTML;
	for(const [key, tag] of Object.entries(language.tags)) {
		tagsHTML += `<button id="${key}" name="${key}" class="tag-button">${tag}</button>`;
	}
	tags.innerHTML = tagsHTML;
	const tagBtns = document.querySelectorAll(".tag-button");
	const stepBtns = document.querySelectorAll(".step-button");
	stepBtns.forEach(function(button) {
		button.addEventListener("click", updatePsalmList);
	});
	tagBtns.forEach(function(button) {
		button.addEventListener("click", updatePsalmList);
	});

	// language menu
	langNavCurrent.innerHTML = app.currentLang.toUpperCase();
	var langNavHTML = '';
	languages.forEach(function(lang) {
		langNavHTML += `<li id="${lang.name}" class="lang">${lang.longName}</li>`;
	});
	langNavList.innerHTML = langNavHTML;
	const langBtns = langNav.querySelectorAll(".lang");
	langBtns.forEach(function(button) {
		button.addEventListener("click", switchLang);
	});

	// psalm list no results
	psalmList.innerHTML = `<div id="no-results">${language.noResults}</div>`;
	const noResults = document.querySelector("#no-results");
	generatePsalmList();
}

function generatePsalmList() {
	const noResults = document.querySelector("#no-results");
	psalms[app.currentLang].reduceRight((_, psalm) => {
		noResults.insertAdjacentHTML("afterend",
			`<button id='${psalm.id}' class='${psalm.classes}'>${psalm.title}<span>${psalm.subtitle}</span></button>`);
	}, null);
	const psalmListBtns = document.querySelectorAll("#psalmlist button");
	psalmListBtns.forEach(function(button) {
		button.addEventListener("click", openPsalm);
	});
}

function generatePsalm(psalmId) {
	const language = languages.find(language => language.name == app.currentLang);
	const psalm = psalms[app.currentLang].find(psalm => psalm.id == psalmId);
	if(psalm) {
		console.log(`Opening psalm: ${psalm.title}`);
		var psalmHTML = '';
		psalmCard.className = psalm.classes;
		psalmTitle.innerHTML = psalm.title;
		psalmSubtitle.innerHTML = psalm.subtitle;
		psalmCapo.innerHTML = psalm.capo;
		psalm.psalm.col1.forEach(verse => {
			psalmHTML += `<p class='${verse.type}'>${verse.verse}</p>`;
		});
		psalmCol1.innerHTML = psalmHTML;
		if(psalm.psalm.col2) {
			psalmHTML = '';
			psalm.psalm.col2.forEach(verse => {
				psalmHTML += `<p class='${verse.type}'>${verse.verse}</p>`;
			});
			psalmCol2.innerHTML = psalmHTML;
		}
		if(psalm.audio != "NO AUDIO") {
			console.log(`Opening audio: ${psalm.audio}`);
			player.src = "/audio/" + app.currentLang + "/" + psalm.audio;
			playerWrapper.classList.remove("hide");
			removePlayerMessage();
		} else {
			console.log(`No audio available: ${psalm.audio}`);
			player.src = '';
			playerWrapper.classList.add("hide");
			playerMessage.classList.remove("hide");
			playerMessage.innerHTML = language.audioMissing.toUpperCase();
		}
	} else {
		console.log(`Could not find psalm with id: ${psalmId}`);
		psalmSubtitle.innerHTML = language.psalmMissing.toUpperCase();
	}
}

function playerError(e) {

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
	playerProgress.style.width = playPercent + "%";
	if(duration) {
		var playingMinutes = Math.floor(player.currentTime / 60),
			playingSeconds = player.currentTime - playingMinutes * 60,
			endingMinutes = Math.floor(duration / 60),
			endingSeconds = duration - endingMinutes * 60;
		playerStart.innerHTML = formatSeconds(Math.floor(player.currentTime));
		playerEnd.innerHTML = formatSeconds(Math.floor(duration));
	}
}

function getPosition(el) {
	return el.getBoundingClientRect().left;
}

function clickPercent(e) {
	return (e.clientX - getPosition(timeline)) / timeline.offsetWidth;
}

function search(e) {
	searchList = []; // clear out the search list
	if(e.target.value.length > 2 && app.currentLang) { //search must contain atleast 3 letters
		app.searching = true;
		query = e.target.value.toLowerCase();
		regex = new RegExp("\\b" + query.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
		matches = psalms[app.currentLang].filter(psalm => psalm.text.match(regex)); // return array of all matches
		matches.forEach(function(psalm) {
			searchList.push("#" + psalm.id); // add each matched psalm id to the search list array
		});
	} else {
		app.searching = false;
	}
	updatePsalmList(e);
	// console.log(searchList);
}

function windowResize() {
	if(window.innerWidth < 1000) {
		closeMenu();
	} else if(app.state == "list") {
		openMenu();
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
	console.log("Updating psalm list");
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

	allPsalms = document.querySelectorAll("#psalmlist button");
	if(tagList.length || stepList.length || searchList.length || app.searching) { // if there are tags or steps selected or a search was made
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

window.onload = () => {
	'use strict';

	if('serviceWorker' in navigator) {
		navigator.serviceWorker.register('/sw.js');
	}

	generateChooseLang();
	checkLang();
}
