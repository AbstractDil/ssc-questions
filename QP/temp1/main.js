// ===== GET examId FROM URL =====
function getExamId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("examId");
}

// ===== LOAD CONFIG =====
async function loadExam() {
    const examId = getExamId();
    if (!examId) {
        alert("No examId found in URL");
        return;
    }

    const res = await fetch("data.json");
    const exams = await res.json();

    const exam = exams.find(e => e.exam_id === examId);

    if (!exam) {
        alert("Exam not found");
        return;
    }

    document.getElementById("exam-name").innerText = exam.exam_name;
    document.getElementById("exam-date").innerText = exam.exam_date;

    loadDB(exam.exam_db_file);
}

// ===== LOAD DB FILE =====
async function loadDB(file) {
    const res = await fetch(file.replace(".html", ".json"));
    const data = await res.json();

    renderQuestions(data.questions);
}

// ===== CLEAN HTML =====
function cleanHTML(html) {
    if (!html) return "";

    return html
        .replace(/<\/?span[^>]*>/g, "")
        .replace(/class="[^"]*"/g, "")
        .replace(/\\\(/g, "\\(")   // keep MathJax
        .replace(/\\\)/g, "\\)")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/<\/?p[^>]*>/g, "")
        .trim();
}

// ===== RENDER QUESTIONS =====
function renderQuestions(questions) {
    const container = document.getElementById("questions-container");

    questions.forEach((q, index) => {
        const div = document.createElement("div");
        div.className = "question";

        let optionsHTML = "";

        q.options.forEach((opt, i) => {
            optionsHTML += `
                <div class="option">
                    (${String.fromCharCode(65 + i)}) ${cleanHTML(opt)}
                </div>
            `;
        });

        div.innerHTML = `
            <p><strong>Q${index + 1}.</strong> ${cleanHTML(q.question)}</p>
            ${optionsHTML}
        `;

        container.appendChild(div);
    });

    MathJax.typeset();
}

// INIT
loadExam();