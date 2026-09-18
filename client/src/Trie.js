class TrieNode {
    constructor() {
        this.children = {}
        this.isEndOfWord = false
    }
}

class Trie {
    constructor() {
        this.root = new TrieNode()
    }

    insert(word) {
        let node = this.root
        const lowerWord = word.toLowerCase()
        for (const char of lowerWord) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode()
            }
            node = node.children[char]
        }
        node.isEndOfWord = true
        node.originalWord = word
    }

    collectWords(node, results) {
        if (node.isEndOfWord) {
            results.push(node.originalWord)
        }
        for (const char in node.children) {
            this.collectWords(node.children[char], results)
        }
    }

    getWordsWithPrefix(prefix, limit = 6) {
        let node = this.root
        const lowerPrefix = prefix.toLowerCase()

        for (const char of lowerPrefix) {
            if (!node.children[char]) {
                return []
            }
            node = node.children[char]
        }

        const results = []
        this.collectWords(node, results)
        return results.slice(0, limit)
    }
}

export default Trie