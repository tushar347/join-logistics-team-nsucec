# NSU CEC Art & Craft Recruitment, Fall 26

Files
- `index.html`  the whole website (logo and photo are embedded). Deploy it anywhere static, for example Vercel.
- `Code.gs`     Google Apps Script that stores applications in a Google Sheet and checks the member list.

## Connect the Google Sheet (5 minutes)

1. Create a Google Sheet. Rename the first tab to `Members`.
2. Put `NSU ID` in A1 and paste every current CEC member's NSU ID in column A, one per row.
3. Open Extensions > Apps Script. Delete the sample code and paste in `Code.gs`. Save.
4. Click Deploy > New deployment > type "Web app".
   - Execute as: Me
   - Who has access: Anyone
   Authorize when asked, then copy the Web app URL.
5. Open `index.html`, find `var ENDPOINT='';` near the bottom and paste the URL between the quotes.
6. Deploy `index.html` (Vercel: drag the folder into a new project, or `vercel --prod`).

Applications appear in a tab called `Applications`, created automatically on the first submission.

## How membership is enforced
- The form sends the NSU ID to the script when the applicant reaches the second question.
- The script accepts the ID only if it is in the `Members` tab, and only once per ID.
- An empty `Members` tab blocks everyone, so fill it before you share the link.
- After you edit `Code.gs`, use Deploy > Manage deployments > Edit > New version, otherwise the old code keeps running.

## Before launch
Replace the `[DATE]`, `[DEADLINE]` and `[CONFIRM WITH TEAM]` placeholders in `index.html`.

## SQLite instead?
Vercel cannot keep a SQLite file between requests. SQLite only makes sense if you host a small Node server on a machine you control. Google Sheets needs no server and lets executives read answers directly, so it is the default here.
