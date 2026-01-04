export const parseDescription = (description: string | undefined | null) => {
    if (!description || typeof description !== 'string') {
        return [];
    }

    try {
        const parsed = JSON.parse(description);
        if (Array.isArray(parsed)) {
            return parsed;
        } else {
            throw new Error("Parsed description is not an array");
        }
    } catch (error) {
        console.error("Error parsing description:", error);
        return [];
    }
};

export const generateDynamicPrompt = (level: string, content: string) => {
    if (!content.trim()) return '';

    switch (level) {
        case 'simple':
            return `作業手順は「${content}」を行う内容です。
作業手順のマニュアルの素案を簡潔に作成してください。
各手順の内、重要なポイントのみ抜きだしてできるだけ簡潔にまとめて作成してください。`;

        case 'standard':
            return `作業手順は「${content}」についてです。

作業手順のマニュアルの素案をわかりやすく作成してください。
作業を行うための準備・注意点などもあれば追記してください。`;

        case 'detailed':
            return `作業手順は「${content}」についてです。
作業手順のマニュアルの素案をより詳細かつわかりやすく作成してください。
手順でより詳細な工程が必要であれば追記してください。その際に、それはなぜ必要なのか理由も記載してください。
作業を行うための準備・注意点などもあれば追記してください。
それぞれの作業手順は具体的なユースケースを想像して、それらを詳細化していくことで作成してください。`;
        default:
            return `作業手順は「${content}」についてです。
作業手順のマニュアルの素案をより詳細かつわかりやすく作成してください。
手順でより詳細な工程が必要であれば追記してください。その際に、それはなぜ必要なのか理由も記載してください。
作業を行うための準備・注意点などもあれば追記してください。
それぞれの作業手順は具体的なユースケースを想像して、それらを詳細化していくことで作成してください。`;
    }
};
