// Wait for the entire page to load before running any scripts
document.addEventListener('DOMContentLoaded', (event) => {

        // --- Real-time Clock ---
    
    function updateClock() {
        const now = new Date();
        
        // Format date: Day, DD Month YYYY
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = now.toLocaleDateString('en-MY', dateOptions);
        
        // Format time: HH:MM:SS
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeString = `${hours}:${minutes}:${seconds}`;
        
        // Update DOM elements
        const dateElement = document.getElementById('clock-date');
        const timeElement = document.getElementById('clock-time');
        
        if (dateElement && timeElement) {
            dateElement.textContent = dateString;
            timeElement.textContent = timeString;
        }
    }
    
    // Initialize clock if elements exist
    if (document.getElementById('clock-date') && document.getElementById('clock-time')) {
        updateClock(); // Set initial time
        setInterval(updateClock, 1000); // Update every second
    }

    // --- Populate Navigation Dropdowns ---
    
    // Products dropdown
    const productsDropdown = document.querySelector('.dropdown:nth-child(2) .dropdown-menu');
    if (productsDropdown) {
        const productLinks = [
            { href: 'product1.html', text: 'Hand Bouquets' },
            { href: 'product2.html', text: 'CNY Decorations' }
        ];
        productLinks.forEach(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            li.appendChild(a);
            productsDropdown.appendChild(li);
        });
    }
    
    // Activities dropdown
    const activitiesDropdown = document.querySelector('.dropdown:nth-child(3) .dropdown-menu');
    if (activitiesDropdown) {
        const activityLinks = [
            { href: 'workshop.html', text: 'Workshops' },
            { href: 'promotion.html', text: 'Promotions' }
        ];
        activityLinks.forEach(link => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = link.href;
            a.textContent = link.text;
            li.appendChild(a);
            activitiesDropdown.appendChild(li);
        });
    }

    // --- Searchable Dropdown with Autofill ---
    
    function makeDropdownSearchable(selectElement) {
        const wrapper = document.createElement('div');
        wrapper.className = 'searchable-dropdown';
        selectElement.parentNode.insertBefore(wrapper, selectElement);
        wrapper.appendChild(selectElement);
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'dropdown-search-input';
        searchInput.placeholder = selectElement.options[0]?.text || 'Select...';
        
        const dropdownList = document.createElement('div');
        dropdownList.className = 'dropdown-list';
        
        wrapper.insertBefore(searchInput, selectElement);
        wrapper.appendChild(dropdownList);
        
        // Hide original select
        selectElement.style.display = 'none';
        
        let allOptions = Array.from(selectElement.options).slice(1); // Skip first "Select..." option
        
        function renderOptions(options) {
            dropdownList.innerHTML = '';
            if (options.length === 0) {
                const noResultsItem = document.createElement('div');
                noResultsItem.className = 'dropdown-item no-results';
                noResultsItem.textContent = 'No results found';
                dropdownList.appendChild(noResultsItem);
            } else {
                options.forEach(option => {
                    const item = document.createElement('div');
                    item.className = 'dropdown-item';
                    item.textContent = option.text;
                    item.dataset.value = option.value;
                    
                    item.addEventListener('click', () => {
                        selectElement.value = option.value;
                        searchInput.value = option.text;
                        dropdownList.classList.remove('show');
                        
                        // Trigger change event for validation
                        const event = new Event('change', { bubbles: true });
                        selectElement.dispatchEvent(event);
                    });
                    
                    dropdownList.appendChild(item);
                });
            }
            
            // Dynamically adjust dropdown height based on number of items
            const itemCount = options.length > 0 ? options.length : 1;
            const maxVisibleItems = 5;
            const itemHeight = 48; // Approximate height per item including padding
            const calculatedHeight = Math.min(itemCount, maxVisibleItems) * itemHeight;
            dropdownList.style.maxHeight = calculatedHeight + 'px';
        }
        
        searchInput.addEventListener('focus', () => {
            renderOptions(allOptions);
            dropdownList.classList.add('show');
        });
        
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allOptions.filter(option => 
                option.text.toLowerCase().includes(searchTerm)
            );
            renderOptions(filtered);
            dropdownList.classList.add('show');
        });
        
        // Autofill on blur - select most relevant match or clear
        searchInput.addEventListener('blur', (e) => {
            // Small delay to allow click events on dropdown items to fire first
            setTimeout(() => {
                const searchTerm = searchInput.value.toLowerCase().trim();
                
                if (searchTerm === '') {
                    // If empty, clear selection
                    selectElement.value = '';
                    searchInput.value = '';
                    dropdownList.classList.remove('show');
                    
                    // Trigger change event for validation
                    const event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);
                    return;
                }
                
                // Find matches
                const filtered = allOptions.filter(option => 
                    option.text.toLowerCase().includes(searchTerm)
                );
                
                if (filtered.length === 1) {
                    // Exactly one match - select it
                    selectElement.value = filtered[0].value;
                    searchInput.value = filtered[0].text;
                } else if (filtered.length > 1) {
                    // Multiple matches - find the best one (starts with search term)
                    const exactStart = filtered.find(option => 
                        option.text.toLowerCase().startsWith(searchTerm)
                    );
                    
                    if (exactStart) {
                        selectElement.value = exactStart.value;
                        searchInput.value = exactStart.text;
                    } else {
                        // No exact start match - use first filtered result
                        selectElement.value = filtered[0].value;
                        searchInput.value = filtered[0].text;
                    }
                } else {
                    // No matches - clear
                    selectElement.value = '';
                    searchInput.value = '';
                }
                
                dropdownList.classList.remove('show');
                
                // Trigger change event for validation
                const event = new Event('change', { bubbles: true });
                selectElement.dispatchEvent(event);
            }, 200);
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                dropdownList.classList.remove('show');
            }
        });
        
        // Pre-fill if select has a value
        if (selectElement.value) {
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            if (selectedOption && selectedOption.text) {
                searchInput.value = selectedOption.text;
            }
        }
        
        // Update search input when select value changes programmatically
        const observer = new MutationObserver(() => {
            if (selectElement.value) {
                const selectedOption = selectElement.options[selectElement.selectedIndex];
                if (selectedOption && selectedOption.text) {
                    searchInput.value = selectedOption.text;
                    // Trigger validation
                    const event = new Event('change', { bubbles: true });
                    selectElement.dispatchEvent(event);
                }
            } else {
                searchInput.value = '';
            }
        });
        observer.observe(selectElement, { attributes: true, attributeFilter: ['value'] });
        
        // Also listen for direct value changes
        selectElement.addEventListener('change', () => {
            if (selectElement.value) {
                const selectedOption = selectElement.options[selectElement.selectedIndex];
                if (selectedOption && selectedOption.text) {
                    searchInput.value = selectedOption.text;
                }
            } else {
                searchInput.value = '';
            }
        });
    }

    // --- Aesthetic Tooltips ---
    
    function createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        document.body.appendChild(tooltip);
        return tooltip;
    }
    
    const tooltip = createTooltip();
    
    // Add tooltip styles dynamically
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `

    `;
    document.head.appendChild(tooltipStyle);
    
    // Function to show tooltip
    function showTooltip(element, text) {
        tooltip.textContent = text;
        tooltip.classList.add('show');
        
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // Calculate position relative to viewport + scroll
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Position below the button, accounting for scroll
        let left = rect.left + scrollLeft + (rect.width / 2) - (tooltipRect.width / 2);
        let top = rect.bottom + scrollTop + 12;
        
        // Check if tooltip would go off screen horizontally
        if (left < 10) {
            left = 10;
        } else if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }
        
        // Check if tooltip would go off screen vertically (show above if needed)
        if (top + tooltipRect.height > window.innerHeight + scrollTop - 10) {
            top = rect.top + scrollTop - tooltipRect.height - 12;
            tooltip.classList.add('tooltip-above');
        } else {
            tooltip.classList.remove('tooltip-above');
        }
        
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    function hideTooltip() {
        tooltip.classList.remove('show');
    }
    
    // Add tooltips to all buttons with data-tooltip attribute
    function initializeTooltips() {
        // Define button selectors and their tooltip texts
        const tooltipConfig = [
            { selector: '.cta-button', dynamic: true }, // Hero buttons (dynamic)
            { selector: '#order-enquiry-btn', text: 'Contact us about this product' },
            { selector: '#floating-enquiry-btn', text: 'Send us an enquiry' },
            { selector: '#register-now-sidebar', text: 'Register for our workshops' },
            { selector: '.btn-register', dynamic: true }, // Workshop cards (dynamic)
            { selector: '.btn-submit', text: 'Submit your form' },
            { selector: '.btn-email', text: 'Email me' },
            { selector: '.btn-clear', text: 'Clear all fields' },
            { selector: '#edit-btn', text: 'Go back and edit' },
            { selector: '#confirm-btn', text: 'Confirm and submit' },
            { selector: '#reg-edit-btn', text: 'Go back and edit' },
            { selector: '#reg-confirm-btn', text: 'Confirm registration' },
            { selector: '.btn-contact', text: 'Chat with us on WhatsApp' },
            { selector: '.btn-view', text: 'View promotion details on Instagram' },
            { selector: '.btn-promo-contact', dynamic: true }
        ];
        
        tooltipConfig.forEach(config => {
            const elements = document.querySelectorAll(config.selector);
            elements.forEach(element => {
                element.classList.add('has-tooltip');
                
                element.addEventListener('mouseenter', function() {
                    let tooltipText = config.text;
                    
                    // Handle dynamic tooltip text
                    if (config.dynamic) {
                        if (this.classList.contains('cta-button')) {
                            tooltipText = this.textContent.includes('Shop') ? 'Browse our flower gallery' :
                                         this.textContent.includes('Explore') ? 'View workshop details' :
                                         this.textContent.includes('View') ? 'See festive decorations' :
                                         'Click to explore';
                        } else if (this.classList.contains('btn-register')) {
                            const workshopName = this.closest('.workshop-item')?.querySelector('h3')?.textContent || 'workshop';
                            tooltipText = `Register for ${workshopName}`;
                        } else if (this.classList.contains('btn-promo-contact')) {
                            const promoName = this.closest('.promotion-card')?.querySelector('h3')?.textContent || 'promotion';
                            tooltipText = `Contact us about ${promoName}`;
                        }
                    }
                    
                    showTooltip(this, tooltipText);
                });
                
                element.addEventListener('mouseleave', hideTooltip);
                
                // Hide tooltip when clicking
                element.addEventListener('click', hideTooltip);
            });
        });
    }
    
    // Initialize tooltips after a short delay to ensure all elements are loaded
    setTimeout(initializeTooltips, 500);
    
    // Re-initialize tooltips after hero slideshow is created
    const heroObserver = new MutationObserver(() => {
        initializeTooltips();
    });
    
    if (document.querySelector('.hero-section')) {
        heroObserver.observe(document.querySelector('.hero-section'), {
            childList: true,
            subtree: true
        });
    }

    // --- Sidebar Navigation Visibility Control ---
        
    const sidebarNav = document.querySelector('.sidebar-nav');

    // Check if we are on the enhancement page
    const onEnhancementPage = window.location.pathname.includes('enhancement2.html');

    // Select the correct hero section based on the page
    let heroSectionEl = null;

    if (onEnhancementPage) {
        // On the demo page, attach the logic to the DEMO hero
        heroSectionEl = document.querySelector('.demo-hero-container');
    } else {
        // On all other pages (like index.html), attach to the MAIN hero
        heroSectionEl = document.querySelector('.hero-section:not(.demo-hero-container)');
    }

    // Now, run the logic with the *correctly selected* hero element
    if (sidebarNav && heroSectionEl) {
        
        // This flag now ONLY means "have 3 seconds passed?"
        let hasShownInitially = false; 
        
        function checkSidebarVisibility() {
            const heroBottom = heroSectionEl.offsetTop + heroSectionEl.offsetHeight;
            const scrollPosition = window.scrollY + window.innerHeight / 2;
            
            // 
            // THIS BLOCK IS NOW REMOVED.
            // The scroll listener no longer sets 'hasShownInitially' to true.
            //
            
            if (scrollPosition < heroBottom && hasShownInitially) {
                // User is in the hero section AND 3 seconds have passed
                sidebarNav.style.opacity = '0';
                sidebarNav.style.pointerEvents = 'none';
            } else {
                // User is below the hero OR the 3-second timer hasn't finished
                sidebarNav.style.opacity = '1';
                sidebarNav.style.pointerEvents = 'auto';
            }
        }
        
        // This timer is now the ONLY thing that sets the flag
        setTimeout(() => {
            hasShownInitially = true;
            checkSidebarVisibility(); // Run a check immediately after the timer
        }, 3000);
        
        // This listener will now work correctly
        window.addEventListener('scroll', checkSidebarVisibility);
    }

    // --- Hero Section Slideshow ---
    
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const slidesData = [
            {
                image: 'images/Hero image 1.jpg',
                alt: 'Beautiful flower arrangements',
                title: 'Welcome to Root Flower',
                text: 'Where every bloom tells a story',
                buttonText: 'Shop Now',
                buttonLink: '#gallery-section'
            },
            {
                image: 'images/Workshop demo.jpg',
                alt: 'Fresh wedding bouquets',
                title: 'Amazing Workshops',
                text: 'Embark on your floral journey with us',
                buttonText: 'Explore More',
                buttonLink: 'workshop.html'
            },
            {
                image: 'images/Hero image 3.jpg',
                alt: 'Seasonal decorations',
                title: 'Festive Decorations',
                text: 'Celebrate every occasion with style',
                buttonText: 'View Collections',
                buttonLink: 'product2.html'
            }
        ];

        let currentSlide = 0;
        let slideInterval;

        // Create slides container
        const slidesContainer = document.createElement('div');
        slidesContainer.className = 'slides-container';

        // Create all slides
        slidesData.forEach((slideData, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            if (index === 0) slide.classList.add('active');

            slide.innerHTML = `
                <img src="${slideData.image}" alt="${slideData.alt}">
                <div class="overlay">
                    <h2>${slideData.title}</h2>
                    <p>${slideData.text}</p>
                    <a href="${slideData.buttonLink}" class="cta-button">${slideData.buttonText}</a>
                </div>
            `;
            slidesContainer.appendChild(slide);
        });

        // Create arrow buttons
        const leftArrow = document.createElement('button');
        leftArrow.className = 'arrow left';
        leftArrow.innerHTML = '&#10094;';
        leftArrow.setAttribute('aria-label', 'Previous slide');

        const rightArrow = document.createElement('button');
        rightArrow.className = 'arrow right';
        rightArrow.innerHTML = '&#10095;';
        rightArrow.setAttribute('aria-label', 'Next slide');

        // Create indicators
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'slide-indicators';
        slidesData.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });

        // Clear existing content and append new elements
        heroSection.innerHTML = '';
        heroSection.appendChild(slidesContainer);
        heroSection.appendChild(leftArrow);
        heroSection.appendChild(rightArrow);
        heroSection.appendChild(indicatorsContainer);

        const slides = slidesContainer.querySelectorAll('.slide');
        const indicators = indicatorsContainer.querySelectorAll('.indicator');

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            indicators.forEach(indicator => indicator.classList.remove('active'));
            
            slides[index].classList.add('active');
            indicators[index].classList.add('active');
        }

        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }

        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        }

        function goToSlide(index) {
            currentSlide = index;
            showSlide(currentSlide);
            resetInterval();
        }

        function startSlideshow() {
            slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        }

        function resetInterval() {
            clearInterval(slideInterval);
            startSlideshow();
        }

        // Event listeners
        leftArrow.addEventListener('click', () => {
            prevSlide();
            resetInterval();
        });

        rightArrow.addEventListener('click', () => {
            nextSlide();
            resetInterval();
        });

        // Start auto-slideshow
        startSlideshow();

        // Pause on hover
        heroSection.addEventListener('mouseenter', () => clearInterval(slideInterval));
        heroSection.addEventListener('mouseleave', startSlideshow);
    }

    // --- Floating Button Above Footer Logic ---

    const floatingBtn = document.getElementById('floating-enquiry-btn');
    const footer = document.querySelector('.site-footer, footer');

    if (floatingBtn && footer) {
        function adjustFloatingButton() {
            const footerRect = footer.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const buttonHeight = floatingBtn.offsetHeight;
            const defaultBottom = 20; // Default bottom position in pixels
            
            // Check if footer is visible in viewport
            if (footerRect.top < viewportHeight) {
                // Footer is visible - calculate new bottom position
                const footerVisibleHeight = viewportHeight - footerRect.top;
                const newBottom = footerVisibleHeight + 20; // 20px gap above footer
                floatingBtn.style.bottom = newBottom + 'px';
            } else {
                // Footer not visible - use default position
                floatingBtn.style.bottom = defaultBottom + 'px';
            }
        }
        
        // Run on scroll and resize
        window.addEventListener('scroll', adjustFloatingButton);
        window.addEventListener('resize', adjustFloatingButton);
        
        // Initial adjustment
        adjustFloatingButton();
    }

    // --- Active Navigation Link ---
    
    const currentPage = window.location.pathname.split('/').pop();

    const navLinks = document.querySelectorAll('.nav-menu > li > a');
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });

    const dropdownLinks = document.querySelectorAll('.dropdown-menu li a');
    dropdownLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
            const parentLink = link.closest('.dropdown').querySelector('a');
            if (parentLink) {
                parentLink.classList.add('active');
            }
        }
    });

    // --- Logic for Product Pages (like product1.html) ---
    
    const orderButton = document.getElementById('hb-order-enquiry-btn');
    
    if (orderButton) {
        orderButton.addEventListener('click', function() {
            sessionStorage.setItem('enquirySubject', 'RE: Enquiry on Hand Bouquets');
            sessionStorage.setItem('enquiryType', 'products'); 
            window.location.href = 'enquiry.html';
        });
    }

    const orderButton1 = document.getElementById('cny-order-enquiry-btn');
    
    if (orderButton1) {
        orderButton1.addEventListener('click', function() {
            sessionStorage.setItem('enquirySubject', 'RE: Enquiry on CNY Decorations');
            sessionStorage.setItem('enquiryType', 'products'); 
            window.location.href = 'enquiry.html';
        });
    }
    
    // --- Logic for Floating Enquiry Button ---
    
    const floatButton = document.getElementById('floating-enquiry-btn');
    
    if (floatButton) {
        floatButton.addEventListener('click', function() {
            const enquiryType = this.dataset.enquiryType;
            const enquirySubject = this.dataset.enquirySubject;
            
            sessionStorage.setItem('enquiryType', enquiryType);
            sessionStorage.setItem('enquirySubject', enquirySubject);
            
            window.location.href = 'enquiry.html';
        });
    }
    
    // --- Logic for Workshop Page (workshop.html) ---
    
    // 1. Handle general "REGISTER NOW" button in sidebar
    const sidebarRegBtn = document.getElementById('register-now-sidebar');
    if (sidebarRegBtn) {
        sidebarRegBtn.addEventListener('click', function() {
            // No subject, just go to the page
            window.location.href = 'register.html';
        });
    }
    
    // 2. Handle specific workshop card buttons
    const workshopCardBtns = document.querySelectorAll('.workshop-item .btn-register');
    workshopCardBtns.forEach(button => {
        button.addEventListener('click', function() {
            // Get subject and value from the button's data attributes
            const subject = this.dataset.workshopSubject;
            const value = this.dataset.workshopValue; // NEW
            
            // Save to session storage
            sessionStorage.setItem('workshopSubject', subject);
            sessionStorage.setItem('workshopValue', value); // NEW
            
            // Redirect to registration page
            window.location.href = 'register.html';
        });
    });


    // --- Logic for Enquiry Page (enquiry.html) ---
    
    const enquiryForm = document.getElementById('enquiry-form');
    
    // Only run this logic if we are on the enquiry page
    if (enquiryForm) {
        
        const typeDropdown = document.getElementById('etype');
        
        // --- Populate Dropdown (Req 1.4) ---
        const enquiryOptions = [
            { value: 'products', text: 'Products' },
            { value: 'membership', text: 'Membership' },
            { value: 'workshop', text: 'Workshop' }
        ];
        enquiryOptions.forEach(option => {
            const newOption = document.createElement('option');
            newOption.value = option.value;
            newOption.textContent = option.text;
            typeDropdown.appendChild(newOption);
        });
        
        // --- Get Elements ---
        const subjectInput = document.getElementById('esubject');
        const pageHeader = document.getElementById('enquiry-page-header');
        const fname = document.getElementById('efname');
        const lname = document.getElementById('elname');
        const email = document.getElementById('eemail');
        const street = document.getElementById('estreet');
        const city = document.getElementById('ecity');
        const phone = document.getElementById('ephone');
        const enquiryTypeSelect = document.getElementById('etype');
        const comments = document.getElementById('ecomments');
        const confirmationBox = document.getElementById('confirmation-box');
        const editBtn = document.getElementById('edit-btn');
        const confirmBtn = document.getElementById('confirm-btn');
        const allFields = [fname, lname, email, street, city, phone, enquiryTypeSelect, comments];

        // --- Part 1: Pre-fill from session storage ---
        const subject = sessionStorage.getItem('enquirySubject');
        if (subject && subjectInput) {
            subjectInput.value = subject;
            sessionStorage.removeItem('enquirySubject');
        }
        const enquiryType = sessionStorage.getItem('enquiryType'); 
        if (enquiryType && typeDropdown) {                         
            typeDropdown.value = enquiryType;                      
            sessionStorage.removeItem('enquiryType');              
        }

        // --- Part 2: Auto-fill subject from dropdown (Req 1.2) ---
        if (typeDropdown && subjectInput) {
            typeDropdown.addEventListener('change', function() {
                const selectedValue = this.value; 
                if (selectedValue) {
                    const selectedText = this.options[this.selectedIndex].text;
                    subjectInput.value = 'RE: Enquiry on ' + selectedText;
                } else {
                    subjectInput.value = '';
                }
                validateField(subjectInput, requiredPattern, 'Subject');
            });
        }

        // --- Real-time Form Validation (Req 1.3) ---
        const namePattern = /^[A-Za-z\s]{1,25}$/;
        const phonePattern = /^\d{10}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const requiredPattern = /.+/; 
        
        // --- NEW VALIDATE FIELD (with inline error message) ---
        const validateField = (field, pattern, fieldName) => {
            const errorElement = document.getElementById(field.id + '-error');
            const value = field.value.trim();
            
            let errorMessage = null;

            if (value === '') {
                errorMessage = `Please fill in the ${fieldName}.`;
            } else if (!pattern.test(value)) {
                if (fieldName.includes('name')) errorMessage = `${fieldName} must be 1-25 letters and spaces.`;
                else if (fieldName === 'Phone') errorMessage = `${fieldName} must be a 10-digit number.`;
                else if (fieldName === 'Email') errorMessage = `${fieldName} must be a valid email address.`;
                else errorMessage = `${fieldName} has an invalid format.`;
            }

            if (errorMessage) {
                field.classList.add('is-invalid');
                field.classList.remove('is-valid');
                if (errorElement) errorElement.textContent = errorMessage;
                return errorMessage;
            } else {
                field.classList.add('is-valid');
                field.classList.remove('is-invalid');
                if (errorElement) errorElement.textContent = '';
                return null;
            }
        };
        
        // --- NEW VALIDATE SELECT (with inline error message) ---
        const validateSelect = (field, fieldName) => {
            const errorElement = document.getElementById(field.id + '-error');
            
            if (field.value === '') {
                const errorMessage = `Please select a ${fieldName}.`;
                field.classList.add('is-invalid');
                field.classList.remove('is-valid');
                if (errorElement) errorElement.textContent = errorMessage;
                return errorMessage;
            } else {
                field.classList.add('is-valid');
                field.classList.remove('is-invalid');
                if (errorElement) errorElement.textContent = '';
                return null;
            }
        };
        
        // --- UPDATE EVENT LISTENERS ---
        fname.addEventListener('input', () => validateField(fname, namePattern, 'First name'));
        lname.addEventListener('input', () => validateField(lname, namePattern, 'Last name'));
        email.addEventListener('input', () => validateField(email, emailPattern, 'Email'));
        street.addEventListener('input', () => validateField(street, requiredPattern, 'Street'));
        city.addEventListener('input', () => validateField(city, requiredPattern, 'City'));
        phone.addEventListener('input', () => validateField(phone, phonePattern, 'Phone'));
        comments.addEventListener('input', () => validateField(comments, requiredPattern, 'Comments'));
        enquiryTypeSelect.addEventListener('change', () => validateSelect(enquiryTypeSelect, 'enquiry type'));
        subjectInput.addEventListener('input', () => validateField(subjectInput, requiredPattern, 'Subject'));

        // --- Main submit handler ---
        enquiryForm.addEventListener('submit', function(event) {
            event.preventDefault();
            let errors = [];
            let firstErrorField = null;
            let errorMsg; // Variable to hold the error message

            // Check each field and store the message if one exists
            errorMsg = validateField(fname, namePattern, 'First name');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = fname; }

            errorMsg = validateField(lname, namePattern, 'Last name');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = lname; }

            errorMsg = validateField(email, emailPattern, 'Email');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = email; }

            errorMsg = validateField(street, requiredPattern, 'Street');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = street; }

            errorMsg = validateField(city, requiredPattern, 'City');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = city; }

            errorMsg = validateField(phone, phonePattern, 'Phone');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = phone; }

            errorMsg = validateSelect(enquiryTypeSelect, 'enquiry type');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = enquiryTypeSelect; }

            errorMsg = validateField(subjectInput, requiredPattern, 'Subject');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = subjectInput; }

            errorMsg = validateField(comments, requiredPattern, 'Comments');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = comments; }


            if (errors.length > 0) {
                // --- THIS IS THE NEW ALERT ---
                // Join all error messages with a newline character
                const errorString = "Please fix the following errors:\n- " + errors.join('\n- ');
                alert(errorString);
                
                if (firstErrorField) firstErrorField.focus();
            } else {
                // --- Success logic (unchanged) ---
                document.getElementById('conf-name').textContent = `${fname.value} ${lname.value}`;
                document.getElementById('conf-email').textContent = email.value;
                document.getElementById('conf-phone').textContent = phone.value;
                document.getElementById('conf-address').textContent = `${street.value}, ${city.value}`;
                document.getElementById('conf-type').textContent = enquiryTypeSelect.options[enquiryTypeSelect.selectedIndex].text;
                document.getElementById('conf-subject').textContent = subjectInput.value || 'N/A';
                document.getElementById('conf-comments').textContent = comments.value;
                
                pageHeader.style.display = 'none';
                enquiryForm.style.display = 'none';
                confirmationBox.style.display = 'block';
                window.scrollTo(0, 0);
            }
        });

        // --- Confirmation Button Handlers ---
        editBtn.addEventListener('click', function() {
            confirmationBox.style.display = 'none';
            enquiryForm.style.display = 'block';
            pageHeader.style.display = 'block';
        });

        confirmBtn.addEventListener('click', function() {
            alert('Enquiry submitted successfully!');
            enquiryForm.reset();
            
            // Clear all validation classes
            allFields.forEach(field => field.classList.remove('is-valid'));
            
            // Clear all inline error messages
            const errorMessages = enquiryForm.querySelectorAll('.form-error');
            errorMessages.forEach(errorDiv => errorDiv.textContent = '');
            
            if(subjectInput) subjectInput.value = '';
            confirmationBox.style.display = 'none';
            enquiryForm.style.display = 'block';
            pageHeader.style.display = 'block';
            window.scrollTo(0, 0);
        });
    }


    // --- Logic for Registration Page (register.html) ---
    
    const registrationForm = document.getElementById('registration-form');
    
    // Only run this logic if we are on the registration page
    if (registrationForm) {
        
        // --- Get Elements ---
        const pageHeader = document.getElementById('register-page-header');
        const fname = document.getElementById('firstName');
        const lname = document.getElementById('lastName');
        const email = document.getElementById('email');
        const street = document.getElementById('streetAddress');
        const city = document.getElementById('city');
        const state = document.getElementById('state');
        const postcode = document.getElementById('postcode');
        const phone = document.getElementById('phone');
        const workshopDate = document.getElementById('workshopDate');
        const participants = document.getElementById('participants');
        const workshopType = document.getElementById('workshopType');
        const workshopSubject = document.getElementById('workshopSubject');
        const experienceLevel = document.getElementById('experienceLevel');
        const comments = document.getElementById('comments');
        const terms = document.getElementById('terms');
        
        const confirmationBox = document.getElementById('reg-confirmation-box');
        const editBtn = document.getElementById('reg-edit-btn');
        const confirmBtn = document.getElementById('reg-confirm-btn');
        
        const allFields = [fname, lname, email, street, city, state, postcode, phone, workshopDate, participants, workshopType, workshopSubject, experienceLevel, comments];

        // --- Populate State Dropdown ---
        const stateOptions = [
            { value: 'johor', text: 'Johor' },
            { value: 'kedah', text: 'Kedah' },
            { value: 'kelantan', text: 'Kelantan' },
            { value: 'malacca', text: 'Malacca' },
            { value: 'negeri-sembilan', text: 'Negeri Sembilan' },
            { value: 'pahang', text: 'Pahang' },
            { value: 'penang', text: 'Penang' },
            { value: 'perak', text: 'Perak' },
            { value: 'perlis', text: 'Perlis' },
            { value: 'sabah', text: 'Sabah' },
            { value: 'sarawak', text: 'Sarawak' },
            { value: 'selangor', text: 'Selangor' },
            { value: 'terengganu', text: 'Terengganu' },
            { value: 'kuala-lumpur', text: 'Kuala Lumpur' },
            { value: 'labuan', text: 'Labuan' },
            { value: 'putrajaya', text: 'Putrajaya' }
        ];
        stateOptions.forEach(option => {
            const newOption = document.createElement('option');
            newOption.value = option.value;
            newOption.textContent = option.text;
            state.appendChild(newOption);
        });

        // --- Populate Experience Level Dropdown ---
        const experienceOptions = [
            { value: 'beginner', text: 'Complete Beginner' },
            { value: 'some-experience', text: 'Some Experience' },
            { value: 'intermediate', text: 'Intermediate' },
            { value: 'advanced', text: 'Advanced' }
        ];
        experienceOptions.forEach(option => {
            const newOption = document.createElement('option');
            newOption.value = option.value;
            newOption.textContent = option.text;
            experienceLevel.appendChild(newOption);
        });

        // --- Populate Workshop Dropdown ---
        const workshopOptions = [
            { value: 'hand-tied-bouquet', text: 'Hand-tied Bouquet' },
            { value: 'advanced-technique', text: 'Advanced Technique' },
            { value: 'beginners-basics', text: 'Beginner\'s Basics' },
            { value: 'hobby-class', text: 'Hobby Class' }
        ];
        workshopOptions.forEach(option => {
            const newOption = document.createElement('option');
            newOption.value = option.value;
            newOption.textContent = option.text;
            workshopType.appendChild(newOption);
        });

        // --- Apply Searchable Dropdowns ---
        makeDropdownSearchable(state);
        makeDropdownSearchable(experienceLevel);
        makeDropdownSearchable(workshopType);
        
        // --- Real-time Validation ---
        const namePattern = /^[A-Za-z\s]{1,25}$/;
        const phonePattern = /^\d{10}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const postcodePattern = /^\d{5}$/;
        const datePattern = /^\d{4}-\d{2}-\d{2}$/; // Basic YYYY-MM-DD check
        const participantsPattern = /^\d{1,2}$/; // 1-2 digits
        const requiredPattern = /.+/; // Not empty

        // --- NEW VALIDATE FIELD (with inline error message) ---
        const validateField = (field, pattern, fieldName, notRequired = false) => {
            const errorElement = document.getElementById(field.id + '-error');
            const value = field.value.trim();

            if (value === '' && notRequired) { // Field is optional and empty
                 field.classList.remove('is-valid', 'is-invalid');
                 if (errorElement) errorElement.textContent = '';
                 return null; // Not an error
            }
            
            let errorMessage = null; // Store the error message

            if (value === '') {
                errorMessage = `Please fill in the ${fieldName}.`;
            } else if (!pattern.test(value)) {
                // Give specific pattern messages
                if (fieldName.includes('name')) errorMessage = `${fieldName} must be 1-25 letters and spaces.`;
                else if (fieldName === 'Phone') errorMessage = `${fieldName} must be a 10-digit number.`;
                else if (fieldName === 'Email') errorMessage = `${fieldName} must be a valid email address.`;
                else if (fieldName === 'Postcode') errorMessage = `${fieldName} must be a 5-digit number.`;
                else if (fieldName === 'Preferred Workshop Date') errorMessage = `${fieldName} must be in YYYY-MM-DD format.`;
                else if (fieldName === 'Participants') errorMessage = `${fieldName} must be 1 or 2 digits.`;
                else errorMessage = `${fieldName} has an invalid format.`;
            }

            if (errorMessage) {
                field.classList.add('is-invalid');
                field.classList.remove('is-valid');
                if (errorElement) errorElement.textContent = errorMessage;
                return errorMessage; // Return the message for the alert
            } else {
                field.classList.add('is-valid');
                field.classList.remove('is-invalid');
                if (errorElement) errorElement.textContent = '';
                return null; // No error
            }
        };
        
        // --- NEW VALIDATE SELECT (with inline error message) ---
        const validateSelect = (field, fieldName, notRequired = false) => {
            const errorElement = document.getElementById(field.id + '-error');

            if (field.value === '' && notRequired) {
                 field.classList.remove('is-valid', 'is-invalid');
                 if (errorElement) errorElement.textContent = '';
                 return null; // Not an error
            }
            
            if (field.value === '') {
                const errorMessage = `Please select a ${fieldName}.`;
                field.classList.add('is-invalid');
                field.classList.remove('is-valid');
                if (errorElement) errorElement.textContent = errorMessage;
                return errorMessage;
            } else {
                field.classList.add('is-valid');
                field.classList.remove('is-invalid');
                if (errorElement) errorElement.textContent = '';
                return null;
            }
        };

        // --- NEW VALIDATE CHECKBOX (with inline error message) ---
        const validateCheckbox = (field, fieldName) => {
             const errorElement = document.getElementById(field.id + '-error');
             const label = field.nextElementSibling; // Get the label to style it

             if (!field.checked) {
                const errorMessage = `You must agree to the ${fieldName}.`;
                if (label) {
                    label.classList.add('is-invalid');
                    label.classList.remove('is-valid');
                }
                if (errorElement) errorElement.textContent = errorMessage;
                return errorMessage;
             } else {
                if (label) {
                    label.classList.add('is-valid');
                    label.classList.remove('is-invalid');
                }
                if (errorElement) errorElement.textContent = '';
                return null;
             }
        };

        // --- Pre-fill Subject AND Type (from workshop.html) ---
        const regSubject = sessionStorage.getItem('workshopSubject');
        if (regSubject && workshopSubject) {
            workshopSubject.value = regSubject;
            sessionStorage.removeItem('workshopSubject');
            // --- ADD THIS ---
            validateField(workshopSubject, requiredPattern, 'Subject');
        }
        
        const regValue = sessionStorage.getItem('workshopValue'); // NEW
        if (regValue && workshopType) { // NEW
            workshopType.value = regValue; // NEW
            // Update the visible search input field
            const searchInput = workshopType.parentElement.querySelector('.dropdown-search-input');
            if (searchInput && workshopType.value) {
                const selectedOption = workshopType.options[workshopType.selectedIndex];
                if (selectedOption) {
                    searchInput.value = selectedOption.text;
                }
            }
            // --- FIX: Use validateSelect for a dropdown ---
            validateSelect(workshopType, 'Workshop Type'); 
        }
        
        // --- Auto-fill Subject from Dropdown ---
        workshopType.addEventListener('change', function() {
            if (this.value) {
                const selectedText = this.options[this.selectedIndex].text;
                workshopSubject.value = 'RE: Registration for ' + selectedText;
            } else {
                workshopSubject.value = '';
            }
            validateField(workshopSubject, requiredPattern, 'Subject');
        });
        
        // --- UPDATE EVENT LISTENERS ---
        fname.addEventListener('input', () => validateField(fname, namePattern, 'First name'));
        lname.addEventListener('input', () => validateField(lname, namePattern, 'Last name'));
        email.addEventListener('input', () => validateField(email, emailPattern, 'Email'));
        street.addEventListener('input', () => validateField(street, requiredPattern, 'Street Address'));
        city.addEventListener('input', () => validateField(city, requiredPattern, 'City'));
        state.addEventListener('change', () => validateSelect(state, 'State'));
        postcode.addEventListener('input', () => validateField(postcode, postcodePattern, 'Postcode'));
        phone.addEventListener('input', () => validateField(phone, phonePattern, 'Phone'));
        workshopDate.addEventListener('input', () => validateField(workshopDate, datePattern, 'Preferred Workshop Date'));
        participants.addEventListener('input', () => validateField(participants, participantsPattern, 'Participants'));
        workshopType.addEventListener('change', () => validateSelect(workshopType, 'Workshop Type'));
        workshopSubject.addEventListener('input', () => validateField(workshopSubject, requiredPattern, 'Subject'));
        experienceLevel.addEventListener('change', () => validateSelect(experienceLevel, 'Experience Level'));
        comments.addEventListener('input', () => validateField(comments, requiredPattern, 'Comments'));
        terms.addEventListener('change', () => validateCheckbox(terms, 'terms and conditions'));
        
        // --- Main Submit Handler ---
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            let errors = [];
            let firstErrorField = null;
            let errorMsg; // Variable to hold the error message

            // Check each field and store the message if one exists
            errorMsg = validateField(fname, namePattern, 'First name');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = fname; }

            errorMsg = validateField(lname, namePattern, 'Last name');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = lname; }

            errorMsg = validateField(email, emailPattern, 'Email');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = email; }

            errorMsg = validateField(street, requiredPattern, 'Street Address');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = street; }

            errorMsg = validateField(city, requiredPattern, 'City');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = city; }

            errorMsg = validateSelect(state, 'State');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = state; }

            errorMsg = validateField(postcode, postcodePattern, 'Postcode');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = postcode; }

            errorMsg = validateField(phone, phonePattern, 'Phone');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = phone; }

            errorMsg = validateField(workshopDate, datePattern, 'Preferred Workshop Date');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = workshopDate; }

            errorMsg = validateField(participants, participantsPattern, 'Participants');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = participants; }

            errorMsg = validateSelect(workshopType, 'Workshop Type');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = workshopType; }

            //errorMsg = validateField(workshopSubject, requiredPattern, 'Subject');
            //if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = workshopSubject; }

            errorMsg = validateCheckbox(terms, 'terms and conditions');
            if (errorMsg) { errors.push(errorMsg); if (!firstErrorField) firstErrorField = terms; }
            
            // Validate optional fields one last time (this is fine, they won't add errors)
            validateSelect(experienceLevel, 'Experience Level');
            validateField(comments, requiredPattern, 'Comments', true);

            if (errors.length > 0) {
                // --- THIS IS THE NEW ALERT ---
                // Join all error messages with a newline character
                const errorString = "Please fix the following errors:\n- " + errors.join('\n- ');
                alert(errorString);

                if (firstErrorField) firstErrorField.focus();
            } else {
                // --- Success logic (unchanged) ---
                document.getElementById('reg-conf-name').textContent = `${fname.value} ${lname.value}`;
                document.getElementById('reg-conf-email').textContent = email.value;
                document.getElementById('reg-conf-phone').textContent = phone.value;
                document.getElementById('reg-conf-address').textContent = `${street.value}, ${city.value}, ${state.value} ${postcode.value}`;
                document.getElementById('reg-conf-workshop').textContent = workshopType.value ? workshopType.options[workshopType.selectedIndex].text : 'N/A';
                document.getElementById('reg-conf-subject').textContent = workshopSubject.value || 'N/A';
                document.getElementById('reg-conf-date').textContent = workshopDate.value;
                document.getElementById('reg-conf-participants').textContent = participants.value;
                document.getElementById('reg-conf-comments').textContent = comments.value || 'None';
                
                pageHeader.style.display = 'none';
                registrationForm.style.display = 'none';
                confirmationBox.style.display = 'block';
                window.scrollTo(0, 0);
            }
        });

        // --- Confirmation Button Handlers ---
        editBtn.addEventListener('click', function() {
            confirmationBox.style.display = 'none';
            registrationForm.style.display = 'block';
            pageHeader.style.display = 'block';
        });

        confirmBtn.addEventListener('click', function() {
            alert('Registration submitted successfully!');
            registrationForm.reset();
            allFields.forEach(field => field.classList.remove('is-valid', 'is-invalid'));
            terms.nextElementSibling.classList.remove('is-valid', 'is-invalid');
            if(workshopSubject) workshopSubject.value = '';
            confirmationBox.style.display = 'none';
            registrationForm.style.display = 'block';
            pageHeader.style.display = 'block';
            window.scrollTo(0, 0);
        });
    }

    // ========================================
    // DEMO-SPECIFIC LOGIC FOR ENHANCEMENT2.HTML
    // ========================================

    // Check if we're on the enhancement2.html page
    const isEnhancement2Page = window.location.pathname.includes('enhancement2.html');
    
    if (isEnhancement2Page) {
        
        // Demo Slideshow (Enhancement 1)
        let demoCurrentSlide = 0;
        const demoSlides = document.querySelectorAll('.demo-slide');
        const demoIndicators = document.querySelectorAll('#demoSlideshow .indicator');
        let demoSlideInterval;

        if (demoSlides.length > 0) {
            function showDemoSlide(index) {
                demoSlides.forEach(slide => slide.classList.remove('active'));
                demoIndicators.forEach(indicator => indicator.classList.remove('active'));
                demoSlides[index].classList.add('active');
                demoIndicators[index].classList.add('active');
            }

            function nextDemoSlide() {
                demoCurrentSlide = (demoCurrentSlide + 1) % demoSlides.length;
                showDemoSlide(demoCurrentSlide);
            }

            function startDemoSlideshow() {
                demoSlideInterval = setInterval(nextDemoSlide, 3000);
            }

            demoIndicators.forEach(indicator => {
                indicator.addEventListener('click', function() {
                    demoCurrentSlide = parseInt(this.dataset.slide);
                    showDemoSlide(demoCurrentSlide);
                    clearInterval(demoSlideInterval);
                    startDemoSlideshow();
                });
            });

            startDemoSlideshow();
        }

        // Auto-fill Demo (Enhancement 3)
        const demoAutofillBtn = document.getElementById('demoAutofillBtn');
        if (demoAutofillBtn) {
            demoAutofillBtn.addEventListener('click', function() {
                const select = document.getElementById('demoWorkshopType');
                const subject = document.getElementById('demoSubject');
                select.value = 'beginners-basics';
                subject.value = "RE: Registration for Beginner's Basics";
                select.style.borderColor = '#28a745';
                subject.style.borderColor = '#28a745';
                setTimeout(() => {
                    select.style.borderColor = '#ddd';
                    subject.style.borderColor = '#ddd';
                }, 2000);
            });
        }

        // Searchable Dropdown Demo (Enhancement 4)
        const demoStateDropdown = document.getElementById('demoStateDropdown');
        if (demoStateDropdown) {
            makeDropdownSearchable(demoStateDropdown);
        }

        // Form Validation Demo (Enhancement 5)
        const demoForm = document.getElementById('demoValidationForm');
        if (demoForm) {
            const namePattern = /^[A-Za-z\s]{1,25}$/;
            const phonePattern = /^\d{10}$/;
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            const demoName = document.getElementById('demoName');
            const demoEmail = document.getElementById('demoEmail');
            const demoPhone = document.getElementById('demoPhone');
            
            function validateDemoField(field, pattern, fieldName) {
                const errorElement = document.getElementById(field.id + '-error');
                const value = field.value.trim();
                
                let errorMessage = null;
                if (value === '') {
                    errorMessage = `Please fill in the ${fieldName}.`;
                } else if (!pattern.test(value)) {
                    if (fieldName.includes('Name')) {
                        errorMessage = `${fieldName} must be 1-25 letters and spaces.`;
                    } else if (fieldName === 'Phone') {
                        errorMessage = `${fieldName} must be a 10-digit number.`;
                    } else if (fieldName === 'Email') {
                        errorMessage = `${fieldName} must be a valid email address.`;
                    }
                }
                
                if (errorMessage) {
                    field.classList.add('is-invalid');
                    field.classList.remove('is-valid');
                    errorElement.textContent = errorMessage;
                    return errorMessage;
                } else {
                    field.classList.add('is-valid');
                    field.classList.remove('is-invalid');
                    errorElement.textContent = '';
                    return null;
                }
            }
            
            demoName.addEventListener('input', () => 
                validateDemoField(demoName, namePattern, 'First Name')
            );
            demoEmail.addEventListener('input', () => 
                validateDemoField(demoEmail, emailPattern, 'Email')
            );
            demoPhone.addEventListener('input', () => 
                validateDemoField(demoPhone, phonePattern, 'Phone')
            );
            
            demoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                let errors = [];
                
                let err1 = validateDemoField(demoName, namePattern, 'First Name');
                if (err1) errors.push(err1);
                
                let err2 = validateDemoField(demoEmail, emailPattern, 'Email');
                if (err2) errors.push(err2);
                
                let err3 = validateDemoField(demoPhone, phonePattern, 'Phone');
                if (err3) errors.push(err3);
                
                if (errors.length > 0) {
                    alert("Please fix the following errors:\n- " + errors.join('\n- '));
                } else {
                    alert('Form validated successfully!');
                }
            });
        }

        // Sidebar Auto-hide Demo (Enhancement 7)
        let hasShownSidebar = false;
        const demoSidebar = document.getElementById('demoSidebar');
        const pageHeader = document.querySelector('.page-header');
        
        if (demoSidebar && pageHeader) {
            function checkSidebarDemo() {
                const headerBottom = pageHeader.offsetTop + pageHeader.offsetHeight;
                const scrollPosition = window.scrollY + window.innerHeight / 2;
                
                if (window.scrollY > 200) {
                    hasShownSidebar = true;
                }
                
                if (scrollPosition < headerBottom && hasShownSidebar) {
                    demoSidebar.classList.add('hidden');
                } else {
                    demoSidebar.classList.remove('hidden');
                }
            }
            
            setTimeout(() => {
                hasShownSidebar = true;
                checkSidebarDemo();
            }, 3000);
            
            window.addEventListener('scroll', checkSidebarDemo);
        }
    }
});