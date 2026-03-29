const fs = require("fs");

const inputFile = "db/2603291957.html";
const outputFile = "db/2603291957.json";

try {
    const html = fs.readFileSync(inputFile, "utf8");

    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) throw new Error("No <body> content found");

    const raw = bodyMatch[1];

    // 🔥 Extract all question blocks manually
    const questionBlocks = raw.match(/\{[^{}]*"qid":"\d+"[^{}]*\}/g);

    if (!questionBlocks) throw new Error("No questions found");

    const questions = [];

    questionBlocks.forEach(block => {
        try {
            const qid = (block.match(/"qid":"(.*?)"/) || [])[1];

            const question = (block.match(/"question_en":"([\s\S]*?)","comprehensive_en"/) || [])[1];

            const options = [];
            for (let i = 1; i <= 4; i++) {
                const opt = (block.match(new RegExp(`"option_en_${i}":"([\\s\\S]*?)"`)) || [])[1];
                if (opt) options.push(opt);
            }

            if (qid && question) {
                questions.push({
                    qid,
                    question,
                    options
                });
            }

        } catch (e) {
            console.log("Skipped malformed question");
        }
    });

    // Final clean structure
    const finalJSON = {
        state: 200,
        msg: "success",
        questions: questions
    };

    fs.writeFileSync(outputFile, JSON.stringify(finalJSON, null, 2));

    console.log(`✅ Extracted ${questions.length} questions`);
    console.log("✅ Saved to:", outputFile);

} catch (err) {
    console.error("❌ Error:", err.message);
}