export function assignmentHtml(range: string,  questionViewURL: string,examId?: string): string {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Question Assignment</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background-color: #3498db;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
        }
        .details {
            background-color: #f9f9f9;
            border-left: 4px solid #3498db;
            padding: 15px;
            margin: 20px 0;
        }
        .cta-button {
            display: block;
            width: 200px;
            margin: 20px auto;
            padding: 12px 20px;
            background-color: #2ecc71;
            color: white;
            text-align: center;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            background-color: #f4f4f4;
            color: #777;
            text-align: center;
            padding: 10px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Question Assignment Notification</h1>
        </div>
        <div class="content">
            <p>Hello Admin,</p>
            <p>You have been assigned to work on some questions. Please find the details below:</p>
            
            <div class="details">
                <strong>Question Range:</strong> ${range}<br>
                ${examId ? "<strong>Exam ID:</strong> " + examId + "<br>" : ""}
            </div>
            
            <a href="${questionViewURL}?range=${range}${examId ? "&examId="+examId: ""}" class="cta-button">View Questions</a>
        </div>
        <div class="footer">
            © ${new Date().getFullYear()} Mediprep. All rights reserved.
        </div>
    </div>
</body>
</html>
    `
}