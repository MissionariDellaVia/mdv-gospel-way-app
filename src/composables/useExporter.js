export default function useExporter(options) {
    const {
        highlights,
        title,
        reference,
        formattedDate,
        userName
    } = options;

    // Export highlights function
    function exportHighlights() {
        if (!highlights.value.length) return;

        // Create the export content
        const content = [
            `# ${title || 'La Via del Vangelo'} ${reference ? '- ' + reference : ''}`,
            `Data: ${formattedDate.value}`,
            `Utente: ${userName.value}`,
            '\n## Evidenziazioni\n'
        ];

        // Add all highlights
        highlights.value.forEach((highlight, index) => {
            content.push(`${index + 1}. "${highlight.text}"`);
        });

        // Join content with line breaks
        const exportText = content.join('\n');

        // Create a download link
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(exportText));
        element.setAttribute('download', `evidenziazioni-${reference ? reference.toLowerCase().replace(/\s+/g, '-') : 'vangelo'}.txt`);

        // Hide and add to document
        element.style.display = 'none';
        document.body.appendChild(element);

        // Trigger download
        element.click();

        // Clean up
        document.body.removeChild(element);
    }

    return {
        exportHighlights
    };
}