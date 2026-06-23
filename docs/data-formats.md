# Data Formats

These are the exact spreadsheet headings supported in Phase 1.

## Crossword

Required headings:

```text
Clue,Answer,Category
```

Optional future heading:

```text
Grid Answer
```

Behaviour:

- Blank rows are ignored.
- Partially filled rows are retained as incomplete draft content.
- Answers are preserved for display.
- Playable grid answers are uppercased and normalized.
- Spaces, apostrophes, full stops, and hyphens are removed.
- Diacritics are normalized where safe.
- `A-Z` and `0-9` are allowed in the grid.
- Unsupported symbols are rejected.
- `&` is not auto-converted to `AND`.

Example:

```csv
Clue,Answer,Category
"You LOVE watching this lad in movies all the time.",Seth Rogan,Movies
"""That's why her hair is so big. It's full of secrets.""",Mean Girls,Movies
DNA is not real,You,Television
Adorable gay office worker,Burt,Television
```

## Connections

Required headings:

```text
Category,Movie 1,Movie 2,Movie 3,Movie 4
```

Behaviour:

- Blank rows are ignored.
- Rows with fewer than four movies are retained as incomplete.
- Rows need four unique movie titles within the row.
- Overlap across the wider source bank is allowed.
- A compiled game still requires four non-overlapping groups.

Example:

```csv
Category,Movie 1,Movie 2,Movie 3,Movie 4
Tara's repeat offenders,Gone Girl,The Devil Wears Prada,Broadcast News,Challengers
Sexy Bill Murray,Ghostbusters,Groundhog Day,Lost in Translation,The Grand Budapest Hotel
Time loops,The Triangle,50 First Dates,Groundhog Day,Palm Springs
Competence Porn,Moneyball,Arrival,Catch Me If You Can,Ocean's Eleven
```

## Guessing Game

Required headings:

```text
Right Answer,Answer 2,Answer 3,Answer 4,Letterboxed Reviews
```

Behaviour:

- Blank rows are ignored.
- Partial rows are retained as incomplete.
- Reviews preserve punctuation and line breaks.
- All four answer choices must be present and unique within the row.
- The correct answer is stored independently from future shuffled display order.

Example:

```csv
Right Answer,Answer 2,Answer 3,Answer 4,Letterboxed Reviews
Arrival,Interstellar,Gravity,Contact,"I support women in STEM and also crying in your car afterward."
Gone Girl,Prisoners,Zodiac,Nightcrawler,"Relationship goals, if your goal is total emotional devastation."
The Devil Wears Prada,Julie & Julia,The Intern,Nope,"The outfits were a 10, the boss was terrifying, and I still wanted the job."
```

