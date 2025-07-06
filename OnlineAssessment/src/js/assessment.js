const imoesApp = Vue.createApp({
    data() {
        return {
            apiPrimaryURL: "https://abstractdil.github.io/ssc-questions/QuestionPapers/qp-generator/",
            apiSecondaryURL: "https://abstractdil.github.io/ssc-questions/QuestionPapers/qp-generator/data.json",
            isSidenavVisible: false, 
            appHeader: {
                examName: "CBT - MathHub Online Examination System",
            },
            isLoading: false,
            isFullScreen: false, // Track fullscreen state
            isReattempt: true, // Default to true for re-attempt
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
           submittedAnswers: {},
           showSolution: false,

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
      },
        // Get current section data (like name, range)
      currentSection() {
        return this.exam_module?.sections?.[this.currentSectionKey]||null;
      },

      // Generate question numbers for palette
      currentSectionQuestions() {
        if (!this.currentSection?.ques_no) return [];
      
        const [start, end] = this.currentSection.ques_no.split('-').map(Number);
        const numbers = [];
        for (let i = start; i <= end; i++) numbers.push(i);
        return numbers;
      },

      sectionName() {
        return this.currentSection?.sec_name || '';
      },
      isAnswerSubmitted() {
        return !!this.submittedAnswers[this.currentQuestionIndex];
      },
      currentAnswer() {
        return this.submittedAnswers[this.currentQuestionIndex] || {};
      }
    },
    

    methods: {
      toggleNav() {
        this.isSidenavVisible = !this.isSidenavVisible;
      },
      toggleFullScreen() {
        const elem = document.documentElement;
      
        if (!document.fullscreenElement) {
          elem.requestFullscreen?.();
          elem.webkitRequestFullscreen?.();
          elem.mozRequestFullScreen?.();
          elem.msRequestFullscreen?.();
          this.isFullScreen = true;
        } else {
          document.exitFullscreen?.();
          document.webkitExitFullscreen?.();
          document.mozCancelFullScreen?.();
          document.msExitFullscreen?.();
          this.isFullScreen = false;
        }
      },

      toggleSolution() {
        this.showSolution = !this.showSolution;
      },
      
      

      handleAnswerSubmit(questionIndex, selectedOption) {
        this.showSolution = false; // reset for new question

        const correctAnswer = this.questionList[questionIndex].answer;
    
        // Lock the question
        this.submittedAnswers[questionIndex] = {
          selected: selectedOption,
          correct: parseInt(correctAnswer),
        };
      },

        validateExamIdFormat(examId) {
            const regex = /^[0-9]{10}$/; // 10-digit number
            return regex.test(examId);
        },
        
        // Check if the examId exists in the data.json file
        async fetchAndValidateExamId(examId) {
          try {
              this.isLoading = true; // Show loader while validating
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
                    window.location.href="error.html?errorCode=101"; // Redirect to error page
        
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
            finally{
                this.isLoading = false; // Hide loader after validation
            }
        },

        // Fetch exam module 

        async fetchExamModuleDetails(examId) {
          try {
              this.isLoading = true; // Show loader while fetching module
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

                window.location.href="error.html?errorCode=103"; // Redirect to error page
            }
            finally {
                this.isLoading = false; // Hide loader after fetching module
            }
        },
        
        // fetch exam questions 

        async fetchExamQuestions() {
            try {
              this.isLoading = true;
              const response = await axios.get(this.exam_question_url);
              this.questionList = response.data;
          
              this.setCurrentSectionByIndex(0); // Initialize with first question
            } catch (error) {
              console.error('Error loading questions:', error);
              window.location.href="error.html?errorCode=102"; // Redirect to error page
            }
            finally {
              this.isLoading = false; // Hide loader
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
          
          switchSection(key) {
            this.currentSectionKey = key;
            this.currentSection = this.exam_module.sections[key];
          
            const range = this.currentSection.ques_no.split('-').map(Number);
            this.currentQuestionIndex = range[0] - 1;
          },
          
          goToQuestion(index) {
            this.currentQuestionIndex = index;
          },

          getExamIdFromURL() {
            const urlParams = new URLSearchParams(window.location.search);
            this.examId = urlParams.get('ExamId');
          
            // Default to true if re-attempt param is not present
            const reattempt = urlParams.get('re-attempt');
            //this.isReattempt = reattempt !== 'false';  // default is true

            if (reattempt === 'false') {
              Swal.fire({
                icon: 'warning',
                title: 'Re-attempt Mode is OFF',
                text: 'Do you want to turn ON re-attempt mode?',
                confirmButtonText: 'OK',
                allowOutsideClick: false
              }).then(() => {
                this.isReattempt = true;
                this.updateReattemptInURL(); 
              });
            } else {
              this.isReattempt = true;
              this.updateReattemptInURL(); 
            }
          },
          

          updateReattemptInURL() {
            const url = new URL(window.location.href);
            url.searchParams.set('re-attempt', this.isReattempt ? 'true' : 'false');
            window.history.replaceState({}, '', url);

          },

          preventDefault(e) {
            e.preventDefault();
          },
        
          blockKeys(e) {
            // F12
            if (e.keyCode === 123) {
              console.log('F12 disabled.');
              e.preventDefault();
          }
           // Ctrl+Shift+I
          if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            console.log('Ctrl+Shift+I disabled.');
            e.preventDefault();
          }

          // Ctrl+Shift+C
          if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            console.log('Ctrl+Shift+C disabled.');
            e.preventDefault();
          }

          // Ctrl+Shift+J
          if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            console.log('Ctrl+Shift+J disabled.');
            e.preventDefault();
          }

              // Ctrl+U
        if (e.ctrlKey && e.keyCode === 85) {
          console.log('Ctrl+U disabled.');
          e.preventDefault();
        }

        // Ctrl+Shift+U
        if (e.ctrlKey && e.shiftKey && e.keyCode === 85) {
          console.log('Ctrl+Shift+U disabled.');
          e.preventDefault();
        }

        // Ctrl+P
    if (e.ctrlKey && e.keyCode === 80) {
      console.log('Ctrl+P disabled.');
      e.preventDefault();
    }
  }
          
    },
    mounted() {
      this.getExamIdFromURL();
    
      if (this.validateExamIdFormat(this.examId)) {
        this.fetchAndValidateExamId(this.examId);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Format',
          text: 'The provided Exam ID is not in a valid format.',
          confirmButtonText: 'OK'
        });
        window.location.href="error.html?errorCode=101"; // Redirect to error page
      }

      // Disable cut, copy, paste
  document.body.addEventListener('cut', this.preventDefault);
  document.body.addEventListener('copy', this.preventDefault);
  document.body.addEventListener('paste', this.preventDefault);

  // Disable right-click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    console.log('Right click disabled.');
  });

  // Disable specific key combinations
  document.addEventListener('keydown', this.blockKeys);

  // Optionally disable scroll (mouse wheel)
  document.addEventListener('wheel', this.preventDefault, { passive: true });
    },

    watch: {
      isReattempt(newVal) {
        if (!newVal) {
          Swal.fire({
            icon: 'warning',
            title: 'Re-attempt is turned OFF',
            text: 'You will not be able to answer questions. Do you want to re-enable re-attempt mode?',
            confirmButtonText: 'Yes, Enable',
            allowOutsideClick: false
          }).then(() => {
            this.isReattempt = true;
            this.updateReattemptInURL();
          });
        } else {
          this.updateReattemptInURL();
        }
      }
    },
    
    
    
});

imoesApp.mount('#imoes');
