﻿using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using ChatConsultantforAdmin.models;
using System.Globalization;

namespace ChatConsultantforAdmin.controllers
{
    public class MessagesController : Controller
    {
        MsgRepository repository1;
        ClntRepository repository2;

        public MessagesController(MsgRepository repo1, ClntRepository repo2)
        {
            repository1 = repo1;
            repository2 = repo2;
        }
        // GET: Messages
        public ActionResult DialogWindow()
        {
            return View(repository1.List());
        }

        [HttpPost]
        public JsonResult AddMessage(DialogsMessages newMsg, string role)
        {
            JsonResult jsonMsg = Json("");                    

            if (newMsg.msgText != null)
            {
                CultureInfo provider = CultureInfo.GetCultureInfo("ru-RU");
                var date = DateTime.Now;
                newMsg.date = DateTime.Parse(date.ToString(), provider);

                repository1.Save(newMsg);
                repository2.SetLastMsg(newMsg, role);

                jsonMsg = Json(newMsg, JsonRequestBehavior.AllowGet);
            }                      

            return jsonMsg;
        }

        [HttpGet]
        public JsonResult SetClient(string client)
        {
            var clientMessages = repository1.SetClient(client);

            return Json(clientMessages, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public JsonResult GetLastAdminMessage(string client)
        {
            JsonResult jsonMsg = Json("late");

            var lastMsg = repository1.List().Where(x => x.msgTo == client).Last();
            CultureInfo provider = CultureInfo.GetCultureInfo("ru-RU");
            var date = DateTime.Now;
            date = DateTime.Parse(date.ToString(), provider).Subtract(new TimeSpan(0, 0, 6));

            if(date.CompareTo(lastMsg.date) <= 0) jsonMsg = Json(repository1.List().Where(x => x.msgTo == client).Last().msgText, JsonRequestBehavior.AllowGet);

            return jsonMsg;
        }

        [HttpGet]
        public JsonResult GetMsgCount(string client)
        {
            return Json(repository1.List().Where(x => x.msgFrom == client).Count(), JsonRequestBehavior.AllowGet);
        }
    }
}