import os, unicodedata, json

state = 'start'
psalms = {}
languages = ["es", "en"]

def normalize(text):
	return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn').lower()

# START
print()
print("STARTING PSALM JSON GENERATION")
print()

for language in languages: # run loop for all languages
	fileList = sorted(next(os.walk("psalms/" + language), (None, None, []))[2]) # get list of txt files in alphabetical order

	psalms[language] = [] # create psalm array of specified language

	for file in fileList: # process all psalm text files and create json
		with open("psalms/" + language + '/' + file, encoding="utf8") as reader:
			print("OPENING FILE: " + file)
			# Get titles
			title = reader.readline().split('\n')[0]
			subtitle = reader.readline().split('\n')[0]
			id = "p" + reader.readline().split('\n')[0]
			classes = reader.readline().split('\n')[0]
			capo = reader.readline().split('\n')[0]
			audio = reader.readline().split('\n')[0]

			if audio != "NO AUDIO":
				audio = file.split(".txt")[0] + ".mp3"

			psalm = {}
			psalm["col1"] = []
			psalm["col2"] = []
			colCount = 0
			verse = ''
			chords = ''
			verseType = ''
			text = title + " " + subtitle

			# Read file line by line
			for line in reader.readlines():
				line = line.split('\n')[0]
				#print("Current line: " + line)
				if line and line[0] != "]": # If line contains something, aka is not the end of a section, and is not the end of a section, process it
					if line[0] == '[': # If beginning of column, set state to section start
						state = 'verse-start'
						colCount += 1
					elif line[len(line) - 1] == "^": # If the last character is '^' (chord), read the line
						chords = line.split('^')[0]
					else: # Line must be a verse, process and add it to the column array
						if state == 'verse-start': # If it is the beginning of a verse, store the first letter and then clear the next 3 characters (A. )
							verseType = line[0]
							line = line[3:]
							state = 'verse-reading'

						if chords: # If there are chords to be inserted
							chords = chords.rstrip()
							while chords:
								i = chords.rfind(' ') + 1
								chord = chords[i:]
								chordLine = line[:i] + "<span data-chord='" + chord + "'></span>" + line[i:]
								chords = chords[:i].rstrip()
							chords = ''
							verse += chordLine + "<br>"
						else:
							verse += line + "<br>"
						text += " " + line

				else: # If we have reached the end of a section, write verses to the column array
					if colCount == 1:
						psalm["col1"].append({
							"type": verseType,
							"verse": verse
						})
					else:
						psalm["col2"].append({
							"type": verseType,
							"verse": verse
						})
					sectionType = ''
					verse = ''
					state = 'verse-start'

			psalms[language].append({
				"title": title,
				"subtitle": subtitle,
				"id": id,
				"classes": classes,
				"capo": capo,
				"audio": audio,
				"psalm": psalm,
				"text": normalize(text)
			})

	print()
	print("CREATED " + language + " PSALM ARRAY")
	print()

# write psalm array of objects to js file
psalmsFile = "../js/psalms.js"
jsonDataFile = open(psalmsFile, "w", encoding="utf8")
jsonDataFile.write(json.dumps(psalms, ensure_ascii=False, indent=4))
jsonDataFile.close()

# write 'psalms = ' at beginning of file to create a javascript object
with open(psalmsFile, encoding="utf8") as f:
	newFile = f.read()

newFile = "psalms = " + newFile
with open(psalmsFile, "w", encoding="utf8") as f:
	f.write(newFile)

print("SUCCESSFULLY CREATED JSON PSALM LIST")
