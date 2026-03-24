# Pulpit General Conference Archive — Volunteer Data Collection Guide

**Project Goal:** Build a comprehensive, searchable archive of every General Conference talk from 1830 to present, with links to original source documents and honest provenance metadata.

**Last Updated:** March 2026

---

## How This Works

Each conference talk becomes one Markdown file (`.md`) with structured metadata at the top. You don't need to be technical — if you can copy/paste text and fill in a template, you can contribute. This guide tells you exactly where to find talks, how to record them, and where to put your files when you're done.

**Your deliverables for each talk:**
1. A `.md` file with metadata + transcript text (template below)
2. A link to the original source (scan, webpage, etc.)
3. A note in the `fidelity` field describing how trustworthy the transcript is

---

## File Naming Convention

Every file follows this pattern:

```
YYYY-MM-DD_lastname-firstname_short-title.md
```

Examples:
- `1971-04-06_lee-harold-b_strengthen-the-stakes-of-zion.md`
- `1853-10-06_young-brigham_the-gospel.md`
- `1880-04-06_taylor-john_opening-remarks.md`

Rules:
- Dates: `YYYY-MM-DD`. If the exact day is unknown, use the first day of conference (usually the 6th for April, 6th for October).
- Names: `lastname-firstname` in lowercase, hyphens instead of spaces.
- Title: short slug from the talk title, lowercase, hyphens. Keep it under 50 characters. If no title exists (common pre-1900), use a 3–5 word description of the topic.
- If two talks share the same date and speaker, append `-2`, `-3`, etc.

---

## The Template

Copy this exactly for each talk. Fill in every field you can. Leave fields as `null` if unknown.

```yaml
---
# === IDENTIFICATION ===
speaker: "Brigham Young"
date: "1853-10-06"
conference: "October 1853 General Conference"
session: null                     # e.g., "Saturday Morning", "Priesthood", "Sunday Afternoon"

# === SOURCE & PROVENANCE ===
source_title: "Journal of Discourses, Vol. 1"
source_url: "https://contentdm.lib.byu.edu/digital/collection/JournalOfDiscourses3/id/1861/"
source_type: "shorthand_transcription"
# source_type options:
#   original_manuscript    — handwritten minutes or notes by an attendee
#   shorthand_transcription — transcribed from Pitman shorthand (JD, Deseret News pre-1870s)
#   newspaper_report       — published in Deseret News, Millennial Star, Times and Seasons
#   official_report        — from the official Conference Report series (1880, 1897+)
#   church_website         — from churchofjesuschrist.org (1971+)
#   compiled_transcription — from Watson or similar secondary compiler

fidelity: "edited"
# fidelity options:
#   verbatim        — believed to faithfully represent what was said (e.g., post-1942 official reports, modern digital text)
#   near_verbatim   — stenographic but with minor editorial polish (e.g., 1897-1942 Conference Reports)
#   edited          — significant editorial changes from original speech (e.g., most JD entries)
#   summary         — not a full transcript; a summary or synopsis of what was said
#   reconstructed   — compiled from fragments, journals, or secondary accounts
#   normalized      — transcript exists but spelling/grammar was modernized (e.g., Watson)

fidelity_notes: "George D. Watt shorthand, known to contain editorial insertions. See Dirkmaat & Carruth, BYU Studies 54:4 (2015)."

# === ALTERNATE SOURCES (optional, add as many as apply) ===
alternate_sources:
  - title: "Deseret News, October 15, 1853"
    url: "https://newspapers.lib.utah.edu/details?id=..."
    type: "newspaper_report"
  - title: "Carruth shorthand transcription"
    url: "https://catalog.churchofjesuschrist.org/assets/..."
    type: "shorthand_transcription"

# === MEDIA (1971+ only) ===
video_url: null                   # official church video link
audio_url: null                   # official church audio link

# === COLLECTION METADATA ===
collected_by: "your-name"
collected_date: "2026-03-23"
needs_review: true                # set false once a second person has verified
notes: "Any notes about problems, gaps, or uncertainties."
---

[TRANSCRIPT TEXT GOES HERE]

Paste the full text of the talk below the YAML header.
Preserve paragraph breaks. Do not add your own formatting, headers, or commentary.
If working from a scan, do your best to faithfully reproduce the text, including original spelling.
Mark any uncertain readings with [?] and any illegible passages with [illegible].
```

---

## Source Guide by Era

### Stage 1: 1897–Present (Easiest — Start Here)

**What exists:** Complete official Conference Reports (1897–2017 as scanned booklets; 1971+ as digital text on the church website; video/audio from 1971+).

**Where to get it:**

| Date Range | Source | URL Pattern |
|---|---|---|
| 1971–present (text) | ChurchofJesusChrist.org | `https://www.churchofjesuschrist.org/study/general-conference/YYYY/MM/talk-slug` |
| 1971–present (video) | ChurchofJesusChrist.org | Same page as text — grab the video URL from the player |
| 1897–2017 (scans) | Internet Archive | `https://archive.org/details/conferencereportYYYYa` (April) or `conferencereportYYYYsa` (October) |
| 1897–2017 (scans, better viewer) | Archive Viewer | `https://archiveviewer.org/collections/en/conference-report` |

**Your task:**
- **For 1971–present:** Copy the text from the church website. Use the church website URL as your `source_url`. Set `source_type: "church_website"` and `fidelity: "verbatim"`. Record the `video_url` and `audio_url` from the same page.
- **For 1897–1970:** The Internet Archive scans already have OCR text (downloadable as "FULL TEXT" from each item). Download that, paste it into the template, and *spot-check it against the scan* for OCR errors. Use the Internet Archive URL as your `source_url`. Set `source_type: "official_report"` and `fidelity: "near_verbatim"` (pre-1942) or `"verbatim"` (1942+, when magazine publication added another editorial pass).

**Splitting talks:** Each conference report contains many talks. You need to split them into individual files, one per talk. Use the speaker name and session headings in the report to find the boundaries.

**Tip:** The 1897–1970 range is ideal for parallel work. Each volunteer takes a decade.

---

### Stage 2: 1881–1896 (The Gap)

**What exists:** No standalone Conference Reports for this period (the 1880 report was a one-off; the series resumed in October 1897). The Journal of Discourses covers through 1886. Newspaper coverage fills the rest.

**Where to get it:**

| Date Range | Source | URL |
|---|---|---|
| 1881–1886 | Journal of Discourses (vols. 22–26) | BYU Digital Collections: `https://contentdm.lib.byu.edu/digital/collection/JournalOfDiscourses3/id/[PAGE_ID]` |
| 1881–1896 | Deseret News | Utah Digital Newspapers: `https://newspapers.lib.utah.edu` (search for "general conference" near April/October dates) |
| 1881–1896 | Deseret News | BYU Digital Collections: `https://lib.byu.edu/collections/the-deseret-news/` |
| 1830–1897 | Watson transcriptions (finding aid) | `https://www.eldenwatson.net/ECCRintro.htm` |

**Your task:**
1. Use Watson's site as your *index* — he lists every conference and every speaker for this period.
2. For each talk, go find the actual source: check the JD first (1881–1886), then the Deseret News on Utah Digital Newspapers.
3. Copy/paste the text. Link to the JD page on BYU's ContentDM or to the newspaper page on Utah Digital Newspapers.
4. Set `source_type` to `"shorthand_transcription"` (JD) or `"newspaper_report"` (Deseret News).
5. Set `fidelity: "edited"` for JD entries. Set `fidelity: "near_verbatim"` for Deseret News reports from the late 1880s+ (by this time, David W. Evans and other skilled reporters were doing the transcription, and accuracy had improved from the Watt era).

**Important:** The JD includes non-conference talks. Only collect entries whose dates and descriptions match known General Conference sessions (first week of April and October, held in the Tabernacle). Note that some 1880s conferences were held in Provo, Logan, and Coalville due to anti-polygamy enforcement — Watson's index will tell you which.

---

### Stage 3: 1850–1879 (JD + Newspapers)

**What exists:** The Journal of Discourses (1854–1886) and the Deseret News (from 1850). Before the JD started, the Deseret News is the primary source.

**Where to get it:**

| Source | URL |
|---|---|
| Journal of Discourses (scans) | BYU ContentDM: `https://contentdm.lib.byu.edu/digital/collection/JournalOfDiscourses3/` |
| Journal of Discourses (text) | FAIR: `https://www.fairlatterdaysaints.org/answers/Journal_of_Discourses` |
| Journal of Discourses (text, with some errors) | `https://jod.mrm.org/` |
| Deseret News | Utah Digital Newspapers: `https://newspapers.lib.utah.edu` |
| Deseret News | BYU: `https://lib.byu.edu/collections/the-deseret-news/` |
| BYU GC Corpus (text, limited search) | `https://www.lds-general-conference.org/` |
| Watson (index/finding aid) | `https://www.eldenwatson.net/ECCRintro.htm` |

**Your task:**
1. Again, use Watson as your finding aid to know which talks exist at which conferences.
2. Prioritize the JD text (1854–1879) but **always note** that JD transcriptions are editorially altered. Where you can find the same talk in the Deseret News, record it as an `alternate_source`.
3. For 1850–1853 (before the JD started), the Deseret News is your only source for verbatim-ish text.
4. Use the BYU ContentDM page-level URL for the JD scan as your `source_url`.

**Conference vs. Non-Conference in the JD:** Look at the discourse header. Conference talks will say something like "Delivered at the General Conference" or "Delivered in the Tabernacle ... April 6, 18XX" (or October 6). Sunday sermons delivered at other times of year are NOT conference talks.

---

### Stage 4: 1830–1844 (Joseph Smith Papers)

**What exists:** The Joseph Smith Papers project has transcribed and digitized conference minutes, with original manuscript images. Coverage is very good for conferences Joseph Smith attended or presided over. For some early conferences, only brief minutes (not full sermon texts) survive.

**Where to get it:**

| Source | URL |
|---|---|
| JSP Calendar of Documents | `https://www.josephsmithpapers.org/articles/finding-aids` → "Calendar of Documents" |
| JSP Discourses database | `https://www.josephsmithpapers.org/articles/finding-aids` → "Joseph Smith's Discourses" |
| JSP search | `https://www.josephsmithpapers.org/search` |
| Minute Book 2 (conferences 1830–1839) | `https://www.josephsmithpapers.org/paper-summary/minute-book-2/` |
| Times and Seasons (1839–1846) | Available on JSP site and Internet Archive |

**Your task:**
1. Go to the JSP Calendar of Documents. Scan for entries dated around known conference dates (early church conferences were in June and September 1830, then became more regular; by 1840, April and October pattern was established).
2. Look for document titles containing "Minutes," "Minutes and Discourse," or "Conference."
3. For each conference, the JSP often has *multiple versions* (e.g., Thomas Bullock's report, William Clayton's report, the Times and Seasons publication). Record the **featured version** (marked with an asterisk on JSP) as your primary source and list others as `alternate_sources`.
4. Use the JSP page URL as your `source_url`. Set `source_type: "original_manuscript"` for the handwritten minutes, or `"newspaper_report"` for the Times and Seasons version.
5. Many early conferences have only summary minutes, not verbatim speeches. Set `fidelity: "summary"` for these. Some later Nauvoo-era conferences (1843–1844) have more detailed discourse accounts — set these as `"near_verbatim"` or `"reconstructed"` depending on the JSP's own annotation.

**Note:** The JSP only covers Joseph Smith's papers. Conferences where Joseph did not speak or preside may not appear. For those, check the Times and Seasons and Watson.

---

### Stage 5: 1845–1850 (Hardest)

**What exists:** Fragmentary. No JD yet, no Conference Reports, no JSP coverage (Joseph is dead). Sources are scattered across journals, newspapers, and compiled histories.

**Where to get it:**

| Source | URL |
|---|---|
| Journal History of the Church (through 1923) | `https://catalog.churchofjesuschrist.org` → search "Journal History" |
| Wilford Woodruff Papers | `https://wilfordwoodruffpapers.org/` |
| Times and Seasons (through Feb 1846) | Internet Archive; also on JSP site |
| Millennial Star | Church History Catalog: `https://catalog.churchofjesuschrist.org` |
| Deseret News (from June 1850) | Utah Digital Newspapers: `https://newspapers.lib.utah.edu` |
| Watson (compiled transcriptions) | `https://www.eldenwatson.net/ECCRintro.htm` |

**Your task:**
1. Use Watson's site to identify which conferences were held and who spoke.
2. **No conference was held in 1846** (the exodus year). Conferences resumed along the trail in 1847–1848.
3. For each conference, check the Journal History first (it's a compiled daily scrapbook and may have already gathered the relevant newspaper clippings and journal entries).
4. Check the Wilford Woodruff Papers for his journal entries on conference dates — he was meticulous.
5. For talks from late 1850 onward, the Deseret News becomes available.
6. If you can only find Watson's version, use it — but set `source_type: "compiled_transcription"` and `fidelity: "normalized"`, and note that Watson standardized spelling and grammar.
7. For any talk where you can only find a brief summary rather than a full transcript, set `fidelity: "summary"` and include whatever text you have.

**This stage is detective work.** Don't expect to find clean full-text transcripts. Document what you find, note the gaps honestly, and move on. We can always fill in later.

---

## Where to Put Your Files

### Google Drive Structure

We'll use a shared Google Drive folder. The structure is:

```
/GC-Archive/
  /stage-1_1897-present/
    /1897-1909/
    /1910-1919/
    /1920-1929/
    /1930-1939/
    /1940-1949/
    /1950-1959/
    /1960-1969/
    /1970-1979/
    /1980-1989/
    /1990-1999/
    /2000-2009/
    /2010-2019/
    /2020-present/
  /stage-2_1881-1896/
  /stage-3_1850-1879/
  /stage-4_1830-1844/
  /stage-5_1845-1850/
  /reference/
    conference-date-index.md       ← master list of all known conference dates
    jd-conference-crossref.md      ← which JD entries are conference talks
    volunteer-assignments.md       ← who is working on what
```

### Workflow

1. **Claim your assignment.** Check `volunteer-assignments.md`, pick an unclaimed decade or era, and add your name.
2. **Work locally.** Create your `.md` files on your own computer.
3. **Upload in batches.** Drop completed files into the appropriate decade folder. Don't wait until you're "done" — upload as you go so others can see progress.
4. **Flag problems.** If you hit a talk you can't find, or an OCR scan that's illegible, or any other issue, set `needs_review: true` and describe the problem in `notes`.

### Quality Checks

Before uploading a file, verify:
- [ ] Filename follows the `YYYY-MM-DD_lastname-firstname_short-title.md` pattern
- [ ] YAML header has all required fields filled in
- [ ] `source_url` is a working link (click it!)
- [ ] `fidelity` and `source_type` are set to one of the allowed values
- [ ] Transcript text is below the `---` closing the YAML header
- [ ] No added commentary, headers, or formatting beyond paragraph breaks
- [ ] `collected_by` has your name and `collected_date` is today's date

---

## Stable Link Reference

These are the most reliable, long-lived URLs for each source. Prefer these over alternatives.

| Source | Base URL | Likely Stability |
|---|---|---|
| ChurchofJesusChrist.org (1971+) | `churchofjesuschrist.org/study/general-conference/` | ★★★★★ Official, highly stable |
| Joseph Smith Papers | `josephsmithpapers.org/paper-summary/` | ★★★★★ Institutional, permanent IDs |
| Internet Archive (Conference Reports) | `archive.org/details/conferencereportYYYY...` | ★★★★☆ Very stable, institutional |
| BYU ContentDM (JD scans) | `contentdm.lib.byu.edu/digital/collection/JournalOfDiscourses3/id/` | ★★★★☆ Academic, persistent |
| Utah Digital Newspapers (Deseret News) | `newspapers.lib.utah.edu/details?id=` | ★★★★☆ University of Utah, persistent |
| BYU Deseret News Digital | `lib.byu.edu/collections/the-deseret-news/` | ★★★★☆ Academic, persistent |
| Church History Catalog | `catalog.churchofjesuschrist.org/` | ★★★★☆ Official, actively maintained |
| Wilford Woodruff Papers | `wilfordwoodruffpapers.org/` | ★★★☆☆ Grant-funded project; may move |
| Watson's site | `eldenwatson.net/` | ★★☆☆☆ Personal site, could disappear |
| FAIR (JD text) | `fairlatterdaysaints.org/answers/Journal_of_Discourses` | ★★★☆☆ Nonprofit, reasonably stable |
| Archive Viewer (Conference Reports) | `archiveviewer.org/collections/en/conference-report` | ★★★☆☆ Community project, good aggregator |

**Rule of thumb:** Always link to the most institutional/official source available. If a talk exists on the church website, link there — even if you found the text elsewhere.

---

## FAQ

**Q: What if I find a talk but the OCR is terrible?**
A: Include the OCR text anyway (it's better than nothing for search), set `needs_review: true`, and note the problem. Someone else can clean it up later.

**Q: What if a speaker's name is spelled differently in different sources?**
A: Use the modern standard spelling used on ChurchofJesusChrist.org. If that doesn't cover the person, use the spelling from the most authoritative source. Note variants in the `notes` field.

**Q: Should I correct obvious typos in historical transcripts?**
A: **No.** Reproduce the text as-is from your source. If there's an obvious error, add `[sic]` after it. The whole point of this project is honest provenance — we don't normalize.

**Q: What about talks in the JD that might be conference talks but I'm not sure?**
A: Check the discourse header for the date and location. If it says "General Conference" or matches a known conference date (first week of April/October) and was delivered in the Tabernacle or Bowery, include it. If you're uncertain, include it with a note: `"notes: "Uncertain whether this is a General Conference talk or a regular Sunday discourse. Date matches conference schedule but header does not specify."`

**Q: What about non-English talks?**
A: Out of scope for now. English only in this first pass.

**Q: What if I find something amazing that isn't a conference talk — like a Brigham Young discourse from the School of the Prophets?**
A: Set it aside! We may expand scope later. For now, strictly General Conference talks only.
