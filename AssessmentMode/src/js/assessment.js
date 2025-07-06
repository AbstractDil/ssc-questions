const imoesApp = Vue.createApp({
    data() {
        return {
            apiPrimaryURL: "https://abstractdil.github.io/ssc-questions/QuestionPapers/qp-generator/",
            apiSecondaryURL: "https://abstractdil.github.io/ssc-questions/QuestionPapers/qp-generator/data.json",
            appHeader: {
                examName: "CBT - MathHub Online Examination System",
            },
            exam_module: null,
            exam_question_url: null,
            examId: null,
            examValid: false,
            validationMessage: "",
            currentQuestionIndex: 0, // 0-based index
            questionList: [],        // Loaded from exam_question_url
            currentSectionKey: '',   // 'sec_1', 'sec_2', etc.
            currentSection: null,     // Full section object
            // Derived question data
            currentQuestion: null,
           // Optional for radio/checkbox response
          
           userAnswers: [],
        }
    },

    
    computed: {
      currentQuestionData() {
        return this.questionList[this.currentQuestionIndex] || null;
      },
      currentOptions() {
        if (!this.currentQuestionData) return [];
        const options = [];
        for (let i = 1; i <= 10; i++) {
          const key = `option_${i}`;
          if (this.currentQuestionData[key]?.trim()) {
            options.push({ index: i, content: this.currentQuestionData[key] });
          }
        }
        return options;
      },
      selectedOption: {
        get() {
          return this.userAnswers[this.currentQuestionIndex] ?? null;
        },
        set(val) {
          this.userAnswers.splice(this.currentQuestionIndex, 1, val);
        }
      }
    },
    

    methods: {
        validateExamIdFormat(examId) {
            const regex = /^[0-9]{10}$/; // 10-digit number
            return regex.test(examId);
        },
        
        // Check if the examId exists in the data.json file
        async fetchAndValidateExamId(examId) {
            try {
                const response = await axios.get(this.apiSecondaryURL);
                const data = response.data;
        
                // Check if examId exists in the array
                const exam = data.find(item => item.exam_id === examId);
        
                if (exam) {
                    this.examValid = true;
                    this.exam_question_url = `${this.apiPrimaryURL}${exam.exam_db}`;
                    console.log("Exam Question URL:", this.exam_question_url);
                    this.validationMessage = "Valid Exam ID";
                    this.appHeader.examName = exam.exam_name || "CBT - MathHub Online Examination System";

                    // Set the page title
                    document.title = `${this.appHeader.examName} - Powered By MathHub Online Examination System`;
        
                     /*
                    Swal.fire({
                        icon: 'success',
                        title: 'Exam ID Validated',
                        html: `<strong>${exam.exam_name}</strong><br>Date: ${exam.exam_date}`,
                        confirmButtonText: 'Start Test'
                    });
                    */

                     //  Fetch exam module first
                    await this.fetchExamModuleDetails(examId);

                    //  Then fetch questions
                    this.fetchExamQuestions();
        
                } else {
                    this.examValid = false;
                    this.validationMessage = "Invalid Exam ID";
        
                    Swal.fire({
                        icon: 'error',
                        title: 'Invalid Exam ID',
                        text: `Exam ID ${examId} was not found.`,
                        confirmButtonText: 'Try Again'
                    });
                }
        
            } catch (error) {
                console.error("Axios error:", error);
                this.validationMessage = "Error validating Exam ID";
        
                Swal.fire({
                    icon: 'error',
                    title: 'Request Failed',
                    text: 'Unable to fetch exam data. Please check your internet connection or try again later.',
                    confirmButtonText: 'OK'
                });
            }
        },

        // Fetch exam module 

        async fetchExamModuleDetails(examId) {
            try {
                const response = await axios.get('src/module.json');
                const moduleData = response.data;
        
                const moduleEntry = moduleData.find(item => item.exam_id === examId);
        
                if (moduleEntry) {
                    const settingsPath = `src/${moduleEntry.exam_settings}`;
        
                    const settingsResponse = await axios.get(settingsPath);
                    const examModuleJson = settingsResponse.data;
        
                    this.exam_module = examModuleJson[0].exam_settings;
        
                    console.log("Exam Module Loaded:", this.exam_module);
        
                    // Optional: You can show a SweetAlert or update the UI here
                    /*
                    Swal.fire({
                        icon: 'info',
                        title: 'Module Loaded',
                        html: `
                            Total Questions: ${this.exam_module.total_questions}<br>
                            ${Object.values(this.exam_module.sections).map(
                                sec => `${sec.sec_name}: ${sec.sec_total_questions}`
                            ).join('<br>')}
                        `,
                        confirmButtonText: 'Continue'
                    });
                    */
        
                } else {
                    console.warn("No module settings found for this Exam ID");
        
                    Swal.fire({
                        icon: 'warning',
                        title: 'No Module Data',
                        text: `No exam module settings found for Exam ID ${examId}`,
                        confirmButtonText: 'OK'
                    });
                }
        
            } catch (error) {
                console.error("Error loading exam module details:", error);
        
                Swal.fire({
                    icon: 'error',
                    title: 'Module Load Failed',
                    text: 'Could not load module settings. Please check your files.',
                    confirmButtonText: 'OK'
                });
            }
        },
        
        // fetch exam questions 

        async fetchExamQuestions() {
            try {
              const response = await axios.get(this.exam_question_url);
              this.questionList = response.data;
          
              this.setCurrentSectionByIndex(0); // Initialize with first question
            } catch (error) {
              console.error('Error loading questions:', error);
            }
          },

          
          setCurrentSectionByIndex(index) {
            this.currentQuestionIndex = index;
          
            for (const [key, section] of Object.entries(this.exam_module.sections)) {
              const [start, end] = section.ques_no.split('-').map(Number);
              if (index + 1 >= start && index + 1 <= end) {
                this.currentSectionKey = key;
                this.currentSection = section;
          
                // Update active tab
                this.setActiveSectionTab(key);
                break;
              }
            }
          },
          
          setActiveSectionTab(sectionKey) {
            const tabs = document.querySelectorAll('#sections-list li');
            tabs.forEach(li => li.classList.remove('active'));
          
            const currentTab = document.querySelector(`[data-section-id="${sectionKey}"]`);
            if (currentTab && currentTab.parentElement) {
              currentTab.parentElement.classList.add('active');
            }
          },

          goToNextQuestion() {
            if (this.currentQuestionIndex < this.questionList.length - 1) {
              this.currentQuestionIndex++;
              this.setCurrentSectionByIndex(this.currentQuestionIndex);
            }
          },
          
          goToPreviousQuestion() {
            if (this.currentQuestionIndex > 0) {
              this.currentQuestionIndex--;
              this.setCurrentSectionByIndex(this.currentQuestionIndex);
            }
          },
          
          

        getExamIdFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('ExamId');
        }
    },
    mounted() {
        const examId = this.getExamIdFromURL();
        this.examId = examId;
    
        if (this.validateExamIdFormat(examId)) {
            this.fetchAndValidateExamId(examId);
        } else {
            this.examValid = false;
            this.validationMessage = "Invalid Exam ID format";
    
            Swal.fire({
                icon: 'warning',
                title: 'Invalid Format',
                text: 'The provided Exam ID is not in a valid format.',
                confirmButtonText: 'OK'
            });
        }
    }
    
});

imoesApp.mount('#imoes');
