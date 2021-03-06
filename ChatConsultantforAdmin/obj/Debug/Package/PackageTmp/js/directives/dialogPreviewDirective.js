﻿'use strict';
define(function () {
    var directiveModule = angular.module('dialogPreviewDirective', []);

    directiveModule.directive('dialogPreviewDirective',  function (selectUserFac) {
        return {
            restrict: 'EACM',
            template:			
                "<ul id='list' class='dialogs'>"+
                "</ul>",       
            scope: {
                
            },
            controller: function ($scope, $attrs, $http, $compile) {
                var config = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }

                var list = document.getElementById("list"); 
                var colors = ["#ff0000", "#9fff00", "#f1e50f", "#8a81ff", "#ee95d9", "#7397D4", "#71a7a5", "#624545", "#e18022", "#A0A9B1", "#c8b34e", "#f3e0e0", "#AD9999", "#0dffe9", "#ffac00", "#00ff00"];                
                var loaded = false;
                var msgCounts = {
                    names: [],
                    counts: []
                };
                
                setInterval(function(){
                    $http.get('/Clients/GetClients', { params: { admin: sessionStorage.getItem("adminLogin") } }, config)
                        .then(function (response) {  
                            if(response.data.length != list.childNodes.length){
                                list.innerHTML = "";
                                
                                response.data.forEach(function (item, i, arr) {
                                    var id = item.id - 1;
                                    
                                    var li = document.createElement("li"); 
                                    li.id = "preview" + id;
                                    if(loaded && (id == response.data[0].id - 1)) li.setAttribute("class", "news-user-dialog-preview");
                                    else li.setAttribute("class", "user-dialog-preview");

                                    li.setAttribute("ng-click", "selectUser('" + item.name + "', " + id + ")");                                    
                                    li.name = "dialogPreview";
                                    
                                    var div = document.createElement("div");
                                    div.setAttribute("class", "circle-user-avatar");           
                                    var clrId = Math.floor(Math.random() * colors.length);
                                    div.style.background = "linear-gradient(to bottom right, " + colors[clrId] + ", #e0d15d)"

                                    var div1 = document.createElement("div");
                                    div1.setAttribute("class", "online-status"); 
                                    if(item.status == false){
                                        div1.style.background = "#ff0000";   
                                    }
                                    else{
                                        div1.style.background = "#00ff00";   
                                    };

                                    var span1 = document.createElement("span");       
                                    span1.setAttribute("class", "avatar-name");    
                                    span1.innerHTML = item.name.charAt(0); 
                                    div.appendChild(span1);
                                    
                                    var span2 = document.createElement("span");       
                                    span2.setAttribute("class", "dialog-user-name");
                                    span2.innerHTML = item.name;          
                                    
                                    var span3 = document.createElement("span");       
                                    span3.setAttribute("class", "dialog-date");
                                    span3.id = "date" + id;
                                    span3.innerHTML = "Последнее сообщение: <br> " + toJavaScriptDateFromFactory(item.last_message); 
                                    
                                    li.appendChild(div);                                        
                                    li.appendChild(span2);  
                                    li.appendChild(span3); 
                                    li.appendChild(div1); 
                                    
                                    $compile(li)($scope);

                                    list.appendChild(li);  

                                    $http.get('/Messages/GetMsgCount', { params: { client: item.name } }, config)
                                        .then(function (response) {
                                            msgCounts.names[i] = item.name;
                                            msgCounts.counts[i] = response.data;
                                        }, function (error) {
                                            console.log("Ошибка: " + error)
                                        });
                                    
                                });  
                                loaded = true;                              
                            }
                            else{
                                response.data.forEach(function (item, i, arr) {
                                    var id = item.id - 1;

                                    var li = document.getElementById("preview" + id);

                                    if(item.status == false){
                                        li.children[3].style.background = "#ff0000";   
                                    }
                                    else{
                                        li.children[3].style.background = "#00ff00";   
                                    };

                                    $http.get('/Messages/GetMsgCount', { params: { client: item.name } }, config)
                                        .then(function (response) {
                                            if(response.data != msgCounts.counts[msgCounts.names.indexOf(item.name)]){ 
                                                console.log(li.className)
                                                if (li.className != "user-dialog-preview-selected" && li.className != "user-dialog-preview-selected ng-scope"){
                                                    li.setAttribute("class", "news-user-dialog-preview");  
                                                }
                                                
                                                msgCounts.counts[msgCounts.names.indexOf(item.name)]++;
                                                selectUserFac.setStat("clnt");
                                                selectUserFac.setUser(item.name);
                                                selectUserFac.setLastMessage(item.last_message);
                                            }
                                        }, function (error) {
                                            console.log("Ошибка: " + error)
                                        });  
                                });
                            }             
                    }, function (error) {
                        console.log("Ошибка: " + error)
                    });      
                }, 1000);
                
                function toJavaScriptDateFromServer(value) { 
                    var dataComponents = value.split(/\.| |:/); 
                    var dt = new Date(dataComponents[2], dataComponents[1], dataComponents[0], dataComponents[3], dataComponents[4], dataComponents[5]);
                    var d = new Date();
                    dt.setMinutes(dt.getMinutes() - d.getTimezoneOffset());
  
                    return addZeros(dt.getHours()) + ":" + addZeros(dt.getMinutes()) + ":" + addZeros(dt.getSeconds()) + " " + addZeros(dt.getDate()) + "." + addZeros(dt.getMonth()) + "." + dt.getFullYear();
                }

                function toJavaScriptDateFromFactory(value) {
                    var regexp = /Date\(([^)]+)\)/;

                    var results = regexp.exec(value);
                    var dt = new Date(parseFloat(results[1]));   
                    // var d = new Date();
                    // dt.setMinutes(dt.getMinutes() - d.getTimezoneOffset());             

                    return addZeros(dt.getHours()) + ":" + addZeros(dt.getMinutes()) + ":" + addZeros(dt.getSeconds()) + " " + addZeros(dt.getDate()) + "." + addZeros((dt.getMonth() + 1)) + "." + dt.getFullYear();
                }

                function addZeros(dateComponent) {
                    if (dateComponent < 10) return '0' + dateComponent;
                    else return dateComponent;
                }        

                $scope.selectUser = function(userName, nID){
                    var li = document.getElementById("preview" + nID);

                    if(li.children[3].style.background == "rgb(255, 0, 0)") {
                        window.alert("Данный пользователь не в сети");
                    }           
                    else{
                        selectUserFac.setStat("adm");
                        selectUserFac.setUser(userName);
                        
                        for(var i = 0; i < list.childNodes.length; i++){
                            if(list.childNodes[i].className != "news-user-dialog-preview"){
                                list.childNodes[i].setAttribute("class", "user-dialog-preview");    
                            }
                        }
                        
                        document.getElementById("preview" + nID).setAttribute("class", "user-dialog-preview-selected");  
                    }                                                          
                }

                $scope.$on('msgDateEvent', function () {             
                   $http.get('/Clients/GetClientID', { params: { name: selectUserFac.user, admin: sessionStorage.getItem("adminLogin") } }, config)                   
                        .then(function (response) {
                            var splt = document.getElementById("date" + response.data).innerHTML.split(" ");
                            var nDate = splt[3] + " " + splt[4];
                            if(nDate !== toJavaScriptDateFromFactory(selectUserFac.lastDate)){      
                                                     
                                var li = document.getElementById("preview" + response.data);

                                console.log(li.className)
                                if (li.className != "user-dialog-preview-selected" && li.className != "user-dialog-preview-selected ng-scope"){
                                    li.setAttribute("class", "news-user-dialog-preview");  
                                }

                                li.children[2].innerHTML = "Последнее сообщение: <br> " + toJavaScriptDateFromFactory(selectUserFac.lastDate);
                                $compile(li)($scope);
                                if(response.data != 0){
                                    list.insertBefore(li, list.childNodes[0]);         
                                }                                                          
                            }
                        }, function (error) {
                            console.log("Ошибка: " + error)
                        });                            
                });  
            },
            link: function (scope, element, attrs) {
                
            }
        }
    });
});
