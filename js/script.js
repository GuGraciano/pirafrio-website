// Espera o DOM (estrutura HTML) carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    console.log("Pirafrio Site - JavaScript Carregado");

    // =============================================
    // ===== FUNCIONALIDADE: MENU MOBILE TOGGLE =====
    // =============================================
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileNavLinks = document.getElementById('mobile-nav-links');
    const bodyOverlay = document.getElementById('body-overlay');

    function openMobileMenu() {
        if (mobileNavLinks && bodyOverlay && mobileMenuButton) { // Adicionado mobileMenuButton aqui
            mobileNavLinks.classList.add('active');
            mobileMenuButton.classList.add('open');
            mobileMenuButton.setAttribute('aria-expanded', 'true');
            bodyOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileMenu() {
        if (mobileNavLinks && bodyOverlay && mobileMenuButton) { // Adicionado mobileMenuButton aqui
            mobileNavLinks.classList.remove('active');
            mobileMenuButton.classList.remove('open');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            if (!document.getElementById('filters-sidebar-panel')?.classList.contains('open')) {
                bodyOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    if (mobileMenuButton && mobileNavLinks) {
        mobileMenuButton.addEventListener('click', () => {
            if (mobileNavLinks.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        mobileNavLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    // ==========================================
    // ===== FUNCIONALIDADE: ANO ATUAL FOOTER =====
    // ==========================================
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // =============================================
    // ===== FUNCIONALIDADE: VALIDAÇÃO FORM CONTATO ===
    // =============================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) { // Verifica o formulário principal primeiro
        const formStatus = document.getElementById('form-status');
        const submitButtonContact = contactForm.querySelector('button[type="submit"]');

        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function clearInputErrors(form) {
            if (!form) return;
            form.querySelectorAll('.input-error').forEach(input => {
                input.classList.remove('input-error');
            });
            form.querySelectorAll('.error-message, .calc-error-message').forEach(msg => {
                msg.remove();
            });
        }

        function addInputError(inputElement, message) {
            if (!inputElement) return;
            inputElement.classList.add('input-error');
            const formGroup = inputElement.closest('.form-group');
            if (formGroup) {
                const existingErrorMsg = formGroup.querySelector('.error-message, .calc-error-message');
                if (existingErrorMsg) existingErrorMsg.remove();
                const errorMsgElement = document.createElement('span');
                errorMsgElement.className = inputElement.form.id === 'btu-calculator-form' ? 'calc-error-message' : 'error-message';
                errorMsgElement.textContent = message;
                inputElement.parentNode.insertBefore(errorMsgElement, inputElement.nextSibling);
            }
        }

        if (formStatus && submitButtonContact) { // Verifica elementos internos
            contactForm.addEventListener('submit', function(event) {
                event.preventDefault();
                formStatus.textContent = '';
                formStatus.className = 'form-status';
                formStatus.style.display = 'none';
                clearInputErrors(contactForm);
                submitButtonContact.disabled = true;

                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const subjectInput = document.getElementById('subject');
                const messageInput = document.getElementById('message');
                const name = nameInput ? nameInput.value.trim() : '';
                const email = emailInput ? emailInput.value.trim() : '';
                const subject = subjectInput ? subjectInput.value.trim() : '';
                const message = messageInput ? messageInput.value.trim() : '';
                let isValid = true;

                if (!nameInput || name === '') { isValid = false; if(nameInput) addInputError(nameInput, 'Nome é obrigatório.'); }
                if (!emailInput || email === '') { isValid = false; if(emailInput) addInputError(emailInput, 'E-mail é obrigatório.'); }
                else if (!isValidEmail(email)) { isValid = false; if(emailInput) addInputError(emailInput, 'Formato de e-mail inválido.'); }
                if (!subjectInput || subject === '') { isValid = false; if(subjectInput) addInputError(subjectInput, 'Assunto é obrigatório.'); }
                if (!messageInput || message === '') { isValid = false; if(messageInput) addInputError(messageInput, 'Mensagem é obrigatória.'); }

                if (isValid) {
                    formStatus.textContent = 'Enviando mensagem...';
                    formStatus.className = 'form-status info';
                    formStatus.style.display = 'block';
                    const formData = new FormData(contactForm);
                    const formAction = contactForm.getAttribute('action');

                    fetch(formAction, { method: 'POST', body: formData, headers: { 'Accept': 'application/json' } })
                    .then(response => {
                        if (response.ok) {
                            formStatus.textContent = 'Mensagem enviada com sucesso! Agradecemos o contato e retornaremos em breve.';
                            formStatus.className = 'form-status success';
                            contactForm.reset();
                        } else {
                             return response.json().then(data => {
                                let errorMsg = 'Ocorreu um erro do servidor ao tentar enviar a mensagem.';
                                if (data && data.errors) { errorMsg = data.errors.map(e => e.message).join(', '); }
                                 throw new Error(errorMsg);
                             });
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao enviar formulário:', error);
                        formStatus.textContent = `Erro ao enviar: ${error.message || 'Verifique sua conexão.'}`;
                        formStatus.className = 'form-status error';
                    })
                    .finally(() => {
                         formStatus.style.display = 'block';
                         submitButtonContact.disabled = false;
                     });
                } else {
                    formStatus.innerHTML = 'Por favor, corrija os campos indicados.';
                    formStatus.className = 'form-status error';
                    formStatus.style.display = 'block';
                    submitButtonContact.disabled = false;
                    const firstErrorInput = contactForm.querySelector('.input-error');
                    if (firstErrorInput) firstErrorInput.focus();
                }
            });
        }
    }

    // =============================================
    // ===== FUNCIONALIDADE: FILTRO DE PRODUTOS =====
    // =============================================
    const filterForm = document.getElementById('filter-form');
    if (filterForm) { // Verifica se o formulário de filtro existe
        const filterCheckboxes = filterForm.querySelectorAll('input[type="checkbox"]');
        const productCards = document.querySelectorAll('.product-list-container .product-card');
        const noResultsMessage = document.getElementById('no-results-message');
        const productGrid = document.querySelector('.product-list-container .product-grid');

        function getSelectedFilterValues(filterName) {
            const checkedBoxes = filterForm.querySelectorAll(`input[name="${filterName}"]:checked`);
            return Array.from(checkedBoxes).map(cb => cb.value);
        }

        function isAnyFilterSelected(filters) {
            for (const category in filters) { if (filters[category].length > 0) return true; }
            return false;
        }

        function applyFilters() {
            if (!productCards.length && !productGrid) return;

            const selectedFilters = {
                tipo: getSelectedFilterValues('tipo'),
                btu: getSelectedFilterValues('btu'),
                marca: getSelectedFilterValues('marca'),
                func: getSelectedFilterValues('func')
            };
            let visibleProductsCount = 0;

            productCards.forEach(card => {
                const productData = {
                    tipo: card.dataset.tipo || '', btu: card.dataset.btu || '',
                    marca: card.dataset.marca || '',
                    funcionalidades: (card.dataset.funcionalidades || '').split(' ').filter(f => f)
                };
                let shouldShow = true;
                for (const key in selectedFilters) {
                    if (selectedFilters[key].length > 0 && shouldShow) {
                        if (key === 'func') {
                            if (!selectedFilters[key].some(val => productData.funcionalidades.includes(val))) {
                                shouldShow = false;
                            }
                        } else {
                            if (!selectedFilters[key].includes(productData[key])) {
                                shouldShow = false;
                            }
                        }
                    }
                }
                card.classList.toggle('hidden', !shouldShow);
                if (shouldShow) visibleProductsCount++;
            });

            if (noResultsMessage && productGrid) {
                const showNoResults = visibleProductsCount === 0 && isAnyFilterSelected(selectedFilters);
                noResultsMessage.style.display = showNoResults ? 'flex' : 'none';
                productGrid.style.display = showNoResults ? 'none' : 'grid';
            }
        }

        if (filterCheckboxes.length > 0) {
            filterCheckboxes.forEach(checkbox => checkbox.addEventListener('change', applyFilters));
            if (productCards.length > 0 || productGrid) applyFilters();
        }

        const clearFiltersNoResultsBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersNoResultsBtn) {
            clearFiltersNoResultsBtn.addEventListener('click', () => {
                filterCheckboxes.forEach(checkbox => { checkbox.checked = false; });
                applyFilters();
            });
        }
    }


    // =======================================================
    // ===== FILTROS DESKTOP - DROPDOWNS  (Acordeão)     =====
    // =======================================================
    const DESKTOP_BREAKPOINT_FILTERS = 769;
    console.error("TESTE ANTES DA DEFINIÇÃO DE filterGroupToggles");
    const filterGroupToggles = document.querySelectorAll('.produtos-page .filter-group-toggle');
    console.error("TESTE DEPOIS DA DEFINIÇÃO DE filterGroupToggles:", filterGroupToggles);
    let resizeTimerFilters;

    // Função para manipular o clique no toggle do filtro (acordeão)
    function handleFilterToggleClick(event) {
        const button = event.currentTarget; // O botão que foi clicado
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        // O CSS deve cuidar de mostrar/esconder o conteúdo e girar o ícone
    }

    function setupFilterDropdowns() {
        if (!filterGroupToggles.length) return; // Sai se não encontrar os toggles

        const isDesktop = window.innerWidth >= DESKTOP_BREAKPOINT_FILTERS;

        filterGroupToggles.forEach(button => {
            const contentId = button.getAttribute('aria-controls');
            const contentElement = document.getElementById(contentId);

            if (!contentElement) return;

            if (isDesktop) {
                // Comportamento Desktop: Adiciona listener para acordeão
                // Remove listener antigo para evitar duplicação se a função for chamada múltiplas vezes (resize)
                button.removeEventListener('click', handleFilterToggleClick);
                button.addEventListener('click', handleFilterToggleClick);

                // Garante que aria-expanded esteja 'false' inicialmente no desktop,
                // a menos que seja o primeiro que você quer aberto.
                // O CSS vai esconder o conteúdo baseado nisso.
                if (!button.hasAttribute('data-initially-expanded')) { // Evita fechar um que foi explicitamente aberto
                    button.setAttribute('aria-expanded', 'false');
                }
            } else {
                // Comportamento Mobile: Remove listener de acordeão e garante que tudo esteja expandido
                button.removeEventListener('click', handleFilterToggleClick);
                button.setAttribute('aria-expanded', 'true');
                // O CSS para mobile deve garantir que .filter-group-content seja display: block;
            }
        });

        // Se quiser que um filtro específico comece aberto no desktop
        if (isDesktop) {
        const firstToggle = document.querySelector('.produtos-page .filter-group:first-of-type .filter-group-toggle');
        if (firstToggle && firstToggle.getAttribute('aria-expanded') !== 'true') { // Evitar setar se já estiver true por data-initially-expanded
            firstToggle.setAttribute('aria-expanded', 'true');
            }
        }
    }

        if (filterGroupToggles.length > 0) { // << USO DE filterGroupToggles
        setupFilterDropdowns();

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimerFilters);
            resizeTimerFilters = setTimeout(setupFilterDropdowns, 250);
        });
    }


    // =============================================
    // ===== FUNCIONALIDADE: CALCULADORA DE BTUS =====
    // =============================================
    const btuCalculatorForm = document.getElementById('btu-calculator-form');
    if (btuCalculatorForm) {
        const btuResultWrapper = document.getElementById('btu-calculator-result-wrapper');
        const btuResultDisplay = document.getElementById('btu-result-display');
        const btuRangeSuggestionP = document.getElementById('btu-range-suggestion'); // Verifique se este ID existe no HTML
        const resetButtonCalc = document.getElementById('reset-btu-btn');

        // Precisa da função addInputError e clearInputErrors, já definidas na seção de contato
        // Se esta seção pode rodar sem a de contato, precisaria duplicá-las ou movê-las para um escopo global.
        // Assumindo que estão disponíveis.

        btuCalculatorForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if (typeof clearInputErrors === 'function') clearInputErrors(btuCalculatorForm); // Verifica se a função existe
            let isValidCalc = true;
            const areaInput = document.getElementById('calc-area');
            const area = parseFloat(areaInput.value);

            if (isNaN(area) || area <= 0) {
                if (typeof addInputError === 'function') addInputError(areaInput, 'Insira uma área válida.');
                isValidCalc = false;
            }
            if (!isValidCalc) {
                if(btuResultWrapper) btuResultWrapper.style.display = 'none';
                if(btuResultWrapper) btuResultWrapper.classList.remove('visible'); // Supondo que 'visible' é uma classe sua
                return;
            }

            const pessoasExtrasSelect = document.getElementById('calc-pessoas');
            const janelasSelect = document.getElementById('calc-janelas');
            const incidenciaSolSelect = document.getElementById('calc-sol');
            const eletronicosSelect = document.getElementById('calc-eletronicos');

            const pessoasExtras = pessoasExtrasSelect ? parseInt(pessoasExtrasSelect.value) : 0;
            const janelas = janelasSelect ? parseInt(janelasSelect.value) : 0;
            const incidenciaSol = incidenciaSolSelect ? incidenciaSolSelect.value : 'manha';
            const eletronicos = eletronicosSelect ? parseInt(eletronicosSelect.value) : 0;

            let btuBasePorMetroQuadrado = incidenciaSol === 'tarde' ? 800 : 600;
            let btuCalculado = (area * btuBasePorMetroQuadrado) + (pessoasExtras * 600) + (janelas * 600) + (eletronicos * 600);
            const capacidadesComerciais = [7500, 9000, 12000, 18000, 22000, 24000, 27000, 30000, 36000, 48000, 60000];
            let btuFinal = capacidadesComerciais.find(cap => cap >= btuCalculado) || capacidadesComerciais[capacidadesComerciais.length -1];

            if (btuResultDisplay) btuResultDisplay.textContent = `${btuFinal.toLocaleString('pt-BR')} BTUs`;

            if (btuRangeSuggestionP) {
                 let faixaInferior = capacidadesComerciais.filter(cap => cap < btuFinal).pop() || btuFinal;
                 let faixaSuperior = capacidadesComerciais.find(cap => cap > btuFinal) || btuFinal;
                 if(btuFinal < capacidadesComerciais[0]) faixaInferior = capacidadesComerciais[0];
                 if(btuFinal > capacidadesComerciais[capacidadesComerciais.length-1]) faixaSuperior = capacidadesComerciais[capacidadesComerciais.length-1];

                if (faixaInferior === btuFinal && faixaSuperior === btuFinal ) {
                     btuRangeSuggestionP.innerHTML = `Recomendamos um aparelho de <strong>${btuFinal.toLocaleString('pt-BR')} BTUs</strong>.`;
                } else if (faixaInferior === btuFinal) {
                    btuRangeSuggestionP.innerHTML = `Sugerimos aparelhos a partir de <strong>${btuFinal.toLocaleString('pt-BR')} BTUs</strong> (ou até ${faixaSuperior.toLocaleString('pt-BR')} BTUs).`;
                } else if (faixaSuperior === btuFinal) {
                     btuRangeSuggestionP.innerHTML = `Sugerimos aparelhos até <strong>${btuFinal.toLocaleString('pt-BR')} BTUs</strong> (a partir de ${faixaInferior.toLocaleString('pt-BR')} BTUs).`;
                }
                else {
                     btuRangeSuggestionP.innerHTML = `Modelos entre <strong>${faixaInferior.toLocaleString('pt-BR')} e ${faixaSuperior.toLocaleString('pt-BR')} BTUs</strong> podem ser adequados.`;
                }
                btuRangeSuggestionP.style.display = 'block';
            }

            if (btuResultWrapper) {
                btuResultWrapper.style.display = 'block';
                btuResultWrapper.classList.add('visible'); // Supondo que 'visible' é uma classe sua
                btuResultWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        if (resetButtonCalc) {
            resetButtonCalc.addEventListener('click', function() {
                if (btuResultWrapper) {
                    btuResultWrapper.style.display = 'none';
                    btuResultWrapper.classList.remove('visible');
                }
                if (btuRangeSuggestionP) btuRangeSuggestionP.style.display = 'none';
                if (typeof clearInputErrors === 'function') clearInputErrors(btuCalculatorForm);
            });
        }
    }

    // =======================================================
    // ===== FILTROS MOBILE - TOGGLE PAINEL (ATUALIZADO) =====
    // =======================================================
    const filterToggleButtonMobile = document.getElementById('filter-toggle-mobile-btn');
    const filtersPanel = document.getElementById('filters-sidebar-panel');

    if (filterToggleButtonMobile && filtersPanel) { // Verifica se os elementos existem
        const filterPanelCloseButton = filtersPanel.querySelector('.filter-close-button');
        const filterApplyMobileButton = filtersPanel.querySelector('.filter-apply-btn-action');

        function openMobileFiltersPanel() {
            if (filtersPanel && bodyOverlay) {
                if (mobileNavLinks && mobileNavLinks.classList.contains('active')) {
                    closeMobileMenu();
                }
                filtersPanel.classList.add('open');
                bodyOverlay.classList.add('active');
                bodyOverlay.classList.add('filters-overlay-active');
                if (filterToggleButtonMobile) filterToggleButtonMobile.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }
        }

        function closeMobileFiltersPanel() {
            if (filtersPanel && bodyOverlay) {
                filtersPanel.classList.remove('open');
                bodyOverlay.classList.remove('filters-overlay-active');
                if (!mobileNavLinks?.classList.contains('active')) {
                    bodyOverlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
                if (filterToggleButtonMobile) filterToggleButtonMobile.setAttribute('aria-expanded', 'false');
            }
        }

        filterToggleButtonMobile.addEventListener('click', openMobileFiltersPanel);

        if (filterPanelCloseButton) {
            filterPanelCloseButton.addEventListener('click', closeMobileFiltersPanel);
        }

        if (filterApplyMobileButton) {
            filterApplyMobileButton.addEventListener('click', () => {
                closeMobileFiltersPanel();
            });
        }
    }

    // Lógica do bodyOverlay ATUALIZADA para fechar ou o menu ou os filtros
    if (bodyOverlay) {
        bodyOverlay.addEventListener('click', (event) => {
            if (event.target === bodyOverlay) {
                if (filtersPanel && filtersPanel.classList.contains('open')) {
                    closeMobileFiltersPanel();
                } else if (mobileNavLinks && mobileNavLinks.classList.contains('active')) {
                    closeMobileMenu();
                }
            }
        });
    }

    // Fechar com tecla ESC (geral, fecha o que estiver aberto)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (filtersPanel && filtersPanel.classList.contains('open')) {
                closeMobileFiltersPanel();
            } else if (mobileNavLinks && mobileNavLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        }
    });

    // === Galeria da Página de Produto Detalhe ===
    const productThumbnailsContainer = document.querySelector('.product-image-thumbnails');
    if (productThumbnailsContainer) {
        const mainProductImage = document.getElementById('main-product-image');
        const thumbnails = productThumbnailsContainer.querySelectorAll('img');

        if (mainProductImage && thumbnails.length > 0) { // Verifica se os elementos principais existem
            function handleThumbInteraction(clickedThumb) {
                const newImageSrc = clickedThumb.dataset.fullimage || clickedThumb.src;
                mainProductImage.src = newImageSrc;
                mainProductImage.alt = clickedThumb.alt;
                thumbnails.forEach(t => t.classList.remove('active-thumb'));
                clickedThumb.classList.add('active-thumb');
            }

            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', function() {
                    handleThumbInteraction(this);
                });
                thumb.addEventListener('keydown', function(event) {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleThumbInteraction(this);
                    }
                });
                if (!thumb.hasAttribute('tabindex')) {
                     thumb.setAttribute('tabindex', '0');
                }
            });

            if (!productThumbnailsContainer.querySelector('.active-thumb')) {
                 const firstThumb = thumbnails[0];
                 firstThumb.classList.add('active-thumb');
                 // Opcional:
                 // mainProductImage.src = firstThumb.dataset.fullimage || firstThumb.src;
                 // mainProductImage.alt = firstThumb.alt;
            }
        }
    }
        console.log("Botões de filtro encontrados:", filterGroupToggles);
        filterGroupToggles.forEach((button, index) => {
        const contentId = button.getAttribute('aria-controls');
        const contentElement = document.getElementById(contentId);
        console.log(`Botão ${index}:`, button, `aria-controls="${contentId}"`);
        console.log(`Elemento de conteúdo para botão ${index}:`, contentElement);
    });

}); // Fim do ÚNICO DOMContentLoaded

