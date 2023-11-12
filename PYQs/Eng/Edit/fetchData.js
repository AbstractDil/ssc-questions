/*
* @Author: Sagar Nandy
* 1) This is a test file only used for development purpose. Don't use this file in production.
* 2) Production file is include in mock-test-analysis.html page.
*
*/

// get exam_id, exam_name, exam_date, exam_analysis_directory, total_questions from data.json file and store in an array

$.getJSON("data.json", function(data) {
    var exam_data = [];
    $.each(data, function(key, value) {
        exam_data.push(value);
    });
    console.log(exam_data);


    // get ExamID parameter value from url


    var url = new URL(window.location.href);

    var examID = url.searchParams.get("ExamID");

    console.log(examID);

/*
    var url = window.location.href;
     var examID = url.split('?')[1].split('&')[0].split('=')[1];
     console.log(examID);
*/

    // first check examID is exist in data.json file or not

    

    var examID_exist = exam_data.some(function(el) {
        return el.exam_id === examID;
    });
    console.log(examID_exist);

    if(examID_exist == false) {
        alert('You have entered wrong url.');
        window.location.href = 'mock-test-analysis.html';
    }



    // get exam_name, exam_date, exam_analysis_directory, total_questions from exam_data array and store in variable using examID

    var exam_name = exam_data[examID].exam_name;
    var exam_date = exam_data[examID].exam_date;
    var exam_analysis_directory = exam_data[examID].exam_analysis_directory;
    var total_questions = exam_data[examID].total_questions;
    console.log(exam_name);
    console.log(exam_date);
    console.log(exam_analysis_directory);
    console.log(total_questions);



     
  
}
);
