document.addEventListener("DOMContentLoaded", function () {
    fetch("/admin/certificates")
        .then(response => response.json())
        .then(data => {
            const certificateList = document.getElementById("certificate-list");
            certificateList.innerHTML = '';
            data.certificates.forEach(certificate => {
                console.log('Displaying certificate for user:', certificate.user); // Debug log
                const row = document.createElement("tr");
                row.id = `certificate-${certificate.id}`; // Add id to each row

                const userCell = document.createElement("td");
                userCell.textContent = certificate.user || 'Unknown'; // Fallback to 'Unknown' if user is not defined
                row.appendChild(userCell);

                const categoryCell = document.createElement("td");
                categoryCell.textContent = certificate.category;
                row.appendChild(categoryCell);

                const typeCell = document.createElement("td");
                typeCell.textContent = certificate.type;
                row.appendChild(typeCell);

                const fileCell = document.createElement("td");
                const fileLink = document.createElement("a");
                fileLink.href = `/uploads/certificates/${certificate.file}`;
                fileLink.textContent = "View Certificate";
                fileCell.appendChild(fileLink);
                row.appendChild(fileCell);

                const statusCell = document.createElement("td");
                statusCell.textContent = certificate.status;
                row.appendChild(statusCell);

                const actionsCell = document.createElement("td");
                const approveBtn = document.createElement("button");
                approveBtn.textContent = "Approve";
                approveBtn.classList.add("btn", "btn-success", "mr-2");
                approveBtn.addEventListener('click', () => approveCertificate(certificate.id));
                actionsCell.appendChild(approveBtn);

                const rejectBtn = document.createElement("button");
                rejectBtn.textContent = "Reject";
                rejectBtn.classList.add("btn", "btn-danger");
                rejectBtn.addEventListener('click', () => rejectCertificate(certificate.id));
                actionsCell.appendChild(rejectBtn);

                row.appendChild(actionsCell);

                certificateList.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching certificates:', error);
        });
});

function approveCertificate(certificateId) {
    fetch(`/admin/certificates/approve/${certificateId}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                location.reload(); // Reload the page to reflect changes
            } else {
                alert("Failed to approve certificate.");
            }
        })
        .catch(error => {
            console.error('Error approving certificate:', error);
            alert("Failed to approve certificate.");
        });
}

function rejectCertificate(certificateId) {
    fetch(`/admin/certificates/reject/${certificateId}`, { method: 'POST' })
        .then(response => {
            if (response.ok) {
                location.reload();
                // Remove the row from the table
                const rowToRemove = document.getElementById(`certificate-${certificateId}`);
                // rowToRemove.parentNode.removeChild(rowToRemove);
            } else {
                alert("Failed to reject certificate.");
            }
        })
        .catch(error => {
            console.error('Error rejecting certificate:', error);
            alert("Failed to reject certificate.");
        });
}
