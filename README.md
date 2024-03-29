# Mail Project

Frontend implementation for a single-page email client using JavaScript, HTML, and CSS.

The backend functionality and API was provided by distribution code from [CS50W's Mail Project](https://cdn.cs50.net/web/2020/spring/projects/3/mail.zip). Modifications were made only in `inbox.js`.

## Features

- **Send Mail:** Submit the email composition form to send emails via a POST request to `/emails`.
- **Mailbox:** Load Inbox, Sent, or Archive mailboxes with GET requests to `/emails/<mailbox>`.
- **View Email:** Click on an email to view its content. Emails are marked as read.
- **Archive/Unarchive:** Archive or unarchive Inbox emails with PUT requests to `/emails/<email_id>`.
- **Reply:** Reply to emails, pre-filling the composition form.

## Demo

[Watch Demo](https://www.youtube.com/watch?v=1EW5w2AXLUk)

## Usage

1. Clone the repository: `git clone https://github.com/your-username/mail-project.git`
2. Run `python manage.py runserver`
3. Interact with the email client in the browser.

Alternatively, you can also check out the app live in action on [Heroku](https://mail-d93be421367e.herokuapp.com/).

## Live Website
[Herkou](https://mail-d93be421367e.herokuapp.com/)
Use Email:`baz@example.com` and Password:`testing` for testing purposes.

## Credits

- CS50W OpenWare: [mail.zip](https://cdn.cs50.net/web/2020/spring/projects/3/mail.zip)
