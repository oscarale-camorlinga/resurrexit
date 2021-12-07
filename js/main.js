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
	console.log("Clicked option button");
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
			`<a id='${psalm.id}' class='${psalm.classes}' href='/${lang}/psalmus.html?id=${psalm.id}'>${psalm.title}<span>${psalm.subtitle}</span></a>`);
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
		console.log(clickPercent(e));
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

/*----------------------------- MAIN -----------------------------*/

windowResize();
window.onresize = windowResize;

/*
function changeHeader(headerColor) {
	$("header").css("background-color", headerColor);
}

function loadPsalm(lang) {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	if(urlParams.has('id')) {
		var psalmId = urlParams.get('id');
		// console.log(psalmId);
		$.getJSON("/" + lang + "/psalmis.json", function(psalmis) {
			var psalm = psalmis.psalms[psalmis.psalms.findIndex(obj => obj.id == psalmId)];
			$("#psalm").addClass(psalm.step);
			$("#psalm").append("<h1>" + psalm.title + "</h1>");
			$("#psalm").append("<h2>" + psalm.subtitle + "</h2>");
			if(psalm.capo) {
				$("#psalm").append("<p class='capo'>Capo " + psalm.capo + "</p>");
			}
			$("#psalm").append("<div id='text'></div>");
			$("#text").append("<div id='col1' class='col'></div><div id='col2' class='col'></div>");
			psalm.column1.forEach(function(p) {
				p.verse = p.verse.replaceAll("[", "<span data-chord='");
				p.verse = p.verse.replaceAll("]", "'></span>");
				$("#col1").append("<p class='" + p.style + "'>" + p.verse + "</p>");
			});
			psalm.column2.forEach(function(p) {
				p.verse = p.verse.replaceAll("[", "<span data-chord='");
				p.verse = p.verse.replaceAll("]", "'></span>");
				$("#col2").append("<p class='" + p.style + "'>" + p.verse + "</p>");
			});
			$(".es").attr("href", "/es/psalmis.html?id=" + psalmId);
			$(".en").attr("href", "/en/psalmis.html?id=" + psalmId);
			var audioLink = "/audio/" + lang + "/" + psalm.link + ".mp3";
			if(checkUrl(audioLink)) {
				$("audio").attr("src", audioLink);
				loadAudio();
			} else {
				if(lang == "es") {
					$("#player").replaceWith("<div id='no-audio'>NO SE ENCUENTRA EL AUDIO</div>");
				} else if(lang == "en") {
					$("#player").replaceWith("<div id='no-audio'>AUDIO NOT FOUND</div>");
				}
				console.log("audio not found");
			}
		});
	}
}

function hideAll() {
	console.log("Hiding all");
	$(".psalm").each(function() {
		$(this).hide();
	});
}

function showAll() {
	console.log("Showing all");
	$(".psalm").each(function() {
		$(this).show();
	});
}

function showPsalms() {
	hideAll();
	//console.log(searchList);
	//console.log(stepList);
	//console.log(tagList);
	if(searchList.length && stepList.length && tagList.length) {
		searchList.forEach(function(id) {
			stepList.forEach(function(step) {
				tagList.forEach(function(tag) {
					$("#" + id + "." + step + "." + tag).show();
				});
			});
		});
	} else if(searchList.length && stepList.length) {
		searchList.forEach(function(id) {
			stepList.forEach(function(step) {
				$("#" + id + "." + step).show();
			});
		});
	} else if (searchList.length && tagList.length) {
		searchList.forEach(function(id) {
			tagList.forEach(function(tag) {
				$("#" + id + "." + tag).show();
			});
		});
	} else if(stepList.length && tagList.length) {
		// Steps and tags selected, show only psalms with selected steps and tags
		stepList.forEach(function(step) {
			tagList.forEach(function(tag) {
				$("." + step + "." + tag).show();
			});
		});
	} else if(searchList.length) {
		// Steps selected, show only psalms with selected steps
		searchList.forEach(function(id) {
			$("#" + id).show();
		});
	} else if(stepList.length) {
		// Steps selected, show only psalms with selected steps
		stepList.forEach(function(step) {
			$("." + step).show();
		});
	} else if(tagList.length) {
		// Tags selected, show only psalms with selected tags
		tagList.forEach(function(tag) {
			$("." + tag).show();
		});
	} else if(!searched) {
		// No steps or tags selected, show all psalms
		showAll();
	}
}

$(document).ready(function() {
	$(".step-button").on("click", function(e) {
		e.stopPropagation();
		e.stopImmediatePropagation();
		if(stepList.includes($(this).attr("name"))) {
			stepList.splice(stepList.indexOf($(this).attr("name")), 1);
			$(this).removeClass('selected');
		} else {
			stepList.push($(this).attr("name"));
			$(this).addClass('selected');
		}
		console.log(stepList);
		showPsalms();
	});

	$(".tag-button").on("click", function(e) {
		e.stopPropagation();
		e.stopImmediatePropagation();
		if(tagList.includes($(this).attr("name"))) {
			tagList.splice(tagList.indexOf($(this).attr("name")), 1);
			$(this).removeClass('selected');
		} else {
			tagList.push($(this).attr("name"));
			$(this).addClass('selected');
		}
		console.log(tagList);
		showPsalms();
	});
});*/
