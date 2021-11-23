import os, unicodedata, json

state = 'start'
psalms = {}
languages = ["es", "en"]

def normalize(text):
	return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')

# START
print()
print("STARTING PSALM JSON GENERATION")

for language in languages: # run loop for all languages
	fileList = sorted(next(os.walk("psalms/" + language), (None, None, []))[2]) # get list of txt files in alphabetical order

	psalms[language] = [] # create psalm array of specified language

	for file in fileList: # process all psalm text files and create json
		with open("psalms/" + language + '/' + file, encoding="utf8") as reader:
			print()
			print("OPENING FILE: " + file)
			print()
			# Get titles
			title = reader.readline().split('\n')[0]
			subtitle = reader.readline().split('\n')[0]
			id = reader.readline().split('\n')[0]
			classes = reader.readline().split('\n')[0]
			capo = reader.readline().split('\n')[0]

			psalm = {}
			psalm["col1"] = []
			psalm["col2"] = []
			colCount = 0
			verse = ''
			chords = ''
			verseType = ''

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
							#print()
							#print("VERSE STARTED")
							#print()
							verseType = line[0]
							line = line[3:]
							state = 'verse-reading'
							#print("--Verse type: " + verseType)
						if chords: # If there are chords to be inserted
							chords = chords.rstrip()
							while chords:
								i = chords.rfind(' ') + 1
								chord = chords[i:]
								line = line[:i] + "<span data-chord='" + chord + "'></span>" + line[i:]
								chords = chords[:i].rstrip()
							chords = ''
						verse += line + "<br>"
						#print("--Inserted line: " + line)
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
					#print()
					#print("VERSE ENDED")
					#print()
			#print("PSALM:")
			#print(json.dumps(psalms, ensure_ascii=False, indent=2))
			#Write psalm to psalms array
			psalms[language].append({
				"title": title,
				"subtitle": subtitle,
				"id": id,
				"classes": classes,
				"capo": capo,
				"psalm": psalm
			})

	print()
	print("CREATED " + language + " PSALM ARRAY")
	print()

# write psalm array of objects to json file
jsonDataFile = open("export/psalms.js", "w", encoding="utf8")
jsonDataFile.write(json.dumps(psalms, ensure_ascii=False, indent=4))
jsonDataFile.close()

print("SUCCESSFULLY CREATED JSON PSALM LIST")
