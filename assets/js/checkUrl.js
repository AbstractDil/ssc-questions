
// Add OrgID and PoweredBy in the url automatically

if(window.location.href.indexOf('?') == -1) {

    var url = window.location.href;
    var newUrl = url + '?OrgID=MHBC&PoweredBy=nandysagar.in';
    window.history.pushState('data', 'Title', newUrl);
    console.log(newUrl);
    }
    
    
    // if url is not get any parameter then it will redirect to home page
    
    
    
    if(window.location.href.indexOf('?') == -1) {
        window.location.href = 'index.html';
    }
    
    //get the parameter from url
    
    var url = new URL(window.location.href);
    var isOrg = url.searchParams.get("OrgID");
    
    // get parameter from url after & symbol
    
    var isPoweredBy = url.searchParams.get("PoweredBy");
    
    
    
    //if parameter is not equal to the value then it will redirect to home page
    
    if(isOrg != 'MHBC' || isPoweredBy != 'nandysagar.in') {
        
        alert('You have entered wrong url.');
        
        // show alert using html page 

        document.getElementById('title').style.display = 'none';
        document.getElementById('content').style.display = 'none';
        document.getElementById('ErrorMsg').innerHTML = '<center><h1>Error 404: Page Not Found<br></h1><p>You have entered a wrong URL. Or, the page you are looking for is not available.<br><br>You may contact the administrator at <a href="mailto:nandysagar@yahoo.com">nandysagar@yahoo.com </a><br><br><a href="https://nandysagar.in">Go to NANDYSAGAR.IN</a></p> </center>';
       

        // document.write('<center><h1>Error 404: Page Not Found<br></h1><p>You have entered a wrong URL. Or, the page you are looking for is not available.<br><br>You may contact the administrator at <a href="mailto:nandysagar@yahoo.com">nandysagar@yahoo.com </a><br><br><a href="https://nandysagar.in">Go to NANDYSAGAR.IN</a></p> </center>');


       
    
    }


   