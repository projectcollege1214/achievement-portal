<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/styles.css">
    <title>View Certificates</title>
</head>
<body>
    <h1>View Certificates</h1>
    <ul id="approved-certificate-list"></ul>
    <a href="/user_dashboard.html">Back to Dashboard</a>

    <script>
        document.addEventListener("DOMContentLoaded", function () {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            const type = urlParams.get('type');

            fetch(`/approved-certificates?category=${category}&type=${type}`)
                .then(response => response.json())
                .then(data => {
                    const approvedCertificateList = document.getElementById("approved-certificate-list");
                    approvedCertificateList.innerHTML = '';
                    data.certificates.forEach(certificate => {
                        const row = document.createElement("li");

                        const userSpan = document.createElement("span");
                        userSpan.textContent = `User: ${certificate.user || 'Unknown'}`;
                        row.appendChild(userSpan);

                        const categorySpan = document.createElement("span");
                        categorySpan.textContent = ` | Category: ${certificate.category}`;
                        row.appendChild(categorySpan);

                        const typeSpan = document.createElement("span");
                        typeSpan.textContent = ` | Type: ${certificate.type}`;
                        row.appendChild(typeSpan);

                        const fileLink = document.createElement("a");
                        fileLink.href = `/uploads/certificates/${certificate.file}`;
                        fileLink.textContent = "View Certificate";
                        row.appendChild(fileLink);

                        approvedCertificateList.appendChild(row);
                    });
                })
                .catch(error => {
                    console.error('Error fetching approved certificates:', error);
                });
        });
    </script>
</body>
</html>
