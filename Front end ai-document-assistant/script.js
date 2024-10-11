// Document Upload and Viewer
document.getElementById('fileInput').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    const filePreview = document.getElementById('filePreview');
    const originalDocument = document.getElementById('originalDocument');
    const improvedDocument = document.getElementById('improvedDocument');
    const improveButton = document.getElementById('improveButton'); // Get the button

    if (file) {
        filePreview.textContent = `File Selected: ${file.name}`;
        originalDocument.value = ''; // Clear previous content
        improvedDocument.value = ''; // Clear previous content

        // Enable the improve button
        improveButton.disabled = false;

        const fileType = file.name.split('.').pop().toLowerCase();

        if (fileType === 'docx') {
            processDocxFile(file);
        } else if (fileType === 'pdf') {
            processPdfFile(file);
        } else if (fileType === 'txt') {
            const reader = new FileReader();
            reader.onload = function (event) {
                const text = event.target.result;
                displayExtractedText(text);
            };
            reader.readAsText(file);
        } else {
            alert('Unsupported file format. Please upload a .docx, .pdf, or .txt file.');
        }
    } else {
        filePreview.textContent = 'No file selected';
        originalDocument.value = '';
        improvedDocument.value = '';
        
        // Disable the improve button
        improveButton.disabled = true;
    }
}

// Function to process DOCX files
function processDocxFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const arrayBuffer = event.target.result;
        mammoth.extractRawText({ arrayBuffer: arrayBuffer })
            .then(function (result) {
                displayExtractedText(result.value);
            })
            .catch(handleError);
    };
    reader.readAsArrayBuffer(file);
}

// Function to process PDF files
function processPdfFile(file) {
    const reader = new FileReader();
    reader.onload = function (event) {
        const typedArray = new Uint8Array(event.target.result);
        pdfjsLib.getDocument(typedArray).promise
            .then(pdf => {
                let textContent = '';
                const pages = [];

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    pages.push(pdf.getPage(pageNum).then(page => {
                        return page.getTextContent().then(text => {
                            text.items.forEach(item => {
                                textContent += item.str + ' ';
                            });
                        });
                    }));
                }

                Promise.all(pages).then(() => {
                    displayExtractedText(textContent);
                });
            })
            .catch(handleError);
    };
    reader.readAsArrayBuffer(file);
}

// Improve button
document.getElementById('improveButton').addEventListener('click', function() {
    const originalDocument = document.getElementById('originalDocument');
    const improvedDocument = document.getElementById('improvedDocument');
    const loader = document.getElementById('loader');

    // Show loader
    loader.style.display = 'block';

    // Simulate the improvement process
    setTimeout(() => {
        const text = originalDocument.value;
        const improvedText = text.replace(/(.*?)(\.)/g, (match, p1) => {
            return p1 + ' (Consider adding more detail here.)'; // Placeholder for improvement
        });

        // Update improved document and hide loader
        improvedDocument.value = improvedText;
        loader.style.display = 'none'; // Hide loader after processing
        
        // Call to display suggestions based on improved text
        displaySuggestionsBasedOnText(improvedText);
    }, 2000); // Simulates a 2-second improvement process
});

// Function to display extracted text
function displayExtractedText(text) {
    const originalDocument = document.getElementById('originalDocument');
    originalDocument.value = text; // Display the original text
}

// Function to display suggestions based on the improved text
function displaySuggestionsBasedOnText(improvedText) {
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    // Generate dynamic suggestions based on the improved text content
    const suggestions = [];

    // Add diverse suggestions based on the content of the document
    if (improvedText.length > 150) {
        suggestions.push("Consider summarizing lengthy paragraphs for better clarity.");
    }
    if (improvedText.toLowerCase().includes("grammar")) {
        suggestions.push("Check for grammatical errors to improve readability.");
    }
    if (improvedText.toLowerCase().includes("conclusion")) {
        suggestions.push("Consider revising the conclusion to make it more impactful.");
    }
    if (improvedText.toLowerCase().includes("passive")) {
        suggestions.push("Try to reduce the use of passive voice to make the text more direct.");
    }
    if (improvedText.toLowerCase().includes("spelling")) {
        suggestions.push("Review the document for possible spelling errors.");
    }
    if (improvedText.toLowerCase().includes("repetition")) {
        suggestions.push("Consider removing repetitive phrases or words to enhance clarity.");
    }
    if (improvedText.toLowerCase().includes("wordy")) {
        suggestions.push("Simplify wordy sentences to make them more concise.");
    }

    // Display a fallback suggestion if no specific conditions were met
    if (suggestions.length === 0) {
        suggestions.push("Consider checking the overall clarity and structure of your document.");
    }

    // Display the generated suggestions in the list
    suggestions.forEach(suggestion => {
        const li = document.createElement('li');

        // Create an editable input field for the suggestion
        const suggestionInput = document.createElement('input');
        suggestionInput.type = 'text';
        suggestionInput.value = suggestion;

        // Accept Button
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept';
        acceptButton.onclick = function () {
            // Show loader while processing the accepted change
            const loader = document.getElementById('loader');
            loader.style.display = 'block';

            setTimeout(() => {
                // Apply the suggestion to the improved document
                applySuggestionToDocument(suggestionInput.value, improvedText);

                // Remove the suggestion from the list after processing
                li.remove();
                loader.style.display = 'none'; // Hide loader after processing
                alert("The improvement process has been completed successfully.");
            }, 1000); // Simulate a delay for processing
        };

        // Reject Button
        const rejectButton = document.createElement('button');
        rejectButton.textContent = 'Reject';
        rejectButton.onclick = function () {
            // Remove the suggestion from the list
            li.remove(); // Remove the suggestion from the list
            checkForRemainingSuggestions(); // Check if there are no remaining suggestions
        };

        li.appendChild(suggestionInput); // Add the editable input field to the list item
        li.appendChild(acceptButton);
        li.appendChild(rejectButton);
        suggestionsList.appendChild(li);
    });
}

// Function to apply the suggestion to the improved document
function applySuggestionToDocument(suggestion, improvedText) {
    const improvedDocument = document.getElementById('improvedDocument');
    let currentText = improvedDocument.value;

    // Enhanced logic to apply the suggestion directly to the document
    if (suggestion.includes("Check for grammatical errors")) {
        currentText = currentText.replace(/This document have some grammar mistakes/, 'This document has some grammatical mistakes');
    }
    if (suggestion.includes("Review the document for possible spelling errors")) {
        currentText = currentText.replace(/adress/, 'address')
                                 .replace(/repetion/, 'repetition')
                                 .replace(/sugestions/, 'suggestions');
    }
    if (suggestion.includes("Try to reduce the use of passive voice")) {
        currentText = currentText.replace(/There is also a use of passive voice/, 'We should use active voice for clarity');
    }
    if (suggestion.includes("Consider removing repetitive phrases")) {
        currentText = currentText.replace(/again and again and again/, 'repeatedly');
    }
    if (suggestion.includes("Simplify wordy sentences")) {
        currentText = currentText.replace(/even though it could be simpler/, 'even though it could be more straightforward');
    }
    if (suggestion.includes("Consider summarizing lengthy paragraphs")) {
        currentText = currentText.replace(/this paragraph is lengthy/, 'this paragraph could be summarized for clarity');
    }

    // Remove the "(Consider adding more detail here.)" text if it exists after improvements
    currentText = currentText.replace(/\(Consider adding more detail here.\)/g, '');

    // Update the improved document with the applied suggestion
    improvedDocument.value = currentText;
}

// Function to display suggestions based on the improved text
function displaySuggestionsBasedOnText(improvedText) {
    const suggestionsList = document.getElementById('suggestionsList');
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    // Generate dynamic suggestions based on the improved text content
    const suggestions = [];

    // Add diverse suggestions based on the content of the document
    if (improvedText.length > 150) {
        suggestions.push("Summarize lengthy paragraphs.");
    }
    if (improvedText.toLowerCase().includes("grammar")) {
        suggestions.push("Check for grammatical errors.");
    }
    if (improvedText.toLowerCase().includes("conclusion")) {
        suggestions.push("Revise the conclusion");
    }
    if (improvedText.toLowerCase().includes("passive")) {
        suggestions.push("Reduce the use of passive voice to make the text more direct.");
    }
    if (improvedText.toLowerCase().includes("spelling")) {
        suggestions.push("possible spelling errors.");
    }
    if (improvedText.toLowerCase().includes("repetition")) {
        suggestions.push("Remove repetitive phrases or words");
    }
    if (improvedText.toLowerCase().includes("wordy")) {
        suggestions.push("Simplify wordy sentences to make them more concise.");
    }

    // Display fallback suggestion if no specific conditions were met
    if (suggestions.length === 0) {
        suggestions.push("Consider checking the overall clarity and structure of your document.");
    }

    // Display the generated suggestions in the list
    suggestions.forEach(suggestion => {
        const li = document.createElement('li');

        // Create an editable input field for the suggestion
        const suggestionInput = document.createElement('input');
        suggestionInput.type = 'text';
        suggestionInput.value = suggestion;

        // Accept Button
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept';
        acceptButton.onclick = function () {
            // Show loader while processing the accepted change
            const loader = document.getElementById('loader');
            loader.style.display = 'block';

            setTimeout(() => {
                // Apply the suggestion to the improved document
                applySuggestionToDocument(suggestionInput.value, improvedText);

                // Remove the suggestion from the list after processing
                li.remove();
                loader.style.display = 'none'; // Hide loader after processing
                alert("The improvement process has been completed successfully.");

                // Check if all suggestions have been handled
                checkForRemainingSuggestions();
            }, 1000); // Simulate a delay for processing
        };

        // Reject Button
        const rejectButton = document.createElement('button');
        rejectButton.textContent = 'Reject';
        rejectButton.onclick = function () {
            // Remove the suggestion from the list
            li.remove(); // Remove the suggestion from the list
            checkForRemainingSuggestions(); // Check if there are no remaining suggestions
        };

        li.appendChild(suggestionInput); // Add the editable input field to the list item
        li.appendChild(acceptButton);
        li.appendChild(rejectButton);
        suggestionsList.appendChild(li);
    });
}

// Function to check if all suggestions are rejected or accepted
function checkForRemainingSuggestions() {
    const suggestionsList = document.getElementById('suggestionsList');
    if (suggestionsList.children.length === 0) {
        const userResponse = confirm("All suggestions have been handled. Would you like to keep your document as is or make manual changes?");
        
        if (userResponse) {
            alert("Document will be kept as is.");
        } else {
            // Allow the user to make manual changes to the document
            const originalDocument = document.getElementById('originalDocument');
            const improvedDocument = document.getElementById('improvedDocument');
            
            // Make both text areas editable for manual changes
            originalDocument.removeAttribute('readonly');
            improvedDocument.removeAttribute('readonly');

            alert("You can now make personal changes to your document.");
        }
    }
}

    // Display the generated suggestions in the list
    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;

        // Accept and reject buttons
        const acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept';
        acceptButton.onclick = function () {
            alert(`Suggestion Accepted: "${suggestion}"`);
        };

        const rejectButton = document.createElement('button');
        rejectButton.textContent = 'Reject';
        rejectButton.onclick = function () {
            alert(`Suggestion Rejected: "${suggestion}"`);
        };

        li.appendChild(acceptButton);
        li.appendChild(rejectButton);
        suggestionsList.appendChild(li);
    });
    //Function to remove suggestion list
    function handleFileUpload(event) {
        const file = event.target.files[0];
        const filePreview = document.getElementById('filePreview');
        const originalDocument = document.getElementById('originalDocument');
        const improvedDocument = document.getElementById('improvedDocument');
        const suggestionsList = document.getElementById('suggestionsList'); // Reference the suggestions list
        const improveButton = document.getElementById('improveButton'); // Get the button
    
        if (file) {
            filePreview.textContent = `File Selected: ${file.name}`;
            originalDocument.value = ''; // Clear previous content
            improvedDocument.value = ''; // Clear previous content
            suggestionsList.innerHTML = ''; // Clear previous suggestions
    
            // Enable the improve button
            improveButton.disabled = false;
    
            const fileType = file.name.split('.').pop().toLowerCase();
    
            if (fileType === 'docx') {
                processDocxFile(file);
            } else if (fileType === 'pdf') {
                processPdfFile(file);
            } else if (fileType === 'txt') {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const text = event.target.result;
                    displayExtractedText(text);
                };
                reader.readAsText(file);
            } else {
                alert('Unsupported file format. Please upload a .docx, .pdf, or .txt file.');
            }
        } else {
            filePreview.textContent = 'No file selected';
            originalDocument.value = '';
            improvedDocument.value = '';
            suggestionsList.innerHTML = ''; // Clear suggestions if no file selected
            
            // Disable the improve button
            improveButton.disabled = true;
        }
    }
    

// Function for error handling
function handleError(error) {
    console.error('Error processing file:', error);
    alert('There was an error processing the file. Please try again.');
}
