var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var today = new Date();

$.fn.isVisible = function(){
   //returns wether this items is being displayed or not
   return (($(this).css('display') !== 'none')&&($(this).css('display') !== 'none !important'));
};

$.fn.toMonthName = function(){
   //returns the months array text value for this index
   return this.each(function(){
      var data = Number($.trim($(this).text()));
      data = months[Number(data-1)];
      $(this).text(data);
   });
};

$.fn.isEstimated = function(){
   //if this time value is future, date is estimated
   return this.each(function(){
      var year = Number($.trim($(this).text()));
      var listItem = $(this).parents('li:eq(0)');
      var month = Number(months.indexOf($.trim($(this).prev('.toMonthName').text())));
      if ((year > today.getFullYear())||((year === today.getFullYear())&&(month > today.getMonth()))){
         listItem.find('.dataLabel').text("estimated end date");
      }//fi
   });
};

$.fn.toOrderNumber = function(){
   //return the order value for this number
   return this.each(function(){
      
      if ($(this).text().match(/\d/g)){
      var data = Number($.trim($(this).text()));
      
      switch(data){         
         case 1:         
            data = data+"st";
            break;         
         case 2:
            data = data+"nd";
            break;            
         case 3:
            data = data+"rd";
            break;            
         case 11:
         case 12:
         case 13:
         default:
            data = data+"th";
            break;
      }//switch
      
      $(this).text(data);
      }//fi
   });
};

$.fn.linkMe = function(){
   //replace this DOM object with a link
   return this.each(function(){
      var link = $(document.createElement("A"));
      link.attr('href', $.trim($(this).text()));
      link.attr('target', "_blank");
      link.text($.trim($(this).text()));
      $(this).replaceWith(link);
   });
};

$.fn.clearEmptySpaces = function(){
   //clears blank spaces followed by a single comma
   return this.each(function(){
      if ($(this).find('.newLine').length === 0){
         var data = $.trim($(this).text());
         if (data.match(/\{\{.+\}\}/) === null){
            data = data.replace(/(\s)+\,{1}/g, '');
            $(this).text(data);
         }//fi
      }//fi
   });
};

//capitalizes text
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function getCammelText(text){
   //get cammel text
   var aSpaces = text.split(/\s/g);
   for (var i = 1; i < aSpaces.length; i++){
      aSpaces[i] = aSpaces[i].capitalize();
   }
   
   var cammelTextWithComma = aSpaces.join();
   var cammelTextNoCommas = cammelTextWithComma.replace(/\,/g, "");
   return cammelTextNoCommas;
}

$.fn.appendAllSections = function(){
   //creates options for a select based on sections titles
   return this.each(function(){
      var sections = $(document).find('h2');
      var select = $(this);
      select.find('option').remove();
      select.append('<option value="-1">choose one ...</option>');
      sections.each(function(){
         var option = $(document.createElement("OPTION"));
         option.text($(this).text());
         option.val(getCammelText($(this).text()));
         select.append(option);
      });
      
      select.find('option').each(function(){
         $(this).text($(this).text().capitalize());
      });
   });
};

function parseAllData(){
   //after angular's digest:
   //applies all changes to values or elements
   
   $('.toMonthName').toMonthName();
   $('.toOrderNumber').toOrderNumber();
   $('.isEstimated').isEstimated();
   $('.dataInput').clearEmptySpaces();
   $('.linkMe').linkMe();
   
   $('section').each(function(){
      
      //append 'return top' element at the end of each section
      if ($(this).find('.return').length === 0){
         var div = $(document.createElement("DIV")).addClass('return');
         var link = $(document.createElement("A")).attr('href', '#top').text("return top");
         $(this).find('.sectionBody').append(div.append(link));
      }//fi
      
      //append toggling ico at each section header
      if ($(this).find('.fa-toggle-up').length === 0){
         var icon = $(document.createElement("I")).addClass('fa fa-toggle-up');
         $(this).find('h2').append(icon);
      }
   });
   
   //append options for 'gotoSection' combo and bind onChange()
   if ($('#gotoSection').find('option').length === 0){
      $('#gotoSection').appendAllSections().unbind('change').change(function(e){
         e.preventDefault();
         e.stopPropagation();
         location.href = '#'+$(this).val();
      });
   }
}

//application
var app = angular.module('autocv', []);

app.controller('NavController', ['$scope', function($scope){
   $scope.printMe = function(){
      //print this document
      window.print();
   };
}]);

//directive
app.directive('autoCv', function(){
   return{
      restrict: 'E',
      templateUrl: './views/personalInfo.html',
      controller: ['$scope', function($scope){
            
            //data model
            $scope.person = null;
                        
            //retrieve JSON
            //use jQuery AJAX in order to force not to cache
            $.ajax({
               async: false,
               crossDomain: true,
               cache: false,
               url: './database/sample.json',
               type: 'GET',
               dataType: 'json',
               success: function(data){
                  //save data
                  $scope.person = data;
               }
            });
            
            //watch after every digest in order to parse data
            $scope.$watch(function(){
               if ($(document).find('.dataInput').length !== 0){
                  parseAllData();
               }
            });
      }],
      controllerAs: 'person'
   };
});

//bind all toggling icos onClick()
//use jQuery delegate as toggling icos would change
$(document).delegate('.fa-toggle-up, .fa-toggle-down', 'click', function(){
   var icon = $(this);
   var sectionBody = $(this).parents('section:eq(0)').find('.sectionBody');
   
   //if section is visible, slide it up and change ico
   if (sectionBody.isVisible()){
      sectionBody.slideUp('slow').queue(function(){
         icon.removeClass('fa-toggle-up').addClass('fa-toggle-down');
         $(this).dequeue();
      });
   }else{
   //else, slide it down and change ico
      sectionBody.slideDown('slow').queue(function(){
         icon.removeClass('fa-toggle-down').addClass('fa-toggle-up');
         $(this).dequeue();
      });
   }
});
