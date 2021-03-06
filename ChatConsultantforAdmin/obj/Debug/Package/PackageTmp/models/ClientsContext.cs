﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.Entity;
using System.Globalization;

namespace ChatConsultantforAdmin.models
{
    public class ClientsContext : DbContext
    {
        public ClientsContext() : base("DbConnection")
        { }

        public DbSet<Clients> Clients { get; set; }
    }

    public interface ClntRepository
    {
        IEnumerable<Clients> List(string admin);
        void SetLastMsg(DialogsMessages msg, string role);
        void NewClient(string name, string admin, string site);
        void ChangeStatus(string name, bool status);
    }

    public class ClientsRepository : IDisposable, ClntRepository
    {
        private ClientsContext db = new ClientsContext();
        AdmRepository repository1;

        public ClientsRepository(AdmRepository repo1)
        {
            repository1 = repo1;
        }

        public IEnumerable<Clients> List(string admin)
        {
            var site = repository1.List().Where(x => x.login == admin).FirstOrDefault().site;
            return db.Clients.OrderByDescending(x => x.last_message).Where(x => x.admin == admin && x.site == site);
        }

        public void SetLastMsg(DialogsMessages msg, string role)
        {
            if (role == "client")
            {
                var nedeedClient = db.Clients.Where(x => x.name == msg.msgFrom).FirstOrDefault();
                nedeedClient.last_message = msg.date;
            }
            else
            {
                var nedeedClient = db.Clients.Where(x => x.name == msg.msgTo).FirstOrDefault();
                nedeedClient.last_message = msg.date;
            }

            db.SaveChanges();
        }

        public void NewClient(string name, string admin, string site)
        {      
            Clients client = new Clients();
            client.name = name;
            client.site = site;
            client.admin = admin;

            CultureInfo provider = CultureInfo.GetCultureInfo("ru-RU");
            var date = DateTime.Now;
            client.last_message = DateTime.Parse(date.ToString(), provider);

            client.status = true;

            db.Clients.Add(client);
            db.SaveChanges();
        }

        public void ChangeStatus(string name, bool status)
        {
            db.Clients.Where(x => x.name == name).FirstOrDefault().status = status;
            db.SaveChanges();
        }

        protected void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (db != null)
                {
                    db.Dispose();
                    db = null;
                }
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}