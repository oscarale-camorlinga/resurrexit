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
const langLinkEN = document.querySelectorAll(".en.lang"); // language es link
const psalmTitle = document.querySelector("#psalm h1"); // psalm title for id
const searchInput = document.querySelector("input");

/*----------------------------- PWS -----------------------------*/

if('serviceWorker' in navigator) {
	// Initializing service worker for PWS
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js');
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
		window.location.replace("https://resurrexit.app/" + defaultLang);
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
	window.location.replace("https://resurrexit.app/" + this.name);
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
	window.location.href = "https://resurrexit.app";
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
		console.log(currentPsalm);
		console.log(typeof currentPsalm);
		let psalmEN = psalmsEN.find(psalmEN => psalmEN.id === currentPsalm);
		let psalmES = psalmsES.find(psalmES => psalmES.id === currentPsalm);
		console.log(psalmEN);
		console.log(psalmES);
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

	$("#menu-button").click(function(e) {
		$("aside").css("left", "0");
		$("#overlay").css("display", "block");
		menuOpen = true;
	});

	$("#close-button").click(function(e) {
		$("aside").css("left", "-320px");
		$("#overlay").css("display", "none");
		menuOpen = false;
	});

//	if($(window).width() < 600) {
//		if($(window).width() < 600) {
//			$("#search-field").attr("placeholder", "Resurrexit");
//		}
	}

	if($(window).width() < 600) {

	} else if($(window).width() < 1000) {
		$("#es").html("ES");
		$("#en").html("EN");
	} else {

	}

	$(window).resize(function() {
		if($(window).width() < 1000) {
			if(!menuOpen) {
				$("aside").css("left", "-320px");
				$("#overlay").css("display", "none");
			}
			$("#es").html("ES");
			$("#en").html("EN");
		} else {
			$("aside").css("left", "0");
			$("#overlay").css("display", "none");
			$("#es").html("Español");
			$("#en").html("English");
			menuOpen = false;
		}
	});
});*/
