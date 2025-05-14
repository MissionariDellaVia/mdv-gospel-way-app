import {ref} from 'vue';
import html2canvas from 'html2canvas';

/**
 * Exporter composable for highlight export functionality
 * @param {Object} options Configuration options
 * @returns {Object} Exporter methods and state
 */
export default function useExporter(options) {
    const {
        highlights,
        title,
        reference: initialReference,
        formattedDate,
        organization
    } = options;

    // Loading state
    const isExportLoading = ref(false);

    // Allow dynamic reference updates
    const reference = ref(initialReference);

    /**
     * Update the reference text
     * @param {String} newReference New reference text to use
     */
    function updateReference(newReference) {
        reference.value = newReference;
    }

    /**
     * Export highlights as image
     * @param {Boolean} isMobile Whether device is mobile
     */
    async function exportAsImage(isMobile = false) {
        if (!highlights.value.length) return;

        isExportLoading.value = true;

        try {
            const exportContainer = createExportContainer();
            document.body.appendChild(exportContainer);

            // Short delay to ensure everything renders properly
            await new Promise(resolve => setTimeout(resolve, 100));

            // Generate canvas with html2canvas
            const canvas = await html2canvas(exportContainer, {
                backgroundColor: '#fff',
                scale: 2, // Higher quality
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            // Convert to image
            const imgData = canvas.toDataURL('image/png');

            // Clean up the container
            document.body.removeChild(exportContainer);

            // Share or download based on platform
            if (isMobile && navigator.share) {
                await shareImage(imgData);
            } else {
                downloadImage(imgData);
            }
        } catch (error) {
            console.error('Error exporting highlights as image:', error);
            alert('Si è verificato un errore durante l\'esportazione. Riprova più tardi.');
        } finally {
            isExportLoading.value = false;
        }
    }

    /**
     * Export highlights as text file
     */
    function exportAsText() {
        if (!highlights.value.length) return;

        isExportLoading.value = true;

        try {
            // Create text content
            const textContent = [
                `${title}`,
                `${reference.value}`,
                `Data: ${formattedDate.value}`,
                `\nEvidenziazioni:\n`
            ];

            // Add all highlights with their colors
            highlights.value.forEach((highlight, index) => {
                const colorName = getColorName(highlight.color);
                textContent.push(`${index + 1}. "${highlight.text}" (${colorName})`);
            });

            // Add footer
            textContent.push(`\n${organization}`);

            // Join content with line breaks
            const content = textContent.join('\n');

            // Create and download text file
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const filename = `evidenziazioni-${
                reference.value ? reference.value.replace(/\s+/g, '-').toLowerCase() : 'vangelo'
            }-${new Date().toISOString().split('T')[0]}.txt`;

            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        } catch (error) {
            console.error('Error exporting highlights as text:', error);
            alert('Si è verificato un errore durante l\'esportazione. Riprova più tardi.');
        } finally {
            isExportLoading.value = false;
        }
    }

    /**
     * Get human-readable name for color
     * @param {String} color CSS color value
     * @returns {String} Color name
     */
    function getColorName(color) {
        const colorMap = {
            'rgba(255, 230, 0, 0.35)': 'Giallo',
            'rgba(0, 176, 255, 0.35)': 'Azzurro',
            'rgba(255, 121, 168, 0.35)': 'Rosa',
            'rgba(0, 230, 118, 0.35)': 'Verde',
            'rgba(187, 107, 217, 0.35)': 'Viola'
        };

        return colorMap[color] || 'Evidenziato';
    }

    /**
     * Create container for export
     * @returns {HTMLElement} Container element for export
     */
    function createExportContainer() {
        // Create export container
        const container = document.createElement('div');
        container.className = 'highlight-export-container';
        container.style.width = '90%';
        container.style.maxWidth = '750px';
        container.style.padding = '0';
        container.style.margin = '0 auto';
        container.style.backgroundColor = 'white';
        container.style.fontFamily = '"Barlow Semi Condensed", sans-serif';
        container.style.color = '#281D02';
        container.style.borderRadius = '12px';
        container.style.overflow = 'hidden';
        container.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        container.style.position = 'fixed';
        container.style.left = '-9999px';
        container.style.top = '0';

        // Add header
        const header = createExportHeader();
        container.appendChild(header);

        // Add highlights
        const highlightsSection = createExportHighlightsSection();
        container.appendChild(highlightsSection);

        // Add footer
        const footer = createExportFooter();
        container.appendChild(footer);

        return container;
    }

    /**
     * Create header for export
     * @returns {HTMLElement} Header element
     */
    function createExportHeader() {
        const header = document.createElement('div');
        header.style.padding = '20px';
        header.style.background = 'linear-gradient(to right, #6e4f3a, #A67D51)';
        header.style.color = 'white';
        header.style.display = 'flex';
        header.style.alignItems = 'center';

        const titleDiv = document.createElement('div');

        const titleH2 = document.createElement('h2');
        titleH2.style.margin = '0';
        titleH2.style.fontSize = '22px';
        titleH2.textContent = 'Vangelo del Giorno'; // Fixed title

        const subtitleP = document.createElement('p');
        subtitleP.style.margin = '5px 0 0';
        subtitleP.style.opacity = '0.9';
        subtitleP.style.fontSize = '16px';
        subtitleP.textContent = reference.value || 'Evidenziazioni';

        titleDiv.appendChild(titleH2);
        titleDiv.appendChild(subtitleP);
        header.appendChild(titleDiv);

        return header;
    }

    /**
     * Create highlights section for export
     * @returns {HTMLElement} Highlights section element
     */
    function createExportHighlightsSection() {
        const section = document.createElement('div');
        section.style.padding = '20px';

        highlights.value.forEach(highlight => {
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.marginBottom = '15px';
            item.style.paddingBottom = '15px';
            item.style.borderBottom = '1px solid rgba(166, 125, 81, 0.2)';

            const colorBar = document.createElement('div');
            colorBar.style.width = '5px';
            colorBar.style.flexShrink = '0';
            colorBar.style.borderRadius = '3px';
            colorBar.style.marginRight = '15px';
            colorBar.style.backgroundColor = highlight.color;

            const textContent = document.createElement('div');
            textContent.style.flex = '1';
            textContent.style.fontSize = '16px';
            textContent.style.lineHeight = '1.5';
            textContent.style.color = '#3e2723';

            const openQuote = document.createElement('span');
            openQuote.style.fontSize = '20px';
            openQuote.style.color = '#A67D51';
            openQuote.style.fontFamily = 'Georgia, serif';
            openQuote.textContent = '"';

            const textSpan = document.createElement('span');
            textSpan.textContent = highlight.text;

            const closeQuote = document.createElement('span');
            closeQuote.style.fontSize = '20px';
            closeQuote.style.color = '#A67D51';
            closeQuote.style.fontFamily = 'Georgia, serif';
            closeQuote.textContent = '"';

            textContent.appendChild(openQuote);
            textContent.appendChild(textSpan);
            textContent.appendChild(closeQuote);

            item.appendChild(colorBar);
            item.appendChild(textContent);

            section.appendChild(item);
        });

        return section;
    }

    /**
     * Create footer for export
     * @returns {HTMLElement} Footer element
     */
    function createExportFooter() {
        const footer = document.createElement('div');
        footer.style.padding = '15px 20px';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.alignItems = 'center';
        footer.style.borderTop = '1px solid rgba(166, 125, 81, 0.1)';

        // Organization name on the left
        const orgInfo = document.createElement('div');
        orgInfo.textContent = organization;
        orgInfo.style.fontSize = '12px';
        orgInfo.style.maxWidth = '70%';
        orgInfo.style.color = '#6e4f3a';

        // Date on the right
        const dateInfo = document.createElement('div');
        dateInfo.textContent = formattedDate.value;
        dateInfo.style.fontSize = '12px';
        dateInfo.style.color = '#6e4f3a';

        footer.appendChild(orgInfo);
        footer.appendChild(dateInfo);

        return footer;
    }

    /**
     * Share image using Web Share API
     * @param {String} imgData Base64 encoded image data
     */
    async function shareImage(imgData) {
        try {
            const blob = await (await fetch(imgData)).blob();
            const file = new File(
                [blob],
                `evidenziazioni-${reference.value || 'vangelo'}.png`,
                { type: 'image/png' }
            );

            await navigator.share({
                files: [file],
                title: 'Le mie evidenziazioni',
                text: 'Evidenziazioni da La Via del Vangelo'
            });
        } catch (err) {
            console.error('Error sharing', err);
            downloadImage(imgData);
        }
    }

    /**
     * Download image
     * @param {String} imgData Base64 encoded image data
     */
    function downloadImage(imgData) {
        const link = document.createElement('a');
        link.download = `evidenziazioni-${
            reference.value ? reference.value.replace(/\s+/g, '-').toLowerCase() : 'vangelo'
        }-${new Date().toISOString().split('T')[0]}.png`;
        link.href = imgData;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Legacy function name for backward compatibility
    const exportHighlights = exportAsImage;

    return {
        isExportLoading,
        exportHighlights,
        exportAsImage,
        exportAsText,
        updateReference
    };
}