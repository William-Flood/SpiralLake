using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using SpiralLake.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpiralLake.Services
{
    public class EmailSender : IEmailSender
    {
        public EmailSender(IOptions<AuthMessageSenderOptions> optionsAccessor) {
            Options = optionsAccessor.Value;
        }
        public AuthMessageSenderOptions Options { get; private set; } //set only via Secret Manager
        public Task SendEmailAsync(string email, string subject, string htmlMessage) {
            var client = new SendGridClient(Options.SendGridKey);
            var msg = new SendGridMessage() {
                From = new EmailAddress("account@spirallake.com", Options.SendGridUser),
                Subject = subject,
                PlainTextContent = htmlMessage,
                HtmlContent = htmlMessage
            };
            msg.AddTo(new EmailAddress(email));

            // Disable click tracking.
            // See https://sendgrid.com/docs/User_Guide/Settings/tracking.html
            msg.SetClickTracking(false, false);

            return client.SendEmailAsync(msg);
        }
    }
}
