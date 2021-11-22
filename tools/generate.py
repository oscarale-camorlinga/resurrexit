import os
import unicodedata

debug = False
readingVerse = False
getChord = True
textOnly = False

chords = ''
psalmHtml = ''
psalmText = ''
psalmsJs = ''

languages = ["es", "en"]

def startColumn():
	#if debug: print("STARTING COLUMN")
	global colCount
	global psalmHtml
	colCount += 1
	psalmHtml += "\t\t\t<div id='col" + str(colCount) + "' class='col'>\n"

def endColumn():
	#if debug: print("ENDING COLUMN")
	global psalmHtml
	psalmHtml += "\t\t\t</div>\n"

def startSection(line):
	#if debug: print("STARTING SECTION: " + line[1])
	global readingVerse
	global psalmHtml
	global textOnly
	readingVerse = True
	if line[1] == 'l': #if only reading a single line with no chords:
		psalmHtml += "\t\t\t\t<p class='" + line[1] + ' ' + line[2] + "'>\n"
		textOnly = True
	else:
		psalmHtml += "\t\t\t\t<p class='" + line[1] + "'>\n"

def endSection():
	#if debug: print("ENDING SECTION")
	global readingVerse
	global psalmHtml
	global textOnly
	readingVerse = False
	textOnly = False
	psalmHtml += "\t\t\t\t</p>\n"

def insertNote(line):
	if debug: print("NOTE: " + line)

def insertVerse(line):
	global chords
	global getChord
	global psalmHtml
	global textOnly
	global psalmText

	psalmText += ' ' + line

	if not textOnly:
		chords = chords.rstrip()
		while chords:
			i = chords.rfind(' ') + 1
			chord = chords[i:]
			line = line[:i] + "<span data-chord='" + chord + "'></span>" + line[i:]
			chords = chords[:i].rstrip()
		getChord = True

	psalmHtml += "\t\t\t\t\t" + line + "<br>\n"

def normalize(text):
	return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')

# START
print()
print("STARTING PSALM FILE GENERATION")


for f in os.listdir("export/js/"): # delete all files in the directory
	os.remove("export/js/" + f)

for language in languages: # run loop for all languages
	if debug: print()
	fileList = sorted(next(os.walk("psalms/" + language), (None, None, []))[2]) # get list of txt files in alphabetical order

	for f in os.listdir("export/" + language + '/'): # delete all files in the directory
		os.remove("export/" + language + '/' + f)

	if debug:
		print("FILE LIST FOR " + language + ':')
		print(fileList)
		print()

	indexHtml = '' # clear out the index html string

	with open("guides/" + language + "_index_START.html", encoding="utf8") as indexReader: # insert starting html
		indexHtml += indexReader.read()

	psalmsJs += "const psalms" + language.upper() + " = [\n"

	for file in fileList: # process all files and create html
		with open("psalms/" + language + '/' + file, encoding="utf8") as reader:
			if debug: print("READING FILE: " + file)

			# Get titles
			title = reader.readline().split('\n')[0]
			subtitle = reader.readline().split('\n')[0]
			id = reader.readline().split('\n')[0]
			classes = reader.readline().split('\n')[0]
			capo = reader.readline().split('\n')[0]
			colCount = 0

			# Start psalm html file
			with open("guides/" + language + "_psalm_START.html", encoding="utf8") as psalmReader:
				psalmHtml += psalmReader.read()
			psalmHtml += "\t<section id='psalm' class='" + classes + "'>\n"
			psalmHtml += "\t\t<h1 id='" + id + "'>" + title + "</h1>\n"
			psalmHtml += "\t\t<h2>" + subtitle + "</h2>\n"
			psalmHtml += "\t\t<p class='capo'>" + capo + "</p>\n"
			psalmHtml += "\t\t<div id='text'>\n"

			# Start psalm text file
			psalmText += title + ' ' + subtitle

			if debug:
				print("TITLE: " + title)
				print("SUBTITLE: " + subtitle)
				print("ID: " + id)
				print("CLASSES: " + classes)
				print("CAPO: " + capo)

			# Read file line by line
			for line in reader.readlines():
				lineSplit = line.split('\n')[0]
				if readingVerse: # If we have started reading a section:
					if lineSplit and lineSplit[0] == ')': # Check if we have ended a section
						endSection()
						continue
					if getChord and not textOnly: # If we are currently getting a chord:
						chords = lineSplit
						getChord = False
					else: # Otherwise read the verse
						insertVerse(lineSplit)
				elif lineSplit: #If not reading a section:
					if lineSplit[0] == '[': # Check beginning of column
						startColumn()
					elif lineSplit[0] == ']': # Check ending of column
						endColumn()
					elif lineSplit[0] == '(': # Check beginning of section
						startSection(lineSplit)
					elif lineSplit[0] == "*": # Check if there is a footnote
						insertNote(lineSplit)

			# Write all the changes to an html file
			psalmHtml += "\t\t</div>\n\t</section>\n"
			with open("guides/" + language + "_psalm_END.html") as psalmReader:
				psalmHtml += psalmReader.read()
			psalmFileName = "export/" + language + '/' + file.replace(".txt", ".html")
			psalmFile = open(psalmFileName, 'w', encoding="utf8")
			psalmFile.write(psalmHtml)
			psalmFile.close()
			print("CREATED PSALM: " + psalmFileName)

			# Add link to index html
			indexHtml += "\t\t<a id='" + id + "' class='psalm " + classes + "' href='/" + language + "/" + file.replace(".txt", ".html") + "'>" + title + "<span>" + subtitle + "</span></a>\n"

			# Add object to js psalm list with id, link, and text
			psalmsJs += "\t{\n\t\tid: " + id + ",\n\t\tlink: '" + file.replace(".txt", '') + "',\n\t\ttext: '" + normalize(psalmText.lower()) + "'\n\t},\n"

			# Reset values
			chords = ''
			psalmHtml = ''
			psalmText = ''
			colCount = 0

	# write index string to new index.html in appropriate language
	with open("guides/" + language + "_index_END.html", encoding="utf8") as indexReader:
		indexHtml += indexReader.read()
	indexFileName = "export/" + language + "/index.html"
	indexFile = open(indexFileName, 'w', encoding="utf8")
	indexFile.write(indexHtml)
	indexFile.close()
	print()
	print("CREATED INDEX: " + indexFileName)
	print()

	# close psalm list of javascript objects
	psalmsJs += "\t{}\n];\n"

# write psalm array of objects to javascript file
psalmsJsFileName = "export/js/psalms.js"
psalmsJsFile = open(psalmsJsFileName, 'w', encoding="utf8")
psalmsJsFile.write(psalmsJs)
psalmsJsFile.close()
print("CREATED JAVASCRIPT PSALM LIST: " + psalmsJsFileName)
