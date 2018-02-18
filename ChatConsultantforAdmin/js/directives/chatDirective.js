﻿'use strict';
define(function () {
    var directiveModule = angular.module('chatDirective', []);

    directiveModule.directive('chatDirective', function (selectUserFac) {
        return {
            restrict: 'EACM',
            template:
                "<textarea ng-keydown='sendMessage($event)' id='userMessage' type='text' class='chat-input' placeholder='Введите ваше сообщение здесь и нажмите Enter...' ></textarea>",           
            scope: {},
            controller: function ($scope, $attrs, $http) {
                var msg = document.getElementById('userMessage');
                var ul = document.getElementById('messages');
                var chatWindow = document.getElementById('chat2');
                $scope.userName = undefined;

                scrollToDown();

                var data = {
                    msgText: undefined,
                    msgFrom: sessionStorage.getItem('admin'),
                    msgTo: undefined
                }               

                $scope.$on('msgToEvent', function () {
                    data.msgTo = selectUserFac.user;                
                })
                
                $scope.sendMessage = function (e) {
                    if (e.keyCode == 13) {
                        e.preventDefault();
                        if (msg.value != "") {  
                            data.msgText = msg.value;

                            var config = {
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            }
                           
                            $http.post('/Messages/AddMessage', { messageText: data.msgText, messageFrom: data.msgFrom, messageTo: data.msgTo }, config)
                                .then(function (success) {
                                  successFn();
                              }, function (error) {
                                  errorFn();
                              });
                        };                        
                    };
                };

                function successFn() {
                    var li = document.createElement('li');
                    var br = document.createElement('br');
                    br.setAttribute('style', 'clear: both');
                    li.setAttribute('class', 'admin-message-cloud');
                    li.appendChild(document.createTextNode(msg.value));
                    ul.appendChild(li);
                    ul.appendChild(br);
                    ul.appendChild(br);
                    msg.value = "";

                    scrollToDown();

                    console.log("success");
                };

                function errorFn() {
                    console.log("error");
                };

                function scrollToDown() {
                    if (chatWindow.scrollHeight != 0) {
                        chatWindow.scrollTo(12, chatWindow.scrollHeight);
                    };
                }
            },
            link: function (scope, element, attrs) {
            }
        }
    });
});
