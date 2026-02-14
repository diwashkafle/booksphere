/**
 * Simple TF/IDF Implementation for Book Similarity
 * TF (Term Frequency): How often a word aparece in a document.
 * IDF (Inverse Document Frequency): How unique a word is across all documents.
 */

export class TFIDF {
    private documents: string[] = [];
    private termFrequencies: Map<string, number>[] = [];
    private documentFrequency: Map<string, number> = new Map();
    private totalDocuments: number = 0;

    constructor(docs: string[]) {
        this.documents = docs;
        this.totalDocuments = docs.length;
        this.calculate();
    }

    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/)
            .filter((word) => word.length > 2); // Filter out short words
    }

    private calculate() {
        this.documents.forEach((doc) => {
            const tokens = this.tokenize(doc);
            const tfMap = new Map<string, number>();
            const uniqueTokens = new Set(tokens);

            tokens.forEach((token) => {
                tfMap.set(token, (tfMap.get(token) || 0) + 1);
            });

            this.termFrequencies.push(tfMap);

            uniqueTokens.forEach((token) => {
                this.documentFrequency.set(token, (this.documentFrequency.get(token) || 0) + 1);
            });
        });
    }

    private getTfIdf(docIndex: number, term: string): number {
        const tf = this.termFrequencies[docIndex].get(term) || 0;
        const df = this.documentFrequency.get(term) || 0;
        const idf = Math.log(this.totalDocuments / (1 + df));
        return tf * idf;
    }

    public getSimilarDocuments(query: string, topN: number = 5): number[] {
        const queryTokens = this.tokenize(query);
        const scores = this.documents.map((_, docIndex) => {
            let score = 0;
            queryTokens.forEach((token) => {
                score += this.getTfIdf(docIndex, token);
            });
            return score;
        });

        // Return indices of documents sorted by score
        return scores
            .map((score, index) => ({ score, index }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topN)
            .filter((item) => item.score > 0)
            .map((item) => item.index);
    }
}
