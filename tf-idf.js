// I am not an expert at text analysis, and I mostly figured this out by copying
// formulas from Wikipedia. The part that calculates similarities is completely
// my own invention and can probably be improved. For the tokenization, I opted
// for just a "good enough" simple algorithm.

// Split by regex "word." This is very basic and won't detect many real words.
let re = /[^\w]/g;

let stopWords = new Set([
  // Copied from Postresql https://github.com/postgres/postgres/blob/653b55b57081dc6fb8c75d61870c5fdc8c8554cc/src/backend/snowball/stopwords/english.stop
  "i",
  "me",
  "my",
  "myself",
  "we",
  "our",
  "ours",
  "ourselves",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "a",
  "an",
  "the",
  "and",
  "but",
  "if",
  "or",
  "because",
  "as",
  "until",
  "while",
  "of",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
  // More stopwords specialized for BWL
  "false",
  "https",
  "external_link",
  "image",
  "tags",
  "hero_image",
  "alt",
  "caption",
  "com",
  "www",
  "one",
  "like",
  "also",
  "org",
  "even",
  "upload",
  "res",
  "cloudinary",
  "need",
  "make",
  "may",
  "get",
  "jpg",
  "would",
  "bikewalk",
  "way",
  "many",
  "much",
  "use",
  "still",
  "2022",
  "could",
  "around",
  "aren",
  "want",
  "lot",
  "isn",
  "always",
  "every",
  "know",
  "often",
  "untagged",
  "across",
  "seems",
  "look",
  "part",
  "2023",
  "000z",
  "take",
  "already",
]);

let minWordLength = 3;

/**
 * Tokenize a document and count the number that each term occurs.
 */
function Doc(src, id) {
  this.src = src;
  this.terms = new Map();
  this.id = id;
  this.maxTerm = "";
  this.maxCount = 0;
  for (let term of src.split(re)) {
    let termLower = term.toLowerCase();
    if (termLower.length >= minWordLength && !stopWords.has(termLower)) {
      let count = this.rawCount(termLower) + 1;
      this.terms.set(termLower, count);
      if (count > this.maxCount) {
        this.maxTerm = termLower;
        this.maxCount = count;
      }
    }
  }
}

/**
 * Check if a term exists in a document.
 */
Doc.prototype.binary = function (term) {
  return this.terms.has(term) ? 1 : 0;
};

/**
 * Get the count of a term in a document. This is biased for longer documents.
 */
Doc.prototype.rawCount = function (term) {
  return this.terms.get(term) || 0;
};

/**
 * Get the count of a term in a document porportional to its number of total
 * terms.
 */
Doc.prototype.termFrequency = function (term) {
  let size = this.terms.size;
  return size === 0 ? 0 : this.rawCount(term) / size;
};

/**
 * Get the logarithm of the count of a term in a document.
 */
Doc.prototype.logNormalize = function (term) {
  return Math.log(1 + this.rawCount(term));
};

/**
 * Get the count of a term in document porportional to the count of the most
 * common word in the document. `k` is usually `0.5`.
 */
Doc.prototype.doubleNormalize = function (term, k) {
  let maxCount = this.maxCount;
  return maxCount === 0 ? 0 : k + k * (this.rawCount(term) / maxCount);
};

/**
 * Map each term to a list of documents that contains it.
 */
export function DocCollection() {
  this.docs = [];
  this.terms = new Map();
}

/**
 * Add a document to the list and map it to its terms.
 */
DocCollection.prototype.add = function (src, id) {
  let doc = new Doc(src, id);
  this.docs.push(doc);
  for (let term of doc.terms.keys()) {
    if (this.terms.has(term)) {
      this.terms.get(term).push(doc);
    } else {
      this.terms.set(term, [doc]);
    }
  }
};

/**
 * Count the instances of a term in the collection.
 */
DocCollection.prototype.n = function (term) {
  return this.terms.has(term) ? this.terms.get(term).length : 0;
};

/**
 * The logarithm of the number of documents containing a term inversely
 * porportional to the total number of documents.
 */
DocCollection.prototype.inverseDocFreq = function (term) {
  let nt = this.n(term);
  return nt === 0 ? 0 : Math.log(this.docs.length / nt);
};

/**
 * The same except "smoothed." It doesn't decrease as fast for common terms.
 */
DocCollection.prototype.inverseDocFreqSmooth = function (term) {
  let nt = this.n(term);
  return nt === 0 ? 0 : 1 + Math.log(this.docs.length / (1 + nt));
};

/**
 * Calculate the probability that a document contains a term.
 */
DocCollection.prototype.inverseDocFreqProb = function (term) {
  let nt = this.n(term);
  return nt === 0 ? 0 : Math.log((this.docs.length - nt) / nt);
};

/**
 * Calculate the tf-idf for each term in each document and use it to determine
 * which documents are most similar to each other.
 */
export function Similar(col) {
  this.docsTerms = new Map(); // A map of document IDs to terms with weights.
  this.termsDocs = new Map(); // A map of terms to document IDs with weights.
  for (let doc of col.docs) {
    let terms = [];
    for (let term of doc.terms.keys()) {
      // Finally, the foretold tf-idf calculation. Swap out these methods for
      // others if needed:
      let tfidf = doc.doubleNormalize(term, 0.5) * col.inverseDocFreq(term);
      if (col.terms.get(term).length > 1 && tfidf > 0) {
        terms.push({ term: term, tfidf: tfidf });
        if (this.termsDocs.has(term)) {
          this.termsDocs.get(term).push({ id: doc.id, tfidf: tfidf });
        } else {
          this.termsDocs.set(term, [{ id: doc.id, tfidf: tfidf }]);
        }
      }
    }
    this.docsTerms.set(doc.id, terms);
  }
}

/**
 * For a given document ID get a list of documents similar to it.
 */
Similar.prototype.get = function (id, limit) {
  let result = [];
  if (this.docsTerms.has(id)) {
    let weights = new Map(); // A map of document IDs to their weight.
    for (let term of this.docsTerms.get(id)) {
      for (let doc of this.termsDocs.get(term.term)) {
        let termWeight = term.tfidf * doc.tfidf;
        if (weights.has(doc.id)) {
          weights.set(doc.id, weights.get(doc.id) + termWeight);
        } else {
          weights.set(doc.id, termWeight);
        }
      }
    }
    weights.delete(id); // The original ID inevitably gets added.
    let sorted = Array.from(weights.entries()).sort((a, b) => b[1] - a[1]);
    for (let doc of sorted) {
      if (result.length === limit) {
        return result;
      } else {
        result.push(doc[0]);
      }
    }
  }
  return result;
};

// These are for debugging.

Similar.prototype.terms = function (id) {
  return this.docsTerms.get(id);
};

Similar.prototype.stats = function () {
  let topTerms = [];
  for (let term of this.termsDocs) {
    topTerms.push([term[0], term[1].length]);
  }
  topTerms.sort((a, b) => b[1] - a[1]);
  return {
    topTerms: topTerms,
  };
};
