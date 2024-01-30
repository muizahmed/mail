document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => loadMailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => loadMailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => loadMailbox('archive'));
  document.querySelector('#compose').addEventListener('click', composeEmail);

  // By default, load the inbox
  loadMailbox('inbox');

  // Send Email
  document.querySelector('#compose-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    let emailSent = await sendEmail();
    console.log(emailSent);
    if (!emailSent) {

      // Show an error tooltip if recipient doesn't exist
      let inputField = document.querySelector('#compose-recipients')
      inputField.setCustomValidity("Invalid Email: Recipient doesn't exist in the database");
      inputField.reportValidity();
      inputField.addEventListener('input', function () {
        inputField.setCustomValidity('');
      })
    } else (
      document.querySelector('#compose-form').submit()
    )
  });
});

function composeEmail() {

  // Show compose view and hide other views
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function loadMailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#mailbox-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#mailbox-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  //Load emails
  renderMailbox(mailbox);
}

function renderMailbox(mailbox) {
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {

      emails.forEach((email) => {
        let emailInfo = [
          email.sender, email.subject,
          formatTimestamp(email.timestamp).timestampShort
        ];

        // Create div for email preview
        let emailPrvw = document.createElement('div');
        document.querySelector('#mailbox-view').appendChild(emailPrvw);
        emailPrvw.setAttribute('class', 'email-prvw');
        emailPrvw.setAttribute('id', email.id);

        // Open individual email when clicked
        emailPrvw.addEventListener('click', function () {
          renderEmail(this.id);
          console.log(this.id);
        });

        // Styling logic
        if (email.read) {
          emailPrvw.style.backgroundColor = '#d3d3d352';
        } else {
          emailPrvw.style.backgroundColor = 'white';
          emailPrvw.style.fontWeight = 'bold';
        }

        // Render Email Data
        emailInfo.forEach((info) => {
          let dataContainer = document.createElement('span');
          emailPrvw.appendChild(dataContainer);
          dataContainer.innerHTML = info;
        })
      })

    })
}

function renderEmail(emailId) {

  // Show the email view and hide other views
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Clear previously rendered mails
  document.querySelector('#email-view').innerHTML = '';

  fetch(`emails/${emailId}`)
    .then(response => response.json())
    .then(email => {
      console.log(email);
      // Render the email metadata section
      let emailMetadata = document.createElement('div');
      document.querySelector('#email-view').appendChild(emailMetadata);
      emailMetadata.setAttribute('class', 'email-metadata');

      let emailInfo = {
        'From:': email.sender, 'To:': email.recipients, 'Subject:': email.subject,
        'Timestamp:': `${formatTimestamp(email.timestamp).timestampShort} - ${formatTimestamp(email.timestamp).timeAgo}`
      };

      for (let item in emailInfo) {
        let metaDataItem = document.createElement('div');
        emailMetadata.appendChild(metaDataItem);
        metaDataItem.innerHTML = `<b>${item}</b> ${emailInfo[item]}`
      }

      // Add a Reply Button
      let btnReply = document.createElement('button');
      btnReply.appendChild(document.createTextNode('Reply'));
      btnReply.setAttribute('class', 'btn btn-sm btn-outline-primary mt-2');
      btnReply.addEventListener('click', () => replyToMail(formatTimestamp(email.timestamp).timestampShort, email.sender, email.subject, email.body));
      emailMetadata.appendChild(btnReply);

      // Add an Archive Button
      let userEmail = document.querySelector('#user').textContent;
      if (!(email.sender == userEmail)) {
        let btnArchive = document.createElement('button');
        if (email.archived) {
          var btnText = 'Unarchive';
        } else {
          var btnText = 'Archive';
        }
        btnArchive.appendChild(document.createTextNode(btnText));
        btnArchive.setAttribute('class', 'btn btn-sm btn-outline-primary mt-2 ml-2');
        btnArchive.addEventListener('click', () => markArchived(emailId, email.archived))
        emailMetadata.appendChild(btnArchive);
      }

      document.querySelector('#email-view').appendChild(document.createElement('hr'));

      // Render the email body
      let emailBody = document.createElement('div');
      document.querySelector('#email-view').appendChild(emailBody);
      emailBody.innerHTML = email.body;

      // Mark as read
      markAsRead(emailId);

    })
}

function markAsRead(emailId) {
  fetch(`emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function markArchived(emailId, currState) {
  fetch(`emails/${emailId}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !currState
    })
  })
    .then(() => loadMailbox('inbox'))
}

async function sendEmail() {
  try {
    const response = await fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    });
    if (!response.ok) {
      throw new Error('HTTP error ' + response.status);
    }
    return true;
  } catch (error) {
    return false;
  }
}

function replyToMail(timestamp, sender, subject, body) {
  composeEmail();
  // Fill out composition fields
  document.querySelector('#compose-recipients').value = sender;
  document.querySelector('#compose-subject').value = `Re: ${subject}`;
  document.querySelector('#compose-body').value = `On ${timestamp}, ${sender} wrote: \n \t ${body}`;
}

// Helper Functions
function formatTimestamp(timestamp) {
  timestamp = new Date(`${timestamp} UTC`);
  let date = `${timestamp.toLocaleString('default', { month: 'short' })} ${timestamp.getDate()} ${timestamp.getFullYear()}`;
  let day = `${timestamp.toLocaleString('default', { weekday: 'short' })}`;
  let time = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
  let timestampShort = `${date}, ${time}`
  let ago = (new Date() - timestamp) / 1000 / 60;
  let timeAgo;
  if (ago > 60) {
    ago /= 60;
    if (ago > 24) {
      ago /= 24;
      timeAgo = `${ago.toFixed()} day(s) ago`;
    } else {
      timeAgo = `${ago.toFixed()} hour(s) ago`;
    }
  } else {
    timeAgo = `${ago.toFixed()} minute(s) ago`;
  }

  return {
    'timestamp': timestamp,
    'timestampShort': timestampShort,
    'date': date,
    'day': day,
    'time': time,
    'timeAgo': timeAgo
  }
}
