// Espera o DOM (estrutura HTML) carregar completamente
document.addEventListener('DOMContentLoaded', () => {

    console.log("Pirafrio Site - JavaScript Carregado");

    // =============================================
    // ===== FUNCIONALIDADE: MENU MOBILE TOGGLE =====
    // =============================================
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileNavLinks = document.getElementById('mobile-nav-links'); // Usar getElementById
    const bodyOverlay = document.getElementById('body-overlay'); // Selecionar o overlay

    function openMobileMenu() {
        if (mobileNavLinks && bodyOverlay) {
            mobileNavLinks.classList.add('active');
            mobileMenuButton.classList.add('open'); // Para trocar ícone se necessário
            mobileMenuButton.setAttribute('aria-expanded', 'true');
            bodyOverlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Impede scroll do body
        }
    }

    function closeMobileMenu() {
        if (mobileNavLinks && bodyOverlay) {
            mobileNavLinks.classList.remove('active');
            mobileMenuButton.classList.remove('open');
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            // Só remove o overlay se o painel de filtros também não estiver aberto
            if (!document.getElementById('filters-sidebar-panel')?.classList.contains('open')) {
                bodyOverlay.classList.remove('active');
                document.body.style.overflow = ''; // Restaura scroll do body
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
    const formStatus = document.getElementById('form-status');
    const submitButtonContact = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

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
            // Adiciona classe específica dependendo do formulário para evitar conflito de estilo se houver
            errorMsgElement.className = inputElement.form.id === 'btu-calculator-form' ? 'calc-error-message' : 'error-message';
            errorMsgElement.textContent = message;
            inputElement.parentNode.insertBefore(errorMsgElement, inputElement.nextSibling);
        }
    }

    if (contactForm && formStatus && submitButtonContact) {
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
            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const subject = subjectInput.value.trim();
            const message = messageInput.value.trim();
            let isValid = true;
            let errors = [];

            if (name === '') { isValid = false; errors.push('Nome'); addInputError(nameInput, 'Nome é obrigatório.'); }
            if (email === '') { isValid = false; errors.push('E-mail'); addInputError(emailInput, 'E-mail é obrigatório.'); }
            else if (!isValidEmail(email)) { isValid = false; errors.push('E-mail inválido'); addInputError(emailInput, 'Formato de e-mail inválido.'); }
            if (subject === '') { isValid = false; errors.push('Assunto'); addInputError(subjectInput, 'Assunto é obrigatório.'); }
            if (message === '') { isValid = false; errors.push('Mensagem'); addInputError(messageInput, 'Mensagem é obrigatória.'); }

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

    // =============================================
    // ===== FUNCIONALIDADE: FILTRO DE PRODUTOS =====
    // =============================================
    const filterCheckboxes = document.querySelectorAll('#filter-form input[type="checkbox"]'); // Mais específico
    const productCards = document.querySelectorAll('.product-list-container .product-card');
    const noResultsMessage = document.getElementById('no-results-message');
    const productGrid = document.querySelector('.product-list-container .product-grid');

    function getSelectedFilterValues(filterName) {
        const checkedBoxes = document.querySelectorAll(`#filter-form input[name="${filterName}"]:checked`);
        return Array.from(checkedBoxes).map(cb => cb.value);
    }

    function isAnyFilterSelected(filters) {
        for (const category in filters) { if (filters[category].length > 0) return true; }
        return false;
    }

    function applyFilters() {
        if (!productCards.length && !productGrid) return; // Se não há produtos na página

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
        if (productCards.length > 0 || productGrid) applyFilters(); // Aplica no carregamento
    }

    // --- Botão Limpar Filtros (no #no-results-message) ---
    const clearFiltersNoResultsBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersNoResultsBtn) {
        clearFiltersNoResultsBtn.addEventListener('click', () => {
            filterCheckboxes.forEach(checkbox => { checkbox.checked = false; });
            applyFilters();
        });
    }

    // =============================================
    // ===== FUNCIONALIDADE: CALCULADORA DE BTUS =====
    // =============================================
    const btuCalculatorForm = document.getElementById('btu-calculator-form');
    if (btuCalculatorForm) {
        const btuResultWrapper = document.getElementById('btu-calculator-result-wrapper');
        const btuResultDisplay = document.getElementById('btu-result-display');
        const btuRangeSuggestionP = document.getElementById('btu-range-suggestion');
        const resetButtonCalc = document.getElementById('reset-btu-btn');

        btuCalculatorForm.addEventListener('submit', function(event) {
            event.preventDefault();
            clearInputErrors(btuCalculatorForm);
            let isValidCalc = true;
            const areaInput = document.getElementById('calc-area');
            const area = parseFloat(areaInput.value);

            if (isNaN(area) || area <= 0) {
                addInputError(areaInput, 'Insira uma área válida.');
                isValidCalc = false;
            }
            if (!isValidCalc) {
                if(btuResultWrapper) btuResultWrapper.style.display = 'none';
                if(btuResultWrapper) btuResultWrapper.classList.remove('visible');
                return;
            }

            const pessoasExtras = parseInt(document.getElementById('calc-pessoas').value);
            const janelas = parseInt(document.getElementById('calc-janelas').value);
            const incidenciaSol = document.getElementById('calc-sol').value;
            const eletronicos = parseInt(document.getElementById('calc-eletronicos').value);
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
                btuResultWrapper.classList.add('visible');
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
                clearInputErrors(btuCalculatorForm);
                // O formulário será resetado pelo type="reset"
            });
        }
    }

    // =======================================================
    // ===== FILTROS MOBILE - TOGGLE PAINEL (ATUALIZADO) =====
    // =======================================================
    const filterToggleButtonMobile = document.getElementById('filter-toggle-mobile-btn');
    const filtersPanel = document.getElementById('filters-sidebar-panel');
    const filterPanelCloseButton = filtersPanel ? filtersPanel.querySelector('.filter-close-button') : null;
    const filterApplyMobileButton = filtersPanel ? filtersPanel.querySelector('.filter-apply-btn-action') : null;
    // bodyOverlay já foi selecionado para o menu principal

    function openMobileFiltersPanel() {
        if (filtersPanel && bodyOverlay) {
            // Se o menu principal estiver aberto, fecha ele primeiro
            if (mobileNavLinks && mobileNavLinks.classList.contains('active')) {
                closeMobileMenu(); // Assume que closeMobileMenu não vai fechar o overlay se este painel for abrir
            }
            filtersPanel.classList.add('open');
            bodyOverlay.classList.add('active');
            // Adiciona uma classe específica ao overlay para o painel de filtros,
            // assim, o clique no overlay só fecha o que estiver ativo.
            bodyOverlay.classList.add('filters-overlay-active');
            if (filterToggleButtonMobile) filterToggleButtonMobile.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileFiltersPanel() {
        if (filtersPanel && bodyOverlay) {
            filtersPanel.classList.remove('open');
            bodyOverlay.classList.remove('filters-overlay-active'); // Remove classe específica
            // Só remove a classe 'active' do overlay e restaura scroll do body
            // se o menu mobile principal TAMBÉM não estiver ativo.
            if (!mobileNavLinks?.classList.contains('active')) {
                bodyOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (filterToggleButtonMobile) filterToggleButtonMobile.setAttribute('aria-expanded', 'false');
        }
    }

    if (filterToggleButtonMobile) {
        filterToggleButtonMobile.addEventListener('click', openMobileFiltersPanel);
    }

    if (filterPanelCloseButton) {
        filterPanelCloseButton.addEventListener('click', closeMobileFiltersPanel);
    }

    // Se o botão "Aplicar Filtros" dentro do painel mobile também fecha o painel:
    if (filterApplyMobileButton) {
        filterApplyMobileButton.addEventListener('click', () => {
            // A função applyFilters() já é chamada pelo 'change' dos checkboxes.
            // Este botão no mobile agora apenas fecha o painel.
            closeMobileFiltersPanel();
        });
    }

    // Lógica do bodyOverlay ATUALIZADA para fechar ou o menu ou os filtros
    if (bodyOverlay) {
        bodyOverlay.addEventListener('click', (event) => {
            if (event.target === bodyOverlay) { // Garante que o clique foi no overlay mesmo
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

    // === Galeria da Página de Produto Detalhe (JS estava comentado no HTML) ===
    // Seletor do container de thumbnails, se você adicionar esta classe no produto-detalhe.html
    const productThumbnailsContainer = document.querySelector('.product-image-thumbnails');
    if (productThumbnailsContainer) {
        const mainProductImage = document.getElementById('main-product-image');
        const thumbnails = productThumbnailsContainer.querySelectorAll('img');

        thumbnails.forEach(thumb => {
            // Função para ser chamada no clique ou no keydown
            function handleThumbInteraction(clickedThumb) {
                if (mainProductImage) {
                    const newImageSrc = clickedThumb.dataset.fullimage || clickedThumb.src; // Prioriza data-attribute
                    mainProductImage.src = newImageSrc;
                    mainProductImage.alt = clickedThumb.alt;
                }
                thumbnails.forEach(t => t.classList.remove('active-thumb'));
                clickedThumb.classList.add('active-thumb');
            }

            thumb.addEventListener('click', function() {
                handleThumbInteraction(this);
            });

            thumb.addEventListener('keydown', function(event) {
                if (event.key === 'Enter' || event.key === ' ') { // Enter ou Espaço
                    event.preventDefault(); // Previne scroll do espaço
                    handleThumbInteraction(this);
                }
            });
            // Tornar thumbnails focáveis
            if (!thumb.hasAttribute('tabindex')) {
                 thumb.setAttribute('tabindex', '0');
            }
        });

        // Ativar a primeira thumb por padrão (se houver)
        if (thumbnails.length > 0 && mainProductImage && !productThumbnailsContainer.querySelector('.active-thumb')) {
             const firstThumb = thumbnails[0];
             firstThumb.classList.add('active-thumb');
             // Opcional: atualizar imagem principal com base na primeira thumb
             // mainProductImage.src = firstThumb.dataset.fullimage || firstThumb.src;
             // mainProductImage.alt = firstThumb.alt;
        }
    }


}); // Fim do DOMContentLoaded