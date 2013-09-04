  //USER SET VARIABLES    
  
  //The page of the site you wish to add all the site links to
  //Prerequisites: The Site and Page specified in the user supplied URL exist, and the user of this script has ownership rights to both.
  //PLEASE NOTE: The content of the page will be replaced  
  var navigationURLPage = 'https://sites.google.com/a/myport.ac.uk/templategs/navigation';  
  
  //The site you wish all created sites to look like.
  //Prerequisites: The Site exists and the user of this script has ownership rights to the template site.
  var templateSite = SitesApp.getSiteByUrl('https://sites.google.com/site/creatortemplate/');
  
  //The spreadsheet url that contains the student data.
  //Prerequisites: The user of the script has access rights to the spreadsheet URL supplied.
  //Prerequisites: The spreadsheet is correctly formatted in the order of student id, student email and student name.
  //Prerequisites: Google Sites in the hostDomain with the student id's the user has supplied, do not already exist,
  //                 if they do then an 'Site already exists' error will be presented
  var spreadsheetURL = 'https://docs.google.com/spreadsheet/ccc?key=0At7f4r9qO9K1dE13cENZQk82bmd4WTdRRDM0bXFPMmc#gid=0';
  
  //Name of the sheet in the spreadsheet you wish to use for student data.
  //Prerequisites: The user have access rights to the spreadsheet and sheet
  var sheetName = 'Sheet1';  

  //The domain in which you wish to create the sites in intially, this will later be used in the migration
  //Prerequisites: When creating the student sites, the user of the script must be a member of this hostDomain and have the right to create sites.
  //Prerequisites: When migrating the student sites, the user of the script must be a member of the finalDomain and have the right to create sites.
  var hostDomain = 'myport.ac.uk';
  
  //The domain you wish to migrate the sites to, from the hostDomain
  //Prerequisites: When migrating the student sites, the user must be a member of the finalDomain
  var finalDomain = 'port.ac.uk';
  
  //The email address you wish all sites to be owned by in addition to the account you have used to run this script.
  //This should ideally be a email address in the finalDomain
  //Prerequisites: This must be an email account you have the password for, and must be a valid email address.
  //Prerequisites: This must be a different email address to the user of the scripts current login.
  var owner = 'adam.hansrod@port.ac.uk';
  
  //The title of the sites you wish to create
  //Please note after a migration the title of the created sites will change to the student id
  //Prerequisites: It cannot contain any characters such as ' or /
  var title = 'School Of Engineering Final Year Project Site';
  
  //The summary of the sites you wish to create, this does not have to be set and if you choose to leave it blank please leave it as '', 
  //otherwise enter your summary within the ''
  //Please note after the migration they will all be set to 'School Of Engineering Final Year Project Site'
  //Prerequisites: It cannot contain any characters such as ' or /
  var summary = '';
  
  //The list of supervisors emails you wish to be able to view the migrated sites
  //Please note: these emails will also be used to notify the supervisors of all student sites created from supplied student data
  //If you choose to enter multiple email addresses please put them in same format as this example:
  //var supervisors = ['cam01144@myport.ac.uk','A@a.com']
  //Prerequisites: These must be valid email addresses in the correct format
  var supervisors = ['cam01144@myport.ac.uk']
  
  //Populating the arrays of student info, please don't touch.
  var spreadsheet = SpreadsheetApp.openByUrl(spreadsheetURL);
  var sheet = spreadsheet.getSheetByName(sheetName); 
  //Here we do some basic validation, e.g. number of columns is correct and there aren't empty fields in those columns
  if (sheet.getLastColumn() == 3){
    var rows = sheet.getDataRange();
    var numRows = rows.getNumRows();
    var studentsInfo = rows.getValues();//now we have all our cells in an array called studentsInfo
    for (var i=0;i<studentsInfo.length;i++){
      var idEmptyBool = ! studentsInfo[i][0] !="" && studentsInfo[i][0] !== null && studentsInfo[i][0] !== false;    //These four booleans are to do with whether
      var emailEmptyBool = ! studentsInfo[i][1] !="" && studentsInfo[i][1] !== null && studentsInfo[i][1] !== false; //there are any empty cells on rows with data
      var nameEmptyBool = ! studentsInfo[i][2] !="" && studentsInfo[i][2] !== null && studentsInfo[i][2] !== false;
      var hasValuesBool = ! ( idEmptyBool || emailEmptyBool || nameEmptyBool );
      if (hasValuesBool) {
             var studentsID = new Array();
             var studentsEmail = new Array();
             var studentNames = new Array();
             for (var j = 0; j <= studentsInfo.length - 1; j++) {
               var row = studentsInfo[j];
               studentsID.push(row[0]);
               studentsEmail.push(row[1]);
               studentNames.push(row[2]);
             }
             Logger.log('Retrieved student '+ studentsInfo[i][0] +' from spreadsheet');
      }else{
        Logger.log('Row ' + (i + 1) + ' contains empty cells');
      }
    }
  }else{
  Logger.log("You don't have 3 columns in your spreadsheet")
 }

function createSites(){
 if(title !="" && title !== null && title !== false){//Is title empty?
     if (finalDomain !="" && finalDomain !== null && finalDomain !== false){//Is finalDomain empty? 
        if (Session.getUser().getUserLoginId() != owner){//Is the owner variable the same email as the account running this script?
          for (var i=0;i<studentsID.length;i++){ 
            var site = SitesApp.copySite(hostDomain, studentsID[i], title, summary, templateSite);
            if(site !="" && site !== null && site !== false){//Was the site created correctly?
              site.addOwner(owner);
              site.addEditor(studentsEmail[i]);
              Logger.log('Created site for student: ' + studentsID[i]);
            }else{
              Logger.log('Something went wrong when creating the site for student id: '+studentsID[i]+'. Please check the data in the spreadsheet to see if it\'s correct.'
                         +' You may have to manually create this site.');
            }
          }
        }else{
          Logger.log('The variable owner is the same email address as the email account you\'re running this script with. '
                     +'The owner variable should be set to the email address in the finalDomain. This account will automatically get owner status');
        }
    }else{
      Logger.log('The variable finalDomain is empty');
    }
  }else{
    Logger.log('The variable title is empty');
  }
}

function emailStudents(){
  if( hostDomain !="" && hostDomain !== null && title !== hostDomain){ //Is hostDomain empty? 
    for (var i=0;i<studentsID.length;i++){ 
      GmailApp.sendEmail(studentsEmail[i],'You\'ve been granted access to your final year project site','It is located at: https://sites.google.com/a/'+hostDomain+'/' +  studentsID[i] + '/');
      Logger.log('Sent email to ' + studentsID[i]);
    }
  }else{
    Logger.log('The variable hostDomain is empty');
  }
}

function migrateSites(){
  if( hostDomain !="" && hostDomain !== null && hostDomain !== false){//Is hostDomain empty? 
     if ( finalDomain !="" && finalDomain !== null && finalDomain !== false){//Is finalDomain empty? 
       if(hostDomain!=finalDomain){ //Are they the same domain?
         for (var i=0;i<studentsID.length;i++){ 
           var site = SitesApp.getSite(hostDomain, studentsID[i]);
           if ( site !="" && site !== null && site !== false){//Did we find the site?
             var site = SitesApp.copySite(finalDomain, studentsID[i], studentsID[i], 'School of Engineering Final Year Project Site', site);
             if(site !="" && site !== null && site !== false){//Was the site created correctly?
              Logger.log('Migrated '+ studentsID[i]+ ' site from ' + hostDomain + ' to ' + finalDomain + ' \n Please note: it will take a few minutes for the site to be fully migrated');
             }else{
              Logger.log('Something went wrong when migrating the site for student id: '+studentsID[i]+'. Please check the data in the spreadsheet to see if it\'s correct, '+
                         'as well as the final/host domain variables. You may have to manually create this site.');
             }
           }else{
             Logger.log('Couldn\'t find the site for student ' + studentsID[i] + ' to migrate it, are you sure it\'s the right hostDomain? '+
                        'You may have to move this site manually if the site id is different to the student id');
           }
         }         
        }else{
          Logger.log('Stopped migrating due it being the same domain');
        }
      }else{
      Logger.log('The variable finalDomain is empty');
    }
  }else{
    Logger.log('The variable hostDomain is empty');
  }
}

function removeStudentEditors(){
  if(hostDomain !="" && hostDomain !== null && hostDomain !== false){//Is hostDomain empty? 
     for (var i=0;i<studentsID.length;i++){ 
       var site = SitesApp.getSite(hostDomain, studentsID[i]);       
       if ( site !="" && site !== null && site !== false){//Did we find the site?
         site.removeEditor(studentsEmail[i]); //If this line throws an error, then it's mostly likely they don't have edit rights already.
         Logger.log('Removed edit rights for ' + studentsEmail[i]);
       }else{
         Logger.log('Couldn\'t find the site to remove the student\'s rights to edit, are you sure it\'s the right hostDomain?');
       }
     }
    }else{
     Logger.log('The variable hostDomain is empty');
  }
}

function attachSupervisors(){
 if(finalDomain !="" && finalDomain !== null && finalDomain !== false){//Is finalDomain empty? 
   for (var i=0;i<studentsID.length;i++){
     var site = SitesApp.getSite(finalDomain, studentsID[i]);  
     if (site !="" && site !== null && site !== false){//Did we find the site?
       for (var j=0;j<supervisors.length;j++){ 
        site.addViewer(supervisors[j]);  //If this line throws an error, then it's mostly likely they already have the right to view.
        Logger.log('Added supervisors view rights for site: ' + studentsID[i]);
       }
     }else{
        Logger.log('Couldn\'t find the site to add the supervisors to, are you sure it\'s the right finalDomain?');
     }
   }
 }else{
     Logger.log('The variable finalDomain is empty');
 }
}

function emailSupervisors(){
  if(finalDomain !="" && finalDomain !== null && finalDomain !== false){
    for (var i=0;i<supervisors.length;i++){ 
      var content = '';
      for (var j=0;j<studentsID.length;j++){
        content += 'https://sites.google.com/a/' + finalDomain+ '/' +  studentsID[j] + '/\n\r';
      }
      GmailApp.sendEmail(supervisors[i],'You\'ve been granted access to your students final year project sites', 'They are located at:\n\r' + content);
      //If the above line throws an error, then it might be a problem with the email addresses you've specified for supervisors, or a problem with the email service itself.
      Logger.log('Sent supervisor ' + supervisors[i] + ' an email ');
    }
 }else{
     Logger.log('The variable finalDomain is empty');
 }
}

function addStudentNameLinksToMainSiteNavigationPage(){
  if(hostDomain !="" && hostDomain !== null && hostDomain !== false){
    var page = SitesApp.getPageByUrl(navigationURLPage);
    if (page !="" && page !== null && page !== false){    //Did we find the page?
      var currentContent = page.getHtmlContent();
      var linksToAdd = '';
      for (var i=0;i<studentsID.length;i++){
          linksToAdd += '<a href=\'https://sites.google.com/a/'+hostDomain+'/' +  studentsID[i] + '/\'>' + studentNames[i] + '</a><br>';
      }
      var newContent = '<html> <body>' + '\n\r ' + linksToAdd + '</body> </html>';
      page.setHtmlContent(newContent);
      Logger.log('Added the list of student name links to the navigation page at ' + navigationURLPage);
    }else{
      Logger.log('Couldn\'t find page to add links too');
    } 
  }else{
     Logger.log('The variable hostDomain is empty');
 }
}

function addStudentSiteTitleLinksToMainSiteNavigationPage(){
  if(finalDomain !="" && finalDomain !== null && finalDomain !== false){
    var page = SitesApp.getPageByUrl(navigationURLPage);
    if (page !="" && page !== null && page !== false){    //Did we find the page?
      var currentContent = page.getHtmlContent();
      var linksToAdd = '';
      for (var i=0;i<studentsID.length;i++){
        var site = SitesApp.getSite(finalDomain, studentsID[i])
        var title = site.getTitle()        
        linksToAdd += '<a href=\'https://sites.google.com/a/'+finalDomain+'/' +  studentsID[i] + '/\'>' + title + '</a><br>';
      }
      var newContent = '<html> <body>' + '\n\r ' + linksToAdd + '</body> </html>';
      page.setHtmlContent(newContent);
      Logger.log('Added the list of student site title links to the navigation page at ' + navigationURLPage);
    }else{
      Logger.log('Couldn\'t find page to add links too');
    } 
  }else{
     Logger.log('The variable finalDomain is empty');
 }
}