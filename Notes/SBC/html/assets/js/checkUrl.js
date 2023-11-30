
// Add OrgID and PoweredBy in the url automatically

if(window.location.href.indexOf('?') == -1) {

    var url = window.location.href;
    var newUrl = url + '?OrgID=SBC&PoweredBy=nandysagar.in';
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
    
    if(isOrg != 'SBC' || isPoweredBy != 'nandysagar.in') {
        window.location.href = 'error_url.html';
    }
    
    
    
    