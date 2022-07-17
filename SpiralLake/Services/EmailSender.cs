using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using SpiralLake.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RestSharp;
using RestSharp.Authenticators;

namespace SpiralLake.Services
{
    public class EmailSender : IEmailSender
    {
        public EmailSender(IOptions<AuthMessageSenderOptions> optionsAccessor) {
            Options = optionsAccessor.Value;
        }
        public AuthMessageSenderOptions Options { get; private set; } //set only via Secret Manager
        public async Task SendEmailAsync(string email, string subject, string htmlMessage) {
            //var client = new SendGridClient(Options.SendGridKey);
            //var msg = new SendGridMessage() {
            //    From = new EmailAddress("account@spirallake.com", Options.SendGridUser),
            //    Subject = subject,
            //    PlainTextContent = htmlMessage,
            //    HtmlContent = htmlMessage
            //};
            //msg.AddTo(new EmailAddress(email));
            //
            //// Disable click tracking.
            //// See https://sendgrid.com/docs/User_Guide/Settings/tracking.html
            //msg.SetClickTracking(false, false);
            //
            //var results = await client.SendEmailAsync(msg);
            //
            //return;
            RestClient client = new RestClient();
            client.BaseUrl = new Uri("https://api.mailgun.net/v3");

            client.Authenticator =

                new HttpBasicAuthenticator("api",
                    Options.MailGunKey);
            RestRequest request = new RestRequest();
            request.AddParameter("domain", "spirallake.com", ParameterType.UrlSegment);
            request.Resource = "spirallake.com/messages";
            request.AddParameter("from", "Spiral Lake Account Manager <account@spirallake.com>");
            request.AddParameter("to", email);
            request.AddParameter("subject", subject);
            request.AddParameter("html", htmlMessage);
            request.Method = Method.POST;
            var results = client.Execute(request);
            return;
        }
    }
}
