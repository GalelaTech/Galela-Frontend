// Helper to get innerText of a section
function getSectionContent(id) {
    const el = document.getElementById(id);
    return el ? el.innerText.trim() : '';
}

// Generate professional summary
async function generateSummary() {
    const jobDescription = document.getElementById("job-desc").value.trim();
    const education = getSectionContent("education");
    const certificates = getSectionContent("certificates");
    const experience = getSectionContent("experience");
    const summaryBox = document.getElementById("ai-summary");

    if (!jobDescription) {
        alert("Please paste a job description first.");
        return;
    }

    summaryBox.value = "Generating summary... Please wait.";

    try {
        const response = await fetch("http://127.0.0.1:8000/api/generate-summary/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                job_description: jobDescription,
                education: education,
                certificates: certificates,
                experience: experience
            })
        });

        const data = await response.json();

        if (response.ok && data.summary) {
            const trimmedSummary = data.summary.trim();
            summaryBox.value = trimmedSummary;
            document.getElementById("job-desc").value = trimmedSummary;
            localStorage.setItem("cv_summary", trimmedSummary);
        } else {
            summaryBox.value = "Failed to generate summary.";
            console.error("Backend error:", data);
        }
    } catch (error) {
        summaryBox.value = "Network error. Backend may be down.";
        console.error("Request error:", error);
    }
}

// Generate responsibilities for a specific job
async function generateResponsibilities(jobKey) {
    // Find the job article by data-job
    const jobArticle = document.querySelector(`article[data-job="${jobKey}"]`);
    if (!jobArticle) return;

    const keyResponsibilityEl = jobArticle.querySelector(".keyResponsibility");
    const summaryBox = jobArticle.querySelector(".keySummary");
    const keyResponsibility = keyResponsibilityEl.value.trim();
    const experience = getSectionContent("experience");

    if (!keyResponsibility) {
        alert("Please paste the key responsibilities.");
        return;
    }

    summaryBox.value = "Generating key responsibilities... Please wait.";

    try {
        const response = await fetch("http://127.0.0.1:8000/api/generate-key-responsibility/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jobDescription: keyResponsibility,
                experience: experience
            })
        });

        const data = await response.json();

        if (response.ok && data.responsibilities) {
            const trimmed = data.responsibilities.trim();
            summaryBox.value = trimmed;
            keyResponsibilityEl.value = trimmed;
            localStorage.setItem(`key_summary_${jobKey}`, trimmed);
        } else {
            summaryBox.value = "Failed to generate responsibilities.";
            console.error("Backend error:", data);
        }
    } catch (error) {
        summaryBox.value = "Network error. Backend may be down.";
        console.error("Request error:", error);
    }
}

// Generate AI skill summary
async function generateSkillSummary() {
    const keySkillsEl = document.getElementById("keySkills");
    const keySkills = keySkillsEl.value.trim();
    const summaryBox = document.getElementById("skillSummary");

    if (!keySkills) {
        alert("Please paste skills and competencies.");
        return;
    }

    summaryBox.value = "Generating skill summary... Please wait.";

    try {
        const response = await fetch("http://127.0.0.1:8000/api/generate-skill-summary/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skills: keySkills })
        });

        const data = await response.json();

        if (response.ok && data.skill_summary) {
            const trimmed = data.skill_summary.trim();
            summaryBox.value = trimmed;
            keySkillsEl.value = trimmed;
            localStorage.setItem("skills_summary", trimmed);
        } else {
            summaryBox.value = "Failed to generate skill summary.";
            console.error("Backend error:", data);
        }
    } catch (error) {
        summaryBox.value = "Network error. Backend may be down.";
        console.error("Request error:", error);
    }
}

// Generate all sections sequentially
async function generateAllSections() {
    await generateSummary();
    await generateSkillSummary();

    // Generate responsibilities for all jobs
    const jobs = ["lab", "retail", "csir"];
    for (let job of jobs) {
        await generateResponsibilities(job);
    }

    alert("All sections generated successfully!");
}

// Function to save all data to localStorage
    function saveToLocalStorage() {
        // Save job description and AI summary
        const jobDesc = document.getElementById('job-desc').value;
        const aiSummary = document.getElementById('ai-summary').value;
        
        localStorage.setItem('jobDesc', jobDesc);
        localStorage.setItem('aiSummary', aiSummary);
        
        // Save all key responsibilities and their AI-generated summaries
        const keyResponsibilities = document.querySelectorAll('.keyResponsibility');
        const keySummaries = document.querySelectorAll('.keySummary');
        
        keyResponsibilities.forEach((textarea, index) => {
            localStorage.setItem(`keyResponsibility_${index}`, textarea.value);
        });
        
        keySummaries.forEach((textarea, index) => {
            localStorage.setItem(`keySummary_${index}`, textarea.value);
        });
        
        // Save skills and skill summary
        const keySkills = document.getElementById('keySkills').value;
        const skillSummary = document.getElementById('skillSummary').value;
        
        localStorage.setItem('keySkills', keySkills);
        localStorage.setItem('skillSummary', skillSummary);
        
        // Save job-specific data with identifiers
        const jobs = document.querySelectorAll('.job');
        jobs.forEach((job, index) => {
            const jobType = job.getAttribute('data-job');
            const responsibility = job.querySelector('.keyResponsibility').value;
            const summary = job.querySelector('.keySummary').value;
            
            localStorage.setItem(`job_${jobType}_responsibility`, responsibility);
            localStorage.setItem(`job_${jobType}_summary`, summary);
        });
        
        alert('All CV data saved to localStorage successfully!');
    }

    // Function to load all data from localStorage
    function loadFromLocalStorage() {
        // Load job description and AI summary
        const savedJobDesc = localStorage.getItem('jobDesc');
        const savedAiSummary = localStorage.getItem('aiSummary');
        
        if (savedJobDesc) document.getElementById('job-desc').value = savedJobDesc;
        if (savedAiSummary) document.getElementById('ai-summary').value = savedAiSummary;
        
        // Load all key responsibilities and their AI-generated summaries
        const keyResponsibilities = document.querySelectorAll('.keyResponsibility');
        const keySummaries = document.querySelectorAll('.keySummary');
        
        keyResponsibilities.forEach((textarea, index) => {
            const savedValue = localStorage.getItem(`keyResponsibility_${index}`);
            if (savedValue) textarea.value = savedValue;
        });
        
        keySummaries.forEach((textarea, index) => {
            const savedValue = localStorage.getItem(`keySummary_${index}`);
            if (savedValue) textarea.value = savedValue;
        });
        
        // Load skills and skill summary
        const savedKeySkills = localStorage.getItem('keySkills');
        const savedSkillSummary = localStorage.getItem('skillSummary');
        
        if (savedKeySkills) document.getElementById('keySkills').value = savedKeySkills;
        if (savedSkillSummary) document.getElementById('skillSummary').value = savedSkillSummary;
        
        // Load job-specific data
        const jobs = document.querySelectorAll('.job');
        jobs.forEach((job) => {
            const jobType = job.getAttribute('data-job');
            const responsibility = job.querySelector('.keyResponsibility');
            const summary = job.querySelector('.keySummary');
            
            const savedResponsibility = localStorage.getItem(`job_${jobType}_responsibility`);
            const savedSummary = localStorage.getItem(`job_${jobType}_summary`);
            
            if (savedResponsibility) responsibility.value = savedResponsibility;
            if (savedSummary) summary.value = savedSummary;
        });
        
        alert('All CV data loaded from localStorage successfully!');
    }

    function parseResponsibilitiesToList(text) {
        // First, remove any hyphens at the beginning of lines
        // Also remove any bullet points or dashes
        return text.trim()
            .split(/\n|\. /)
            .filter(line => line.trim() !== "")
            .map(line => {
                // Remove leading hyphens, dashes, bullets, and spaces
                let cleanLine = line.trim()
                    .replace(/^[-•*]\s*/, '') // Remove leading hyphen, bullet, or asterisk
                    .replace(/^-\s*/, '')      // Remove leading hyphen with space
                    .replace(/^\s*-\s*/, '')   // Remove leading hyphen with any spaces
                    .trim();
                
                // If the line starts with a number followed by a period or hyphen, remove that too
                cleanLine = cleanLine.replace(/^\d+[\.\)-]\s*/, '');
                
                return `<li>${cleanLine}</li>`;
            })
            .join("");
    }
    
    function parseSkillsToList(text) {
        return text.trim()
            .split("\n")
            .map(line => {
                const match = line.match(/\*\*(.*?)\*\*:(.*)/);
                
                if (match) {
                    // Clean the description part
                    let description = match[2].trim()
                        .replace(/^[-•*]\s*/, '')
                        .replace(/^\s*-\s*/, '')
                        .trim();
                    return `<li><strong>${match[1]}</strong>: ${description}</li>`;
                }
                
                // Clean regular lines
                let cleanLine = line.trim()
                    .replace(/^[-•*]\s*/, '')
                    .replace(/^\s*-\s*/, '')
                    .replace(/^\d+[\.\)-]\s*/, '')
                    .trim();
                
                return `<li>${cleanLine}</li>`;
            })
            .join("");
    }

    // Function to clear all localStorage data (optional)
    function clearLocalStorage() {
        if (confirm('Are you sure you want to clear all saved data?')) {
            localStorage.clear();
            alert('All localStorage data cleared!');
        }
    }

    // Auto-load data when page loads
    window.onload = function() {
        loadFromLocalStorage();
    };