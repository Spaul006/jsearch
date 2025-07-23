// cover_letter_modal.js
// Handles the cover letter modal logic

console.log('[cover_letter_modal.js] Script loaded');

// Helper: Find job data from a global JS variable (to be rendered in the template)
function getJobDataByIndex(index) {
    if (window.allJobData && window.allJobData[index]) {
        return window.allJobData[index];
    }
    return null;
}

// Modal elements
const modal = document.getElementById('coverLetterModal');
const modalClose = document.getElementById('coverLetterModalClose');
const modalLoading = document.getElementById('coverLetterModalLoading');
const modalResult = document.getElementById('coverLetterModalResult');

// Open modal and start loading
function openCoverLetterModal(jobIndex) {
    console.log('[cover_letter_modal.js] openCoverLetterModal called with jobIndex:', jobIndex);
    if (typeof jobIndex === 'undefined' || jobIndex === null || isNaN(jobIndex)) {
        console.log('openCoverLetterModal called with invalid jobIndex:', jobIndex);
        return;
    }
    console.log('Opening cover letter modal for job index:', jobIndex);
    modal.style.display = 'block';
    console.log('[cover_letter_modal.js] modal.style.display after open:', modal.style.display);
    modalLoading.style.display = '';
    modalResult.style.display = 'none';
    document.body.style.overflow = 'hidden';

    // Fetch job data
    const job = getJobDataByIndex(jobIndex);
    if (!job) {
        modalLoading.innerHTML = '<p>Could not find job data.</p>';
        console.log('No job data found for index', jobIndex);
        return;
    }
    console.log('Job data:', job);
    console.log('Resume data:', window.resumeData);

    // Call backend to generate cover letter
    fetch('/generate_cover_letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job: job, resume_data: window.resumeData })
    })
    .then(res => {
        console.log('AJAX response status:', res.status);
        return res.json();
    })
    .then(data => {
        modalLoading.style.display = 'none';
        modalResult.style.display = '';
        if (data && data.cover_letter) {
            modalResult.innerHTML = `<h3>Generated Cover Letter</h3><pre style="white-space: pre-wrap;">${data.cover_letter}</pre>`;
            console.log('Cover letter generated successfully.');
        } else {
            modalResult.innerHTML = '<p>Could not generate cover letter. Please try again.</p>';
            console.log('Cover letter generation failed:', data);
        }
    })
    .catch((err) => {
        modalLoading.style.display = 'none';
        modalResult.style.display = '';
        modalResult.innerHTML = '<p>Could not generate cover letter. Please try again.</p>';
        console.log('AJAX error:', err);
    });
}

// Close modal
function closeCoverLetterModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    console.log('[cover_letter_modal.js] closeCoverLetterModal called. modal.style.display after close:', modal.style.display);
    console.log('Cover letter modal closed.');
}

// Event listeners
if (modalClose) {
    modalClose.addEventListener('click', closeCoverLetterModal);
}
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeCoverLetterModal();
});
modal.addEventListener('click', function(e) {
    if (e.target === modal) closeCoverLetterModal();
    if (e.target.classList.contains('cover-letter-modal-backdrop')) closeCoverLetterModal();
});

// Attach to all buttons
window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.cover-letter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            const jobIndex = btn.getAttribute('data-job-index');
            console.log('[cover_letter_modal.js] Generate Cover Letter button clicked for job index:', jobIndex);
            openCoverLetterModal(jobIndex);
        });
    });
}); 