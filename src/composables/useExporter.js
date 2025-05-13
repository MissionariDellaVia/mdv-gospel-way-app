import html2canvas from 'html2canvas';

export default function useExporter(options) {
    const {
        highlights,
        title,
        reference,
        formattedDate,
        userName
    } = options;

    // Export highlights as an image
    async function exportHighlights() {
        showExportProgress();

        try {
            // Create export container
            const exportContainer = document.createElement('div');
            exportContainer.className = 'highlight-export-container';
            exportContainer.style.width = '750px';
            exportContainer.style.padding = '0';
            exportContainer.style.margin = '0';
            exportContainer.style.backgroundColor = 'white';
            exportContainer.style.fontFamily = '"Barlow Semi Condensed", sans-serif';
            exportContainer.style.color = '#281D02';
            exportContainer.style.borderRadius = '12px';
            exportContainer.style.overflow = 'hidden';
            exportContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';

            // Build export header
            appendExportHeader(exportContainer);

            // Build highlights section
            appendHighlightsSection(exportContainer);

            // Add footer
            appendExportFooter(exportContainer);

            // Add to DOM temporarily but hidden
            document.body.appendChild(exportContainer);
            exportContainer.style.position = 'fixed';
            exportContainer.style.left = '-9999px';
            exportContainer.style.top = '-9999px';

            // Generate canvas with html2canvas
            const canvas = await html2canvas(exportContainer, {
                backgroundColor: '#fff',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            // Convert to image and download
            const imgData = canvas.toDataURL('image/png');
            downloadImage(imgData);

            // Clean up
            document.body.removeChild(exportContainer);
            hideExportProgress();
        } catch (error) {
            console.error('Error exporting highlights:', error);
            hideExportProgress();
            alert('Errore durante l\'esportazione. Riprova più tardi.');
        }
    }

    // Create and append header to export container
    function appendExportHeader(container) {
        const header = document.createElement('div');
        header.style.padding = '20px';
        header.style.background = 'linear-gradient(to right, #6e4f3a, #A67D51)';
        header.style.color = 'white';
        header.style.display = 'flex';
        header.style.alignItems = 'center';

        // App logo
        const logoImg = document.createElement('img');
        logoImg.src = '/img/icons/android-chrome-192x192.png';
        logoImg.alt = 'Logo';
        logoImg.style.width = '50px';
        logoImg.style.height = '50px';
        logoImg.style.marginRight = '15px';
        logoImg.style.borderRadius = '8px';

        const titleDiv = document.createElement('div');

        const titleH2 = document.createElement('h2');
        titleH2.style.margin = '0';
        titleH2.style.fontSize = '24px';
        titleH2.textContent = title;

        const subtitleP = document.createElement('p');
        subtitleP.style.margin = '5px 0 0';
        subtitleP.style.opacity = '0.9';
        subtitleP.style.fontSize = '16px';
        subtitleP.textContent = reference || 'Evidenziazioni';

        titleDiv.appendChild(titleH2);
        titleDiv.appendChild(subtitleP);

        header.appendChild(logoImg);
        header.appendChild(titleDiv);
        container.appendChild(header);
    }

    // Create and append highlights section
    function appendHighlightsSection(container) {
        const highlightsSection = document.createElement('div');
        highlightsSection.style.padding = '20px';

        highlights.value.forEach(highlight => {
            const highlightItem = document.createElement('div');
            highlightItem.style.display = 'flex';
            highlightItem.style.marginBottom = '15px';
            highlightItem.style.paddingBottom = '15px';
            highlightItem.style.borderBottom = '1px solid rgba(166, 125, 81, 0.2)';

            const colorBar = document.createElement('div');
            colorBar.style.width = '5px';
            colorBar.style.flexShrink = '0';
            colorBar.style.borderRadius = '3px';
            colorBar.style.marginRight = '15px';
            colorBar.style.height = 'auto';
            colorBar.style.backgroundColor = highlight.color;

            const textContent = document.createElement('div');
            textContent.style.flex = '1';
            textContent.style.fontSize = '18px';
            textContent.style.lineHeight = '1.5';
            textContent.style.color = '#3e2723';

            const openQuote = document.createElement('span');
            openQuote.style.fontSize = '24px';
            openQuote.style.color = '#A67D51';
            openQuote.style.fontFamily = 'Georgia, serif';
            openQuote.textContent = '"';

            const textSpan = document.createElement('span');
            textSpan.textContent = highlight.text;

            const closeQuote = document.createElement('span');
            closeQuote.style.fontSize = '24px';
            closeQuote.style.color = '#A67D51';
            closeQuote.style.fontFamily = 'Georgia, serif';
            closeQuote.textContent = '"';

            textContent.appendChild(openQuote);
            textContent.appendChild(textSpan);
            textContent.appendChild(closeQuote);

            highlightItem.appendChild(colorBar);
            highlightItem.appendChild(textContent);

            highlightsSection.appendChild(highlightItem);
        });

        container.appendChild(highlightsSection);
    }

    // Create and append footer
    function appendExportFooter(container) {
        const footer = document.createElement('div');
        footer.style.padding = '0 20px 20px';
        footer.style.display = 'flex';
        footer.style.justifyContent = 'space-between';
        footer.style.color = '#6e4f3a';
        footer.style.fontSize = '14px';

        const userInfo = document.createElement('div');
        userInfo.textContent = userName.value;

        const dateInfo = document.createElement('div');
        dateInfo.textContent = formattedDate.value;

        footer.appendChild(userInfo);
        footer.appendChild(dateInfo);

        container.appendChild(footer);
    }

    // Download the image
    function downloadImage(imgData) {
        const link = document.createElement('a');
        const filename = `evidenziazioni-${reference ? reference.replace(/\s+/g, '-').toLowerCase() : 'vangelo'}-${new Date().toISOString().split('T')[0]}.png`;
        link.download = filename;
        link.href = imgData;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Show export progress indicator
    function showExportProgress() {
        const progress = document.createElement('div');
        progress.id = 'export-progress';
        progress.style.position = 'fixed';
        progress.style.top = '0';
        progress.style.left = '0';
        progress.style.right = '0';
        progress.style.bottom = '0';
        progress.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        progress.style.zIndex = '9999';
        progress.style.display = 'flex';
        progress.style.flexDirection = 'column';
        progress.style.alignItems = 'center';
        progress.style.justifyContent = 'center';
        progress.style.color = 'white';
        progress.style.fontFamily = 'Barlow Semi Condensed, sans-serif';

        progress.innerHTML = `
      <div style="width: 50px; height: 50px; border: 3px solid #d3b282; border-radius: 50%; border-top-color: transparent; animation: exportSpin 1s linear infinite;"></div>
      <p style="margin-top: 20px;">Preparazione esportazione...</p>
    `;

        const style = document.createElement('style');
        style.textContent = `
      @keyframes exportSpin {
        to { transform: rotate(360deg); }
      }
    `;

        document.head.appendChild(style);
        document.body.appendChild(progress);
    }

    // Hide export progress indicator
    function hideExportProgress() {
        const progress = document.getElementById('export-progress');
        if (progress) {
            progress.style.opacity = '0';
            progress.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                if (progress.parentNode) document.body.removeChild(progress);
            }, 300);
        }
    }

    return {
        exportHighlights
    };
}