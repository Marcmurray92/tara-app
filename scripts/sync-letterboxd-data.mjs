import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    args[key] = next && !next.startsWith("--") ? next : "true";
    if (next && !next.startsWith("--")) {
      index += 1;
    }
  }

  return args;
}

function toSlug(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = Papa.parse(raw, {
    header: true,
    skipEmptyLines: true
  });

  if (parsed.errors.length > 0) {
    throw new Error(`Could not parse ${filePath}: ${parsed.errors[0]?.message ?? "unknown error"}`);
  }

  return parsed.data;
}

function asNumber(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function cleanReviewText(value) {
  return String(value ?? "")
    .replace(/<\/?blockquote>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractCelebrationQuote(reviewText) {
  const cleaned = cleanReviewText(reviewText);

  if (!cleaned) {
    return null;
  }

  const firstParagraph = cleaned
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .find(Boolean);

  if (!firstParagraph) {
    return null;
  }

  if (firstParagraph.length <= 160) {
    return firstParagraph;
  }

  const firstSentence = firstParagraph.match(/.+?[.!?](?=\s|$)/)?.[0]?.trim();
  if (firstSentence && firstSentence.length <= 160) {
    return firstSentence;
  }

  return `${firstParagraph.slice(0, 157).trimEnd()}...`;
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const ratingsPath = args.ratings;
  const reviewsPath = args.reviews;
  const outDir = args["out-dir"] ?? "data/letterboxd/processed";

  if (!ratingsPath || !reviewsPath) {
    throw new Error("Usage: node scripts/sync-letterboxd-data.mjs --ratings <ratings.csv> --reviews <reviews.csv> [--out-dir <dir>]");
  }

  const ratingsRows = readCsv(ratingsPath);
  const reviewRows = readCsv(reviewsPath);
  ensureDirectory(outDir);

  const ratings = ratingsRows.map((row) => ({
    slug: toSlug(row.Name),
    title: row.Name,
    year: asNumber(row.Year),
    rating: asNumber(row.Rating),
    ratedOn: row.Date || null,
    letterboxdUri: row["Letterboxd URI"] || null
  }));

  const reviews = reviewRows.map((row) => {
    const reviewText = cleanReviewText(row.Review);

    return {
      slug: toSlug(row.Name),
      title: row.Name,
      year: asNumber(row.Year),
      rating: asNumber(row.Rating),
      reviewText,
      celebrationQuote: extractCelebrationQuote(reviewText),
      rewatch: row.Rewatch === "Yes" ? true : row.Rewatch === "No" ? false : null,
      reviewedOn: row.Date || null,
      watchedOn: row["Watched Date"] || null,
      tags: row.Tags ? row.Tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      letterboxdUri: row["Letterboxd URI"] || null
    };
  });

  const reviewQuotes = reviews
    .filter((review) => review.celebrationQuote)
    .map((review) => ({
      slug: review.slug,
      title: review.title,
      year: review.year,
      rating: review.rating,
      celebrationQuote: review.celebrationQuote
    }));

  const metadata = {
    generatedAt: new Date().toISOString(),
    source: {
      ratingsCsv: path.resolve(ratingsPath),
      reviewsCsv: path.resolve(reviewsPath)
    }
  };

  writeJson(path.join(outDir, "tara-ratings.json"), {
    ...metadata,
    count: ratings.length,
    ratings
  });

  writeJson(path.join(outDir, "tara-reviews.json"), {
    ...metadata,
    count: reviews.length,
    reviews
  });

  writeJson(path.join(outDir, "tara-review-quotes.json"), {
    ...metadata,
    count: reviewQuotes.length,
    quotes: reviewQuotes
  });

  console.log(`Wrote ${ratings.length} ratings, ${reviews.length} reviews, and ${reviewQuotes.length} quote candidates to ${outDir}`);
}

main();
