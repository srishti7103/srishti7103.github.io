/**
 * MEHEK & YOGESH — WEDDING INVITATION MASTER JS ENGINE
 * Photorealistic Slow Skywriting Cloud Engine · Single Golden Helicopter · Royal Calligraphy
 */

(function () {
    'use strict';

    /* ---- 1. Page Load Initialization ---- */
    window.addEventListener('DOMContentLoaded', () => {
        initCinematicSkyIntro();
        initPetalsCanvas();
        initCountdown();
        initHeaderNav();
        initAudioEngine();
        initCalligraphyTyping();
        initRSVPHandler();
        initSmoothHelicopterFlight();
    });

    /* =========================================================================
       ACT 1: PHOTOREALISTIC SLOW SKYWRITING CLOUD HEART (SINGLE HELICOPTER)
       ========================================================================= */
    function initCinematicSkyIntro() {
        const overlay = document.getElementById('sky-intro-overlay');
        const smokeCanvas = document.getElementById('sky-smoke-canvas');
        const cloudsCanvas = document.getElementById('sky-clouds-canvas');
        const introHeli = document.getElementById('sky-intro-heli');
        const heartContent = document.getElementById('sky-heart-content');
        const titleTypeEl = document.getElementById('sky-title-type');
        const dateTypeEl = document.getElementById('sky-date-type');

        if (!overlay || !smokeCanvas || !introHeli) return;

        let isOpened = false;
        let smokeCtx = smokeCanvas.getContext('2d');
        let cloudsCtx = cloudsCanvas ? cloudsCanvas.getContext('2d') : null;

        let width = (smokeCanvas.width = cloudsCanvas.width = window.innerWidth);
        let height = (smokeCanvas.height = cloudsCanvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            width = smokeCanvas.width = cloudsCanvas.width = window.innerWidth;
            height = smokeCanvas.height = cloudsCanvas.height = window.innerHeight;
        });

        // Pre-render 3 slimmer, delicate, organic cloud puff sprites
        const puffSprites = [];
        const spriteConfigs = [
            { r: 26, a1: 0.52, a2: 0.24, a3: 0 },
            { r: 34, a1: 0.42, a2: 0.18, a3: 0 },
            { r: 42, a1: 0.32, a2: 0.12, a3: 0 }
        ];

        spriteConfigs.forEach(cfg => {
            const c = document.createElement('canvas');
            c.width = cfg.r * 2;
            c.height = cfg.r * 2;
            const ctx = c.getContext('2d');
            const grad = ctx.createRadialGradient(cfg.r, cfg.r, 0, cfg.r, cfg.r, cfg.r);
            grad.addColorStop(0, `rgba(255, 255, 255, ${cfg.a1})`);
            grad.addColorStop(0.42, `rgba(248, 252, 255, ${cfg.a2})`);
            grad.addColorStop(0.85, 'rgba(235, 246, 255, 0.06)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(cfg.r, cfg.r, cfg.r, 0, Math.PI * 2);
            ctx.fill();
            puffSprites.push({ canvas: c, radius: cfg.r });
        });

        // Stamp slimmer, feathery cloud vapor
        function stampRealisticCloudPuff(x, y, scale = 1) {
            const sprite = puffSprites[Math.floor(Math.random() * puffSprites.length)];
            const offsetX = (Math.random() - 0.5) * 6;
            const offsetY = (Math.random() - 0.5) * 6;
            const r = sprite.radius * (0.85 + Math.random() * 0.3) * scale;
            
            smokeCtx.save();
            smokeCtx.globalAlpha = 0.52;
            smokeCtx.drawImage(sprite.canvas, x + offsetX - r, y + offsetY - r, r * 2, r * 2);
            smokeCtx.restore();
        }

        // Soft, gentle ambient clouds drifting in the sunny blue sky
        const ambientClouds = [];
        for (let i = 0; i < 10; i++) {
            ambientClouds.push({
                x: Math.random() * width,
                y: Math.random() * (height * 0.8),
                radiusX: 110 + Math.random() * 140,
                radiusY: 55 + Math.random() * 70,
                vx: 0.12 + Math.random() * 0.16,
                alpha: 0.14 + Math.random() * 0.14
            });
        }

        function drawAmbientClouds() {
            if (!cloudsCtx) return;
            cloudsCtx.clearRect(0, 0, width, height);

            ambientClouds.forEach(c => {
                c.x += c.vx;
                if (c.x - c.radiusX > width) {
                    c.x = -c.radiusX;
                    c.y = Math.random() * (height * 0.8);
                }

                cloudsCtx.save();
                cloudsCtx.translate(c.x, c.y);
                const grad = cloudsCtx.createRadialGradient(0, 0, 0, 0, 0, c.radiusX);
                grad.addColorStop(0, `rgba(255, 255, 255, ${c.alpha})`);
                grad.addColorStop(0.55, `rgba(235, 245, 255, ${c.alpha * 0.5})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

                cloudsCtx.fillStyle = grad;
                cloudsCtx.beginPath();
                cloudsCtx.scale(1, c.radiusY / c.radiusX);
                cloudsCtx.arc(0, 0, c.radiusX, 0, Math.PI * 2);
                cloudsCtx.fill();
                cloudsCtx.restore();
            });
        }

        // Parametric Heart Formula
        function getHeartPoint(t, cx, cy, scale) {
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            return {
                x: cx + x * scale,
                y: cy + y * scale
            };
        }

        let startTime = null;
        let isHeartCompleted = false;
        let isTypingStarted = false;

        // Slow, calm, realistic aviation timing
        const enterDuration = 2000; // Smooth entry from far left (NO CLOUDS ON ENTRY)
        const heartDuration = 8800; // Slow, majestic single-loop heart drawing
        const exitDuration = 2400;  // Soar away to top right

        function renderSkyIntro(timestamp) {
            if (isOpened) return;
            if (!startTime) startTime = timestamp;

            const elapsed = timestamp - startTime;
            drawAmbientClouds();

            const cx = width / 2;
            const cy = height * 0.46;
            // Larger, more spacious heart
            const scale = Math.min(width, height) * 0.024;

            const topCusp = getHeartPoint(0, cx, cy, scale);

            if (elapsed < enterDuration) {
                // PHASE 1: Clean, silent entry from left horizon towards top cusp (NO SMOKE EMITTED)
                const p = elapsed / enterDuration;
                const easeP = p * p * (3 - 2 * p);

                const startX = -120;
                const startY = topCusp.y - 40;

                const currX = startX + (topCusp.x - startX) * easeP;
                const currY = startY + (topCusp.y - startY) * easeP;

                const angle = Math.atan2(topCusp.y - startY, topCusp.x - startX);
                const pitch = Math.max(-0.35, Math.min(0.35, angle * 0.4));

                // Golden helicopter faces left naturally; scaleX(-1) turns nose forward (right)
                introHeli.style.transform = `translate3d(${currX}px, ${currY}px, 0) translate(-50%, -50%) scaleX(-1) rotate(${pitch}rad)`;

            } else if (elapsed < enterDuration + heartDuration) {
                // PHASE 2: SLOW, MAJESTIC CONTINUOUS SINGLE-LOOP HEART
                const heartProgress = (elapsed - enterDuration) / heartDuration;
                const t = heartProgress * 2 * Math.PI;

                const pos = getHeartPoint(t, cx, cy, scale);
                const nextT = t + 0.035;
                const nextPos = getHeartPoint(nextT, cx, cy, scale);
                const dx = nextPos.x - pos.x;
                const dy = nextPos.y - pos.y;

                if (dx >= 0) {
                    // Flying towards Right (East): Flip sprite so nose points Right, pitch based on dy/dx
                    const pitch = Math.max(-0.38, Math.min(0.38, Math.atan2(dy, dx)));
                    introHeli.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scaleX(-1) rotate(${pitch}rad)`;
                } else {
                    // Flying towards Left (West): Normal sprite orientation (nose points Left), pitch based on dy/-dx
                    const pitch = Math.max(-0.38, Math.min(0.38, Math.atan2(dy, -dx)));
                    introHeli.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%) scaleX(1) rotate(${pitch}rad)`;
                }

                // Stamp slim, feathery, soft cloud vapor
                stampRealisticCloudPuff(pos.x, pos.y, 0.9);

            } else if (elapsed < enterDuration + heartDuration + exitDuration) {
                // PHASE 3: Complete loop, climb gracefully towards upper-right sky
                const exitProgress = (elapsed - (enterDuration + heartDuration)) / exitDuration;
                const easeExit = exitProgress * exitProgress;

                const exitStartX = topCusp.x;
                const exitStartY = topCusp.y;
                const exitTargetX = width + 180;
                const exitTargetY = -120;

                const currX = exitStartX + (exitTargetX - exitStartX) * exitProgress;
                const currY = exitStartY + (exitTargetY - exitStartY) * easeExit;

                const exitAngle = Math.atan2(exitTargetY - exitStartY, exitTargetX - exitStartX);
                const pitch = Math.max(-0.35, Math.min(0.35, exitAngle * 0.45));

                introHeli.style.transform = `translate3d(${currX}px, ${currY}px, 0) translate(-50%, -50%) scaleX(-1) rotate(${pitch}rad)`;

                if (!isHeartCompleted) {
                    isHeartCompleted = true;
                    startCloudHeartTyping();
                }

            } else {
                introHeli.style.opacity = '0';

                if (!isHeartCompleted) {
                    isHeartCompleted = true;
                    startCloudHeartTyping();
                }
            }

            requestAnimationFrame(renderSkyIntro);
        }

        requestAnimationFrame(renderSkyIntro);

        // Royal Calligraphy Typing inside the spacious, hollow cloud heart
        function startCloudHeartTyping() {
            if (isTypingStarted) return;
            isTypingStarted = true;

            if (heartContent) heartContent.classList.add('is-revealed');
            if (smokeCanvas) smokeCanvas.classList.add('is-fading'); // Cloud heart smoothly fades away!

            const text1 = "We Are Getting Married!";
            const text2 = "12th December 2026";

            function typeString(targetEl, str, speed, callback) {
                if (!targetEl) return;
                targetEl.innerHTML = '';
                let i = 0;
                function step() {
                    if (i < str.length) {
                        targetEl.innerHTML = str.substring(0, i + 1) + '<span class="type-cursor">|</span>';
                        i++;
                        setTimeout(step, speed);
                    } else {
                        targetEl.innerHTML = str;
                        if (callback) callback();
                    }
                }
                step();
            }

            setTimeout(() => {
                typeString(titleTypeEl, text1, 45, () => {
                    typeString(dateTypeEl, text2, 40, () => {
                        // Hold completed heart & announcement for 1.6s, then smoothly glide into the website!
                        setTimeout(() => {
                            openWeddingJourney();
                        }, 1600);
                    });
                });
            }, 400);
        }

        // Open Journey: Glides directly into Meet Yogesh & Mehek!
        function openWeddingJourney() {
            if (isOpened) return;
            isOpened = true;

            overlay.classList.add('is-opened');
            document.body.classList.remove('is-intro-locked');

            if (window.recalculateFlightPath) {
                window.recalculateFlightPath();
            }

            const audioBtn = document.getElementById('audio-btn');
            if (audioBtn && window.audioEngine) {
                window.audioEngine.start();
                audioBtn.classList.add('is-playing');
            }

            triggerSiteReveals();

            setTimeout(() => {
                const coupleSec = document.getElementById('couple');
                if (coupleSec) coupleSec.scrollIntoView({ behavior: 'smooth' });
                if (window.recalculateFlightPath) window.recalculateFlightPath();
            }, 300);
        }

        // Optional tap anywhere to skip/advance immediately
        overlay.addEventListener('click', () => {
            openWeddingJourney();
        });
    }


    /* =========================================================================
       ACT 2: TOP EDITORIAL HEADER NAVIGATION
       ========================================================================= */
    function initHeaderNav() {
        const navLinks = document.querySelectorAll('.header-nav__link');
        const sections = ['couple', 'ceremonies', 'rsvp', 'details', 'blessing'];

        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY + 200;

            sections.forEach(id => {
                const sec = document.getElementById(id);
                if (!sec) return;
                const top = sec.offsetTop;
                const height = sec.offsetHeight;

                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.forEach(link => {
                        link.classList.toggle('is-active', link.getAttribute('data-section') === id);
                    });
                }
            });
        }, { passive: true });
    }

    /* =========================================================================
       ACT 3: DUAL THEMED RSVP (TEAM GROOM PILOT PASS vs TEAM BRIDE DOCTOR RX)
       ========================================================================= */
    function initRSVPHandler() {
        const confirmBtn = document.getElementById('confirm-rsvp-btn');
        const downloadTicketBtn = document.getElementById('download-pass-ticket-btn');
        const nameInput = document.getElementById('guest-name');
        const countSelect = document.getElementById('guest-count');
        const wishesInput = document.getElementById('guest-wishes');
        const rsvpForm = document.getElementById('rsvp-form');
        const confirmBox = document.getElementById('boarding-confirmation');
        const guestNameDisplay = document.getElementById('confirmed-guest-name');
        const confirmedStamp = document.getElementById('confirmed-stamp-text');
        const confirmedTitle = document.getElementById('confirmed-title-text');
        const teamGroomOpt = document.getElementById('team-groom-opt');
        const teamBrideOpt = document.getElementById('team-bride-opt');

        // Dynamic Card UI Elements for Live Real-Time Morphing
        const passCard = document.getElementById('boarding-pass-card');
        const passBrandAirline = document.getElementById('pass-brand-airline');
        const passBrandClass = document.getElementById('pass-brand-class');
        const passCodeBadge = document.getElementById('pass-code-badge');
        const stubLabel1 = document.getElementById('stub-label-1');
        const stubVal1 = document.getElementById('stub-val-1');
        const stubLabel2 = document.getElementById('stub-label-2');
        const stubVal2 = document.getElementById('stub-val-2');
        const stubGraphicContainer = document.getElementById('stub-graphic-container');
        const confirmBtnText = document.getElementById('confirm-btn-text');
        const formNameLabel = document.getElementById('form-name-label');
        const formCountLabel = document.getElementById('form-count-label');

        let lastRSVPData = null;

        // Function to smoothly morph the on-screen card in real-time
        function setCardTheme(isBride) {
            if (!passCard) return;

            if (isBride) {
                passCard.classList.remove('theme--pilot');
                passCard.classList.add('theme--doctor');

                if (passBrandAirline) passBrandAirline.innerText = "DR. MEHEK'S WELLNESS CLINIC";
                if (passBrandClass) passBrandClass.innerText = "WEDDING PRESCRIPTION (℞) · REG-2026";
                if (passCodeBadge) passCodeBadge.innerText = "11 & 12 DEC 2026 · BHOPAL";
                if (stubLabel1) stubLabel1.innerText = "PHYSICIAN";
                if (stubVal1) stubVal1.innerText = "DR. MEHEK MALIK";
                if (stubLabel2) stubLabel2.innerText = "SPECIALITY";
                if (stubVal2) stubVal2.innerText = "WEDDING CARDIOLOGY (℞)";
                if (formNameLabel) formNameLabel.innerText = "Patient / VIP Guest Name *";
                if (formCountLabel) formCountLabel.innerText = "Number of Guests *";
                if (confirmBtnText) confirmBtnText.innerText = "✦ Confirm & Download Prescription Pass ✦";

                if (stubGraphicContainer) {
                    stubGraphicContainer.innerHTML = `
                        <div style="font-size: 28px; font-family: 'Playfair Display', Georgia, serif; color: var(--dusty-rose-deep); font-weight: bold; line-height: 1; margin: 4px 0 2px;">℞</div>
                        <svg width="120" height="22" viewBox="0 0 120 22" fill="none" style="margin: 0 auto; display: block;">
                            <path d="M0,11 L35,11 L42,3 L48,19 L54,6 L60,16 L66,11 L120,11" stroke="var(--dusty-rose-deep)" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <span style="font-family: monospace; font-size: 0.62rem; color: var(--charcoal-soft); display: block; margin-top: 3px;">||| RX-2026-MED |||</span>
                    `;
                }

                if (teamBrideOpt && teamGroomOpt) {
                    teamBrideOpt.style.background = 'rgba(200,138,148,0.18)';
                    teamBrideOpt.style.borderColor = 'var(--dusty-rose-deep)';
                    teamBrideOpt.style.borderWidth = '2px';
                    teamGroomOpt.style.background = 'transparent';
                    teamGroomOpt.style.borderColor = 'rgba(27,38,64,0.3)';
                    teamGroomOpt.style.borderWidth = '1.5px';
                }
            } else {
                passCard.classList.remove('theme--doctor');
                passCard.classList.add('theme--pilot');

                if (passBrandAirline) passBrandAirline.innerText = "ROYAL WEDDING AIRWAYS";
                if (passBrandClass) passBrandClass.innerText = "FIRST CLASS · MY-2026";
                if (passCodeBadge) passCodeBadge.innerText = "12 DEC 2026 · BHOPAL";
                if (stubLabel1) stubLabel1.innerText = "GATE";
                if (stubVal1) stubVal1.innerText = "HOTEL PRIDE";
                if (stubLabel2) stubLabel2.innerText = "CLASS";
                if (stubVal2) stubVal2.innerText = "FIRST CLASS VIP";
                if (formNameLabel) formNameLabel.innerText = "Passenger / Family Name *";
                if (formCountLabel) formCountLabel.innerText = "Number of Passengers *";
                if (confirmBtnText) confirmBtnText.innerText = "✦ Confirm & Download Boarding Pass ✦";

                if (stubGraphicContainer) {
                    stubGraphicContainer.innerHTML = `
                        <div class="barcode-lines"></div>
                        <span class="barcode-number">||| 1212 2026 YM |||</span>
                    `;
                }

                if (teamBrideOpt && teamGroomOpt) {
                    teamGroomOpt.style.background = 'rgba(27,38,64,0.08)';
                    teamGroomOpt.style.borderColor = 'var(--navy-pilot)';
                    teamGroomOpt.style.borderWidth = '2px';
                    teamBrideOpt.style.background = 'transparent';
                    teamBrideOpt.style.borderColor = 'rgba(200,138,148,0.4)';
                    teamBrideOpt.style.borderWidth = '1.5px';
                }
            }
        }

        // Live Real-Time Switch on Radio Toggle
        const teamRadios = document.querySelectorAll('input[name="wedding_side"]');
        teamRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const isBride = radio.value.includes('Bride');
                setCardTheme(isBride);
            });
        });

        // Initialize with default state
        setCardTheme(false);

        // 1. RENDER TEAM GROOM AVIATION FIRST-CLASS BOARDING PASS CANVAS
        function renderGroomBoardingPassCanvas(data) {
            const canvas = document.createElement('canvas');
            const width = 1200, height = 540;
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#FAF5EE'; ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#FFFDF9'; ctx.fillRect(20, 20, width - 40, height - 40);
            ctx.strokeStyle = '#B8915A'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, width - 40, height - 40);

            // Navy Header
            ctx.fillStyle = '#1B2640'; ctx.fillRect(20, 20, width - 40, 85);
            ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(20, 105); ctx.lineTo(width - 20, 105); ctx.stroke();

            ctx.fillStyle = '#D4AF37'; ctx.font = 'bold 22px "Cinzel", Georgia, serif';
            ctx.fillText('ROYAL WEDDING AIRWAYS · FIRST CLASS BOARDING PASS', 50, 60);
            ctx.fillStyle = '#FAF5EE'; ctx.font = '14px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('SPECIAL CHARTER FLIGHT · 12TH DECEMBER 2026', 50, 85);
            ctx.fillStyle = '#D4AF37'; ctx.font = 'bold 16px monospace';
            ctx.fillText('PASS: MY-2026-VIP', width - 240, 68);

            // Passenger Name
            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 13px "Cinzel", Georgia, serif';
            ctx.fillText('PASSENGER / FAMILY NAME', 50, 150);
            ctx.fillStyle = '#1B2640'; ctx.font = 'bold 28px "Playfair Display", Georgia, serif';
            ctx.fillText(data.name || 'Honoured Guest', 50, 185);

            // Grid Details
            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 12px "Cinzel", Georgia, serif';
            ctx.fillText('FLIGHT', 50, 230);
            ctx.fillStyle = '#1B2640'; ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('MY-1212', 50, 255);

            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 12px "Cinzel", Georgia, serif';
            ctx.fillText('PASSENGERS', 190, 230);
            ctx.fillStyle = '#1B2640'; ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(`${data.passengers} Guest${data.passengers > 1 ? 's' : ''}`, 190, 255);

            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 12px "Cinzel", Georgia, serif';
            ctx.fillText('DATES', 350, 230);
            ctx.fillStyle = '#1B2640'; ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('11 & 12 DEC 2026', 350, 255);

            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 12px "Cinzel", Georgia, serif';
            ctx.fillText('DESTINATION', 560, 230);
            ctx.fillStyle = '#1B2640'; ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('HOTEL PRIDE, BHOPAL', 560, 255);

            // Ceremonies
            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 12px "Cinzel", Georgia, serif';
            ctx.fillText('CONFIRMED CEREMONIES', 50, 310);
            ctx.fillStyle = '#A76571'; ctx.font = '15px "Plus Jakarta Sans", sans-serif';
            ctx.fillText(data.ceremonies || 'All Auspicious Wedding Ceremonies', 50, 335);

            // Stamp
            ctx.save(); ctx.translate(560, 390); ctx.rotate(-0.06);
            ctx.strokeStyle = '#106636'; ctx.lineWidth = 3; ctx.strokeRect(-10, -30, 260, 50);
            ctx.fillStyle = '#106636'; ctx.font = 'bold 20px "Cinzel", Georgia, serif';
            ctx.fillText('✓ CLEARED FOR BOARDING', 0, 2);
            ctx.restore();

            // Right Stub
            ctx.strokeStyle = '#B8915A'; ctx.setLineDash([8, 6]); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(860, 105); ctx.lineTo(860, height - 20); ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 11px "Cinzel", Georgia, serif';
            ctx.fillText('GATE', 890, 150);
            ctx.fillStyle = '#1B2640'; ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('HOTEL PRIDE', 890, 175);

            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 11px "Cinzel", Georgia, serif';
            ctx.fillText('CLASS / SEAT', 890, 220);
            ctx.fillStyle = '#1B2640'; ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('FIRST CLASS VIP', 890, 245);

            // Barcode
            ctx.fillStyle = '#1B2640';
            for (let x = 890; x < 1140; x += 6) {
                const barW = (x % 12 === 0) ? 3 : ((x % 8 === 0) ? 2 : 1);
                ctx.fillRect(x, 300, barW, 60);
            }
            ctx.fillStyle = '#8A817A'; ctx.font = '11px monospace';
            ctx.fillText('||| 1212 2026 YM 01 |||', 930, 380);

            ctx.fillStyle = '#B8915A'; ctx.font = 'bold 13px "Cinzel", Georgia, serif';
            ctx.fillText('FOREVER, OUR JOURNEY · MEHEK & YOGESH', 50, 480);

            return canvas;
        }

        // 2. RENDER TEAM BRIDE DOCTOR'S PRESCRIPTION & WELLNESS PASS (℞) CANVAS
        function renderBridePrescriptionCanvas(data) {
            const canvas = document.createElement('canvas');
            const width = 1200, height = 540;
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = '#FAF5EE'; ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#FFFDF9'; ctx.fillRect(20, 20, width - 40, height - 40);
            ctx.strokeStyle = '#A76571'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, width - 40, height - 40);

            // Velvet Crimson Header
            ctx.fillStyle = '#480C14'; ctx.fillRect(20, 20, width - 40, 85);
            ctx.strokeStyle = '#D4AF37'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(20, 105); ctx.lineTo(width - 20, 105); ctx.stroke();

            ctx.fillStyle = '#D4AF37'; ctx.font = 'bold 22px "Cinzel", Georgia, serif';
            ctx.fillText("DR. MEHEK'S ROYAL WEDDING WELLNESS CLINIC", 50, 60);
            ctx.fillStyle = '#FAF5EE'; ctx.font = '14px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('OFFICIAL WEDDING WELLNESS & HEALTH PRESCRIPTION (℞)', 50, 85);
            ctx.fillStyle = '#D4AF37'; ctx.font = 'bold 16px monospace';
            ctx.fillText('REG: DR-MEHEK-2026', width - 260, 68);

            // Classic Latin Medical Symbol ℞
            ctx.fillStyle = '#A76571'; ctx.font = 'bold 44px "Playfair Display", Georgia, serif';
            ctx.fillText('℞', 50, 175);

            // Patient Name
            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 13px "Cinzel", Georgia, serif';
            ctx.fillText('PATIENT / VIP GUEST NAME', 110, 145);
            ctx.fillStyle = '#480C14'; ctx.font = 'bold 26px "Playfair Display", Georgia, serif';
            ctx.fillText(data.name || 'Honoured Guest', 110, 178);

            // Dosage & Prescribed Celebrations
            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 12px "Cinzel", Georgia, serif';
            ctx.fillText('PRESCRIBED CELEBRATION DOSAGES:', 50, 225);

            ctx.fillStyle = '#2D2622'; ctx.font = '14px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('• Dosage 1: Floral Mehendi Fiesta & Royal Tilak-Ring Traditions (11 Dec)', 50, 252);
            ctx.fillText('• Dosage 2: 100% Sangeet Cardiac Euphoria & High-BPM Dancing (11 Dec)', 50, 276);
            ctx.fillText('• Dosage 3: Pastel Haldi Radiance, Dwar Chaar, Varmala & Sacred Pheras (12 Dec)', 50, 300);
            ctx.fillText('• Dosage 4: Grand Finale Reception, Heartfelt Toasts & Lifetime Happiness (12 Dec)', 50, 324);

            // Venue & Validity
            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 12px "Cinzel", Georgia, serif';
            ctx.fillText('CLINIC LOCATION / VENUE', 50, 375);
            ctx.fillStyle = '#480C14'; ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('HOTEL PRIDE, BHOPAL', 50, 400);

            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 12px "Cinzel", Georgia, serif';
            ctx.fillText('VALIDITY DATES', 320, 375);
            ctx.fillStyle = '#480C14'; ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('11TH & 12TH DEC 2026', 320, 400);

            // Right Stub
            ctx.strokeStyle = '#A76571'; ctx.setLineDash([8, 6]); ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(860, 105); ctx.lineTo(860, height - 20); ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#8A817A'; ctx.font = 'bold 11px "Cinzel", Georgia, serif';
            ctx.fillText('ATTENDING PHYSICIAN', 890, 150);
            ctx.fillStyle = '#480C14'; ctx.font = 'bold 18px "Playfair Display", Georgia, serif';
            ctx.fillText('DR. MEHEK MALIK', 890, 178);
            ctx.fillStyle = '#8A817A'; ctx.font = '12px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('M.D. (The Bride)', 890, 198);

            // Medical Stamp
            ctx.save(); ctx.translate(880, 260);
            ctx.strokeStyle = '#106636'; ctx.lineWidth = 2.5; ctx.strokeRect(0, 0, 240, 60);
            ctx.fillStyle = '#106636'; ctx.font = 'bold 14px "Cinzel", Georgia, serif';
            ctx.fillText('✓ MEDICALLY CERTIFIED', 14, 26);
            ctx.font = '12px "Plus Jakarta Sans", sans-serif';
            ctx.fillText('PRESCRIBED FOR CELEBRATIONS', 14, 46);
            ctx.restore();

            // Heartbeat Pulse Icon
            ctx.strokeStyle = '#A76571'; ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(890, 380); ctx.lineTo(940, 380); ctx.lineTo(955, 355); ctx.lineTo(970, 400); ctx.lineTo(985, 370); ctx.lineTo(1000, 385); ctx.lineTo(1015, 380); ctx.lineTo(1120, 380);
            ctx.stroke();

            ctx.fillStyle = '#A76571'; ctx.font = 'bold 13px "Cinzel", Georgia, serif';
            ctx.fillText('A SACRED LIFETIME VOYAGE OF LOVE & HEALTH', 50, 480);

            return canvas;
        }

        function sanitizeName(name) {
            return (name || 'VIP_Guest').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 24) || 'Guest';
        }

        const previewImg = document.getElementById('confirmed-pass-preview-img');
        const downloadPassLink = document.getElementById('download-pass-link');

        function triggerTicketGenerationAndDownload(data) {
            const isBride = data.side && data.side.includes('Bride');
            const canvas = isBride ? renderBridePrescriptionCanvas(data) : renderGroomBoardingPassCanvas(data);
            const fileName = isBride
                ? `Dr_Mehek_Wedding_Prescription_${sanitizeName(data.name)}.jpg`
                : `Mehek_Yogesh_Boarding_Pass_${sanitizeName(data.name)}.jpg`;

            const dataURL = canvas.toDataURL('image/jpeg', 0.95);

            // 1. Render in live preview image
            if (previewImg) {
                previewImg.src = dataURL;
            }

            // 2. Configure direct download anchor button
            if (downloadPassLink) {
                downloadPassLink.href = dataURL;
                downloadPassLink.download = fileName;
                downloadPassLink.setAttribute('download', fileName);
            }

            // 3. Trigger immediate download via Blob (Same-Origin & Server Compatible)
            if (canvas.toBlob) {
                canvas.toBlob((blob) => {
                    if (!blob) {
                        fallbackDataUrlDownload(dataURL, fileName);
                        return;
                    }
                    const blobUrl = URL.createObjectURL(blob);
                    const tempLink = document.createElement('a');
                    tempLink.style.display = 'none';
                    tempLink.href = blobUrl;
                    tempLink.download = fileName;
                    tempLink.setAttribute('download', fileName);
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    setTimeout(() => {
                        if (tempLink.parentNode) tempLink.parentNode.removeChild(tempLink);
                        URL.revokeObjectURL(blobUrl);
                    }, 1000);
                }, 'image/jpeg', 0.95);
            } else {
                fallbackDataUrlDownload(dataURL, fileName);
            }
        }

        function fallbackDataUrlDownload(dataURL, fileName) {
            try {
                const tempLink = document.createElement('a');
                tempLink.style.display = 'none';
                tempLink.href = dataURL;
                tempLink.download = fileName;
                tempLink.setAttribute('download', fileName);
                document.body.appendChild(tempLink);
                tempLink.click();
                setTimeout(() => {
                    if (tempLink.parentNode) tempLink.parentNode.removeChild(tempLink);
                }, 500);
            } catch (e) {
                console.error('Download error:', e);
            }
        }

        if (confirmBtn && nameInput) {
            confirmBtn.addEventListener('click', () => {
                const name = nameInput.value.trim();
                if (!name) {
                    nameInput.focus();
                    nameInput.style.borderColor = '#C88A94';
                    return;
                }

                const count = countSelect ? countSelect.value : '2';
                const wishes = wishesInput ? wishesInput.value.trim() : '';
                const checkedBoxes = document.querySelectorAll('input[name="ceremonies"]:checked');
                const ceremonies = Array.from(checkedBoxes).map(cb => cb.value).join(', ');
                const selectedSideRadio = document.querySelector('input[name="wedding_side"]:checked');
                const side = selectedSideRadio ? selectedSideRadio.value : 'Team Groom (Pilot)';

                lastRSVPData = {
                    name: name,
                    passengers: count,
                    side: side,
                    ceremonies: ceremonies,
                    wishes: wishes,
                    submittedAt: new Date().toLocaleString()
                };

                // 1. Save to Local Database
                let existingRSVPs = [];
                try {
                    existingRSVPs = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
                } catch (e) {
                    existingRSVPs = [];
                }
                existingRSVPs.push(lastRSVPData);
                localStorage.setItem('wedding_rsvps', JSON.stringify(existingRSVPs));

                // 2. Animate confirmation & generate image download synchronously
                if (rsvpForm) rsvpForm.style.display = 'none';
                if (confirmBox) confirmBox.classList.add('is-confirmed');

                const isBrideSide = side.includes('Bride');
                if (confirmedStamp) {
                    confirmedStamp.innerText = isBrideSide ? '✓ MEDICALLY PRESCRIBED' : 'CLEARED FOR BOARDING';
                    confirmedStamp.style.borderColor = isBrideSide ? '#A76571' : '#106636';
                    confirmedStamp.style.color = isBrideSide ? '#A76571' : '#106636';
                }
                if (confirmedTitle) {
                    confirmedTitle.innerText = isBrideSide ? "Doctor's Prescription Confirmed!" : "Boarding Pass Confirmed!";
                }

                if (guestNameDisplay) {
                    const ticketType = isBrideSide ? "Doctor's Wedding Wellness Prescription (℞)" : "First-Class Boarding Pass";
                    guestNameDisplay.innerHTML = `<strong>${name}</strong> (${count} Guest${count > 1 ? 's' : ''}), your <em>${ticketType}</em> is confirmed for: <br><em>${ceremonies}</em>.`;
                }

                // Synchronously generate and download ticket
                triggerTicketGenerationAndDownload(lastRSVPData);

                // 3. Direct Google Sheet / Cloud Sync (If configured)
                const webhookURL = (window.HOST_CONFIG && window.HOST_CONFIG.googleSheetWebhookURL) ? window.HOST_CONFIG.googleSheetWebhookURL : (window.WEDDING_CONFIG ? window.WEDDING_CONFIG.googleSheetWebhook : '');
                if (webhookURL) {
                    try {
                        fetch(webhookURL, {
                            method: 'POST',
                            mode: 'no-cors',
                            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                            body: JSON.stringify(lastRSVPData)
                        });
                    } catch (e) {}
                }
            });
        }
    }

    /* =========================================================================
       ACT 4: THE SINGLE CONTINUOUS HELICOPTER FLIGHT (ULTRA-SMOOTH GPU SCROLL TRACKER)
       ========================================================================= */
    function initSmoothHelicopterFlight() {
        const heli = document.getElementById('golden-heli');
        const path = document.getElementById('flight-trail-path');
        const svg = document.getElementById('flight-trail-svg');
        if (!heli || !path || !svg) return;

        let pathSamples = [];
        let totalPathLength = 0;
        let currentScreenX = null;
        let currentScreenY = null;
        let currentAngle = 0;

        function buildFlightPath() {
            const coupleSec = document.getElementById('couple');
            const ceremoniesSec = document.getElementById('ceremonies');
            const rsvpSec = document.getElementById('rsvp');
            const detailsSec = document.getElementById('details');
            const blessingSec = document.getElementById('blessing');

            const fullHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 7200);
            const fullWidth = window.innerWidth;
            svg.setAttribute('viewBox', `0 0 ${fullWidth} ${fullHeight}`);
            svg.style.height = `${fullHeight}px`;

            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            const marginL = Math.max(36, fullWidth * 0.06);
            const marginR = Math.min(fullWidth - 36, fullWidth * 0.94);
            const midX = fullWidth * 0.5;

            function getTop(el, fallback) {
                if (!el) return fallback;
                return el.getBoundingClientRect().top + scrollTop;
            }

            function getMid(el, fallback) {
                if (!el) return fallback;
                const r = el.getBoundingClientRect();
                return r.top + scrollTop + r.height * 0.5;
            }

            function getBottom(el, fallback) {
                if (!el) return fallback;
                return el.getBoundingClientRect().bottom + scrollTop;
            }

            const titleEl = document.querySelector('#couple .section-title') || document.querySelector('#couple .section-header');
            const startY = titleEl ? (titleEl.getBoundingClientRect().top + scrollTop - 30) : 520;

            const yCoupleMid = getMid(coupleSec, startY + 500);
            const yCoupleEnd = getBottom(coupleSec, startY + 1100);

            const yCeroMid = getMid(ceremoniesSec, yCoupleEnd + 1200);
            const yCeroEnd = getBottom(ceremoniesSec, yCoupleEnd + 2400);

            const yRsvpMid = getMid(rsvpSec, yCeroEnd + 500);
            const yDetailsMid = getMid(detailsSec, yRsvpMid + 700);
            const yBlessingEnd = getMid(blessingSec, fullHeight - 350);

            // 3 Broad, Majestic Arcs (Smooth, calm, regal trajectory)
            const d = `
                M ${marginR} ${startY}
                C ${marginR + 10} ${startY + (yCoupleMid - startY) * 0.5}, ${marginR} ${startY + (yCoupleMid - startY) * 0.8}, ${marginR - 20} ${yCoupleMid}
                C ${marginR - 40} ${yCoupleMid + (yCoupleEnd - yCoupleMid) * 0.4}, ${marginL + 20} ${yCoupleMid + (yCoupleEnd - yCoupleMid) * 0.6}, ${marginL} ${yCoupleEnd}
                C ${marginL - 10} ${yCoupleEnd + (yCeroMid - yCoupleEnd) * 0.4}, ${midX - 50} ${yCoupleEnd + (yCeroMid - yCoupleEnd) * 0.7}, ${midX + 60} ${yCeroMid}
                C ${marginR - 10} ${yCeroMid + (yCeroEnd - yCeroMid) * 0.3}, ${marginR} ${yCeroMid + (yCeroEnd - yCeroMid) * 0.7}, ${marginR - 15} ${yCeroEnd}
                C ${marginR - 30} ${yCeroEnd + (yRsvpMid - yCeroEnd) * 0.4}, ${marginL + 40} ${yCeroEnd + (yRsvpMid - yCeroEnd) * 0.6}, ${marginL + 20} ${yRsvpMid}
                C ${marginL} ${yRsvpMid + (yDetailsMid - yRsvpMid) * 0.5}, ${midX - 40} ${yRsvpMid + (yDetailsMid - yRsvpMid) * 0.8}, ${midX + 40} ${yDetailsMid}
                C ${marginR - 10} ${yDetailsMid + (yBlessingEnd - yDetailsMid) * 0.4}, ${marginR} ${yDetailsMid + (yBlessingEnd - yDetailsMid) * 0.8}, ${marginR - 20} ${yBlessingEnd}
            `;

            path.setAttribute('d', d);
            totalPathLength = path.getTotalLength();
        }

        window.addEventListener('resize', buildFlightPath);
        window.recalculateFlightPath = buildFlightPath;
        setTimeout(buildFlightPath, 350);
        setTimeout(buildFlightPath, 1500);

        function updateHelicopterPosition() {
            if (!totalPathLength || totalPathLength <= 0) {
                requestAnimationFrame(updateHelicopterPosition);
                return;
            }

            const scrollY = window.scrollY || window.pageYOffset;
            const viewportH = window.innerHeight;
            const docH = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - viewportH;
            
            // Normalized scroll progress from 0.0 (top) to 1.0 (bottom of page)
            const scrollProgress = Math.max(0, Math.min(1, scrollY / (docH || 1)));

            // Direct arc-length distance on the curve
            const targetDist = scrollProgress * totalPathLength;
            const pt = path.getPointAtLength(targetDist);
            const lookAheadDist = Math.min(targetDist + 18, totalPathLength);
            const nextPt = path.getPointAtLength(lookAheadDist);

            // Instantaneous velocity vector
            const dx = nextPt.x - pt.x;
            const dy = nextPt.y - pt.y;

            // Screen destination coordinates
            const destX = pt.x;
            const destY = pt.y - scrollY;

            // Smooth exponential lerp (cinematic flight inertia)
            if (currentScreenX === null || currentScreenY === null) {
                currentScreenX = destX;
                currentScreenY = destY;
                currentAngle = 0;
            } else {
                currentScreenX += (destX - currentScreenX) * 0.12;
                currentScreenY += (destY - currentScreenY) * 0.12;
                
                // Gentle banking tilt into turns (max ±14 deg)
                const turnFactor = dx / (Math.abs(dy) + Math.abs(dx) || 1);
                const targetTilt = turnFactor * 0.22;
                currentAngle += (targetTilt - currentAngle) * 0.08;
            }

            // Directional facing: if heading right, flip with scaleX(-1) so nose points forward
            const isFacingEast = dx >= 0;
            const scaleX = isFacingEast ? -1 : 1;
            const hoverFloat = Math.sin(Date.now() * 0.0025) * 2.2;

            heli.style.transform = `translate3d(${currentScreenX}px, ${currentScreenY + hoverFloat}px, 0) translate(-50%, -50%) scaleX(${scaleX}) rotate(${currentAngle}rad)`;

            requestAnimationFrame(updateHelicopterPosition);
        }

        requestAnimationFrame(updateHelicopterPosition);

        requestAnimationFrame(updateHelicopterPosition);
    }

    /* =========================================================================
       ACT 4: CALLIGRAPHY TYPING & REVEAL ANIMATIONS
       ========================================================================= */
    function initCalligraphyTyping() {
        const triggers = document.querySelectorAll('.type-trigger');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.typed) {
                    entry.target.dataset.typed = 'true';
                    typeText(entry.target);
                }
            });
        }, { threshold: 0.25 });

        triggers.forEach(el => observer.observe(el));

        function typeText(el) {
            const rawText = el.getAttribute('data-type-text') || el.innerText;
            const contentSpan = el.querySelector('.typed-content');
            if (!contentSpan) return;

            contentSpan.innerText = '';
            let idx = 0;

            function step() {
                if (idx < rawText.length) {
                    contentSpan.innerText += rawText.charAt(idx);
                    idx++;
                    setTimeout(step, 25 + Math.random() * 20);
                }
            }
            step();
        }
    }

    function triggerSiteReveals() {
        const reveals = document.querySelectorAll('[data-reveal]');
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                }
            });
        }, { threshold: 0.15 });

        reveals.forEach(el => obs.observe(el));
    }

    /* =========================================================================
       ACT 5: AMBIENT FLOATING PETALS CANVAS
       ========================================================================= */
    function initPetalsCanvas() {
        const canvas = document.getElementById('petals-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const petals = [];
        const numPetals = 20;

        for (let i = 0; i < numPetals; i++) {
            petals.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: 6 + Math.random() * 8,
                vx: (Math.random() - 0.5) * 0.4 + 0.2,
                vy: 0.5 + Math.random() * 0.8,
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 0.02,
                color: Math.random() > 0.4 ? 'rgba(200, 138, 148, 0.45)' : 'rgba(212, 175, 55, 0.4)'
            });
        }

        function loop() {
            ctx.clearRect(0, 0, width, height);

            for (let i = 0; i < petals.length; i++) {
                const p = petals[i];
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vrot;

                if (p.y > height + 20) {
                    p.y = -20;
                    p.x = Math.random() * width;
                }
                if (p.x > width + 20) p.x = -20;
                if (p.x < -20) p.x = width + 20;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            requestAnimationFrame(loop);
        }
        loop();
    }

    /* =========================================================================
       ACT 6: LIVE WEDDING COUNTDOWN CLOCK
       ========================================================================= */
    function initCountdown() {
        const weddingDate = new Date('December 12, 2026 19:30:00 GMT+0530').getTime();
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');

        function update() {
            const now = new Date().getTime();
            const diff = weddingDate - now;

            if (diff <= 0) {
                if (daysEl) daysEl.innerText = '00';
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            if (daysEl) daysEl.innerText = String(d).padStart(2, '0');
            if (hoursEl) hoursEl.innerText = String(h).padStart(2, '0');
            if (minutesEl) minutesEl.innerText = String(m).padStart(2, '0');
            if (secondsEl) secondsEl.innerText = String(s).padStart(2, '0');
        }

        update();
        setInterval(update, 1000);
    }

    /* =========================================================================
       ACT 7: MP3 BACKGROUND MUSIC ENGINE
       ========================================================================= */
    function initAudioEngine() {
        const audioEl = document.getElementById('wedding-audio');
        const audioBtn = document.getElementById('audio-btn');
        let isPlaying = false;

        function playMusic() {
            if (!audioEl) return;
            audioEl.volume = 0.65;
            const playPromise = audioEl.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlaying = true;
                    if (audioBtn) audioBtn.classList.add('is-playing');
                }).catch((err) => {
                    // Browser autoplay policy requires user interaction first
                    console.log('Audio autoplay pending user interaction:', err?.message || err);
                });
            }
        }

        function pauseMusic() {
            if (!audioEl) return;
            audioEl.pause();
            isPlaying = false;
            if (audioBtn) audioBtn.classList.remove('is-playing');
        }

        // Global User Interaction Unlock (Browser Autoplay Compliance)
        const unlockAudio = () => {
            if (!isPlaying) {
                playMusic();
            }
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('touchstart', unlockAudio);
            document.removeEventListener('pointerdown', unlockAudio);
        };
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('touchstart', unlockAudio, { once: true });
        document.addEventListener('pointerdown', unlockAudio, { once: true });

        window.audioEngine = {
            start: playMusic,
            stop: pauseMusic,
            pause: pauseMusic,
            toggle: () => {
                if (isPlaying) pauseMusic();
                else playMusic();
            }
        };

        if (audioBtn) {
            audioBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isPlaying) {
                    pauseMusic();
                } else {
                    playMusic();
                }
            });
        }
    }

})();
