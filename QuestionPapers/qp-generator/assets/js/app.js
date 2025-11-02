// --- Utility Functions (Keep outside Vue for cleanliness) ---

/**
 * Creates a unique watermark style for a given ID.
 * @param {string} id - The unique ID for the watermark text.
 * @returns {string} - The CSS background-image URL.
 */
const createWatermarkStyle = (id) => {
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
              font-size="24" fill="rgba(64, 64, 64, 0.5)" transform="rotate(-45 100 100)">
          ${id}
        </text>
    </svg>`;
    const encoded = encodeURIComponent(svg.trim());
    return `url("data:image/svg+xml,${encoded}")`;
};

/**
 * Gets the ExamID from the URL query parameters.
 * @returns {string | null}
 */
const getExamIdFromUrl = () => {
    const url = new URL(window.location.href);
    const examID = url.searchParams.get("ExamID");
    return examID && examID.length === 10 && !isNaN(examID) ? examID : null;
};

// --- Vue Components ---

const HeaderComponent = {
    props: ['title', 'isError'],
    template: `
        <div class="container hidden-print">
            <h3 class="text-center" :style="{ marginBottom: '30px' }">{{ title || 'Loading...' }}</h3>
            <div v-if="!isError">
                <button class="btn btn-default btn-sm theme-toggle" @click="$emit('toggleTheme')"> 
                    <i class="glyphicon glyphicon-adjust"></i> Change Theme
                </button>
                <button class="btn btn-warning btn-sm print-button" @click="$emit('generatePdf')">
                    <span class="glyphicon glyphicon-print"></span> Print
                </button>
                <button class="btn btn-success btn-sm print-button" @click="$emit('downloadPdf')">
                    <span class="glyphicon glyphicon-download"></span> Download PDF
                </button>
                <button class="btn btn-primary btn-sm print-button" @click="$emit('reattempt')">
                    Reattempt Test
                </button>
            </div>
        </div>
    `,
};

const QuestionItem = {
    props: ['question', 'index', 'examId'],
    setup(props) {
        const correctOption = parseInt(props.question.answer);
        const watermarkBG = createWatermarkStyle(props.examId);
        
        // Helper to check if an option is the correct one
        const isCorrect = (optionNumber) => correctOption === optionNumber;

        return { correctOption, watermarkBG, isCorrect };
    },
    template: `
        <div class="watermark-container question-pnl">
            <div class="watermark-layer" :style="{ backgroundImage: watermarkBG }"></div>
            <table class="qpnltbl">
                <tbody>
                    <tr>
                        <td class="rw">
                            <table class="qrtbl">
                                <tbody>
                                    <tr>
                                        <td width="7%" class="bold" valign="top">Q. {{ index + 1 }}</td>
                                        <td class="bold" valign="top" style="text-align: left;">
                                            <div v-html="question.question"></div>
                                            <div v-for="n in 4" :key="n" class="option">
                                                <div style="margin-right:10px;display:flex;align-items:center;"
                                                     :class="isCorrect(n) ? 'rightAns' : 'wrngAns'">
                                                    <p><span style="margin-right:3px;">{{ String.fromCharCode(96 + n) }})</span> 
                                                        <span v-html="question['option_' + n]"></span>
                                                    </p>
                                                </div>
                                                <img :src="isCorrect(n) ? '../../assets/img/tick.png' : '../../assets/img/cross.png'">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><b>Explanation:</b></td>
                                        <td style="padding-left:20px;">
                                            <div class="solution" v-html="question.solution_text"></div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    mounted() {
        // Post-render step: Apply img-thumbnail class and typeset MathJax
        this.$el.querySelectorAll('.solution img').forEach(img => {
            img.classList.add('img-thumbnail');
        });
        if (window.MathJax) {
            window.MathJax.typesetPromise([this.$el]).catch((err) => console.log('MathJax error:', err));
        }
    },
};

const MainContent = {
    components: { 'question-item': QuestionItem },
    props: ['questions', 'examId', 'isError', 'errorMessage'],
    template: `
        <div class="container">
            <div id="content">
                <div id="question-container" v-if="!isError">
                    <question-item 
                        v-for="(q, index) in questions" 
                        :key="index" 
                        :question="q" 
                        :index="index" 
                        :exam-id="examId">
                    </question-item>
                </div>
            </div>
            <div id="ErrorMsg" v-if="isError">
                <center><h1>Error 404: Page Not Found<br></h1>
                <p>{{ errorMessage }}<br><br>
                You may contact the administrator at <a href="mailto:nandysagar@yahoo.com">nandysagar@yahoo.com </a><br><br>
                <a href="https://nandysagar.in">Go to NANDYSAGAR.IN</a></p></center>
            </div>
        </div>
    `,
};


// --- Vue App Setup ---

const { createApp, ref, onMounted, computed, nextTick } = Vue;

const app = createApp({
    components: {
        'header-component': HeaderComponent,
        'main-content': MainContent,
    },
    setup() {
        const examID = getExamIdFromUrl();
        const questions = ref([]);
        const examTitle = ref('Questions and Solutions');
        const isLoading = ref(true);
        const isError = ref(false);
        const errorMessage = ref('');
        const currentTheme = ref('dark'); // 'dark' or 'light'

        // Theme management
        const applyTheme = (theme) => {
            document.body.classList.remove('light-theme', 'dark-theme');
            document.body.classList.add(`${theme}-theme`);
        };

        const toggleTheme = () => {
            currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark';
            applyTheme(currentTheme.value);
        };
        
        // PDF/Print/Reattempt functions
        const generatePDF = () => {
            const originalTitle = document.title;
            const newTitle = originalTitle.replace(/,/g, '-').replace(/\s+/g, '-');
            document.title = newTitle;

            setTimeout(() => {
                window.print();
                document.title = originalTitle;
            }, 100);
        };

        const downloadPDF = () => {
            const originalTitle = document.title;
            const newTitle = originalTitle.replace(/,/g, '-').replace(/\s+/g, '-');
            const pdfUrl = `pdf/${newTitle}.pdf`;
            window.open(pdfUrl, '_blank');
        };

        const reAttempt = () => {
            const assessmentUrl = `../../OnlineAssessment/index.html?ExamId=${examID}`;
            window.open(assessmentUrl, '_blank');
        };

        // Data Fetching Logic
        onMounted(async () => {
            applyTheme(currentTheme.value); // Set initial theme

            if (!examID) {
                isError.value = true;
                errorMessage.value = 'You have entered a wrong URL. Or, the page you are looking for is not available.';
                isLoading.value = false;
                return;
            }

            try {
                // 1. Fetch exam metadata
                const examDataResponse = await fetch("data.json");
                if (!examDataResponse.ok) throw new Error("Failed to fetch exam metadata (data.json)");
                const exam_data = await examDataResponse.json();

                const exam_info = exam_data.find(el => el.exam_id === examID);
                if (!exam_info) {
                    isError.value = true;
                    errorMessage.value = 'You have entered a wrong URL. Or, the page you are looking for is not available.';
                    isLoading.value = false;
                    return;
                }

                examTitle.value = exam_info.exam_name;
                document.title = exam_info.exam_name;

                // 2. Fetch questions
                const questionsResponse = await fetch(exam_info.exam_db);
                if (!questionsResponse.ok) throw new Error("Failed to fetch exam questions");
                
                questions.value = await questionsResponse.json();

            } catch (error) {
                console.error('Application Error:', error);
                isError.value = true;
                errorMessage.value = 'An error occurred while loading exam data. Please try again.';
            } finally {
                isLoading.value = false;
            }
        });

        return {
            examID,
            questions,
            examTitle,
            isLoading,
            isError,
            errorMessage,
            toggleTheme,
            generatePDF,
            downloadPDF,
            reAttempt,
        };
    }
});

app.mount('#app');