console.log("Started script");
var tagList = [];
var stepList = [];
var searchList = [];
var searched = false;
var menuOpen = false;

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

function generatePsalmList(lang) {
	psalms[lang].reduceRight((_, psalm) => {
		noResults.insertAdjacentHTML("afterend",
			`<a id='${psalm.id}' class='${psalm.classes}' href='/${lang}/psalmus.html?id=${psalm.id}'>${psalm.title}[${psalm.classes}]<span>${psalm.subtitle}</span></a>`);
	}, null);
}

function generatePsalm(lang) {
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
	} else {
		console.log(`Could not find psalm with id: ${psalmId}`);
		if(lang == "en") psalmSubtitle.innerHTML = "Could not reproduce psalm";
		if(lang == "es") psalmSubtitle.innerHTML = "No se pudo reproducir el salmo";
	}
}

function loadAudio() {
	console.log("Audio found!");
	var player = $("audio")[0],
	playerButton = $("#player-button"),
	duration,
	audioProgress = $("#player-progress"),
	timeline = $("#player-progress-wrapper"),
	playingTime = $("#player-start"),
	endingTime = $("#player-end");

	function playAudio() {
		if(player.paused) {
			player.play();
			playerButton.removeClass("play");
			playerButton.addClass("pause");
		} else {
			player.pause();
			playerButton.removeClass("pause");
			playerButton.addClass("play");
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
		audioProgress.css("width", playPercent + "%");
		if(duration) {
			var playingMinutes = Math.floor(player.currentTime / 60),
				playingSeconds = player.currentTime - playingMinutes * 60,
				endingMinutes = Math.floor(duration / 60),
				endingSeconds = duration - endingMinutes * 60;
			playingTime.html(formatSeconds(Math.floor(player.currentTime)));
			endingTime.html(formatSeconds(Math.floor(duration)));
		}
	}

	function getPosition(el) {
		return el.getBoundingClientRect().left;
	}

	function clickPercent(e) {
		return(e.clientX - getPosition(timeline[0])) / timeline.width();
	}

	/*function movePlayhead(e) {
		var newTimelineWidth = clickPercent(e);
		if(newTimelineWidth == 0 && newTimelineWidth == timelineWidth) {
			audioProgress.css("width",
		}
	}*/

	playerButton.click(function(e) {
		playAudio();
	});

	player.addEventListener("timeupdate", timeUpdate, false);
	player.addEventListener("canplaythrough", function() {
		duration = player.duration;
	});

	timeline.click(function(e) {
		player.currentTime = duration * clickPercent(e);
	});
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
	if(e.target.value) console.log(e.target.value);
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

function updatePsalmList(e) {
	if(this.parentNode.id == "tags") {
		if(tagList.indexOf(this.id) >= 0) { // if the tag already exists
			tagList.splice(tagList.indexOf(this.id),1); // delete it from the array
			this.classList.remove("selected");
		} else {
			tagList.push(this.id); // else add the tag to the end of the array
			this.classList.add("selected");
		}
	} else if(this.parentNode.id == "steps") {
		if(stepList.indexOf(this.id) >= 0) { // if the step already exists
			stepList.splice(stepList.indexOf(this.id),1); // delete it from the array
			this.classList.remove("selected");
		} else {
			stepList.push(this.id); // else add the step to the end of the array
			this.classList.add("selected");
		}
	}

	allPsalms = document.querySelectorAll("#psalmlist a");
	if(tagList.length || stepList.length) { // if there are tags or steps selected
		hidePsalms(allPsalms);
		query = "";
		if(stepList.length) { // create query of tags, step&&tag || step&&tag || ...
			stepList.forEach(function(step) {
				if(tagList.length) {
					tagList.forEach(function(tag) {
						query += "." + step + "." + tag + ", ";
					});
				} else {
					query += "." + step + ", "
				}
			});
		} else {
			tagList.forEach(function(tag) {
				query += "." + tag + ", "
			});
		}
		query = query.slice(0,-2); // remove last comma and space
		selectedPsalms = document.querySelectorAll(query);
		showPsalms(selectedPsalms);
	} else { // if no tags or steps selected show all the psalms
		showPsalms(allPsalms);
	}
	//console.log(stepList);
}

/*----------------------------- MAIN -----------------------------*/

windowResize();
window.onresize = windowResize;
