const n=`<!DOCTYPE html>\r
<html lang="en">\r
<head>\r
    <meta charset="UTF-8">\r
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\r
    <meta name="description" content="Contact ApexGutters for a free gutter installation, repair, or maintenance quote.">\r
    <title>Contact Us | ApexGutters</title>\r
    <link rel="preconnect" href="https://fonts.googleapis.com">\r
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\r
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">\r
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">\r
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\r
    <link rel="stylesheet" href="assets/site-shell.css?v=marquee-motion-20261009">\r
    <style>\r
        :root {\r
            --contact-orange: #f36b21;\r
            --contact-ink: #202326;\r
            --contact-text: #5d6268;\r
            --contact-border: #e7e7e4;\r
            --contact-surface: #f6f6f4;\r
        }\r
\r
        body {\r
            color: var(--contact-text);\r
            font-family: Manrope, sans-serif;\r
        }\r
\r
        .contact-hero {\r
            padding: 76px 0 64px;\r
            background: linear-gradient(120deg, #202326 0%, #34383c 100%);\r
            color: #fff;\r
        }\r
\r
        .contact-eyebrow {\r
            color: #ff9a60;\r
            font-size: .82rem;\r
            font-weight: 800;\r
            letter-spacing: .12em;\r
            text-transform: uppercase;\r
        }\r
\r
        .contact-hero h1 {\r
            max-width: 720px;\r
            margin: 12px 0;\r
            color: #fff;\r
            font-size: clamp(2.2rem, 5vw, 3.5rem);\r
            font-weight: 800;\r
            letter-spacing: -.04em;\r
        }\r
\r
        .contact-hero p {\r
            max-width: 650px;\r
            margin: 0;\r
            color: #d2d5d7;\r
            font-size: 1.08rem;\r
        }\r
\r
        .contact-section {\r
            padding: 72px 0 88px;\r
        }\r
\r
        .contact-form-card,\r
        .contact-info-card {\r
            height: 100%;\r
            padding: clamp(24px, 4vw, 40px);\r
            border: 1px solid var(--contact-border);\r
            border-radius: 16px;\r
            background: #fff;\r
            box-shadow: 0 8px 30px rgba(20, 25, 30, .07);\r
        }\r
\r
        .contact-form-card h2,\r
        .contact-info-card h2 {\r
            color: var(--contact-ink);\r
            font-size: 1.5rem;\r
            font-weight: 800;\r
            letter-spacing: -.03em;\r
        }\r
\r
        .contact-field-label {\r
            display: block;\r
            margin-bottom: 7px;\r
            color: var(--contact-ink);\r
            font-size: .88rem;\r
            font-weight: 700;\r
        }\r
\r
        .contact-field {\r
            width: 100%;\r
            min-height: 50px;\r
            padding: 12px 14px;\r
            border: 1px solid var(--contact-border);\r
            border-radius: 6px;\r
            color: var(--contact-ink);\r
            background: #fff;\r
            font: inherit;\r
            font-size: .94rem;\r
        }\r
\r
        textarea.contact-field {\r
            min-height: 130px;\r
            resize: vertical;\r
        }\r
\r
        .contact-field:focus {\r
            border-color: var(--contact-orange);\r
            outline: 0;\r
            box-shadow: 0 0 0 3px rgba(243, 107, 33, .15);\r
        }\r
\r
        .contact-submit {\r
            display: inline-flex;\r
            min-height: 50px;\r
            align-items: center;\r
            justify-content: center;\r
            gap: 10px;\r
            padding: 12px 22px;\r
            border: 1px solid var(--contact-orange);\r
            border-radius: 7px;\r
            color: #fff;\r
            background: var(--contact-orange);\r
            font: inherit;\r
            font-weight: 800;\r
            transition: background .2s ease, border-color .2s ease;\r
        }\r
\r
        .contact-submit:hover {\r
            border-color: #d95412;\r
            background: #d95412;\r
        }\r
\r
        .contact-submit:disabled {\r
            cursor: wait;\r
            opacity: .7;\r
        }\r
\r
        .contact-detail {\r
            display: flex;\r
            align-items: flex-start;\r
            gap: 14px;\r
            margin-top: 24px;\r
        }\r
\r
        .contact-detail-icon {\r
            display: grid;\r
            width: 42px;\r
            height: 42px;\r
            flex: 0 0 42px;\r
            place-items: center;\r
            border-radius: 50%;\r
            color: var(--contact-orange);\r
            background: rgba(243, 107, 33, .1);\r
        }\r
\r
        .contact-detail strong {\r
            display: block;\r
            margin-bottom: 3px;\r
            color: var(--contact-ink);\r
        }\r
\r
        .contact-detail a {\r
            color: var(--contact-text);\r
            text-decoration: none;\r
        }\r
\r
        .contact-detail a:hover {\r
            color: var(--contact-orange);\r
        }\r
\r
        .contact-promise {\r
            margin-top: 30px;\r
            padding: 18px;\r
            border-radius: 8px;\r
            background: var(--contact-surface);\r
            color: var(--contact-text);\r
            font-size: .9rem;\r
        }\r
\r
        .contact-promise i {\r
            margin-right: 8px;\r
            color: var(--contact-orange);\r
        }\r
\r
        .contact-feedback {\r
            margin: 12px 0 0;\r
            font-size: .9rem;\r
        }\r
\r
        .contact-feedback.is-success { color: #187848; }\r
        .contact-feedback.is-error { color: #b42318; }\r
\r
        @media (max-width: 767.98px) {\r
            .contact-hero { padding: 56px 0 48px; }\r
            .contact-section { padding: 48px 0 60px; }\r
        }\r
    </style>\r
</head>\r
<body>\r
    <div class="site-topbar" aria-hidden="true"></div>\r
    <nav class="navbar site-navbar" aria-label="Main navigation"></nav>\r
\r
    <main>\r
        <section class="contact-hero">\r
            <div class="container">\r
                <span class="contact-eyebrow">We’re ready to help</span>\r
                <h1>Let’s protect your home from the next storm.</h1>\r
                <p>Tell us what you need and our gutter specialists will get back to you to discuss the right solution for your home.</p>\r
            </div>\r
        </section>\r
\r
        <section class="contact-section" aria-labelledby="contact-heading">\r
            <div class="container">\r
                <div class="row g-4 g-xl-5">\r
                    <div class="col-lg-7" id="contact-form">\r
                        <div class="contact-form-card">\r
                            <h2 id="contact-heading">Request a free quote</h2>\r
                            <p class="mb-4">Share a few details and our team will follow up shortly.</p>\r
                            <form data-api-form="quote" data-email-required="true">\r
                                <div class="row g-3">\r
                                    <div class="col-md-6">\r
                                        <label class="contact-field-label" for="contactName">Full name</label>\r
                                        <input class="contact-field" id="contactName" name="name" type="text" autocomplete="name" minlength="2" maxlength="100" required>\r
                                    </div>\r
                                    <div class="col-md-6">\r
                                        <label class="contact-field-label" for="contactEmail">Email address</label>\r
                                        <input class="contact-field" id="contactEmail" name="email" type="email" autocomplete="email" maxlength="254" required>\r
                                    </div>\r
                                    <div class="col-md-6">\r
                                        <label class="contact-field-label" for="contactPhone">Phone number</label>\r
                                        <input class="contact-field" id="contactPhone" name="phone" type="tel" autocomplete="tel" minlength="7" maxlength="40" required>\r
                                    </div>\r
                                    <div class="col-md-6">\r
                                        <label class="contact-field-label" for="contactService">Service needed</label>\r
                                        <select class="contact-field" id="contactService" name="service" required>\r
                                            <option value="">Choose a service</option>\r
                                            <option>Seamless gutter installation</option>\r
                                            <option>Gutter repair or replacement</option>\r
                                            <option>Gutter cleaning and inspection</option>\r
                                            <option>Leaf guard protection</option>\r
                                            <option>Downspout and drainage solutions</option>\r
                                            <option>Other gutter service</option>\r
                                        </select>\r
                                    </div>\r
                                    <div class="col-12">\r
                                        <label class="contact-field-label" for="contactMessage">How can we help? <span class="fw-normal">(optional)</span></label>\r
                                        <textarea class="contact-field" id="contactMessage" name="message" maxlength="3000" placeholder="Tell us a little about your project"></textarea>\r
                                    </div>\r
                                    <div class="col-12">\r
                                        <button class="contact-submit" type="submit">\r
                                            Send Request <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>\r
                                        </button>\r
                                        <p class="contact-feedback" data-form-feedback role="status" aria-live="polite" hidden></p>\r
                                    </div>\r
                                </div>\r
                            </form>\r
                        </div>\r
                    </div>\r
\r
                    <aside class="col-lg-5" aria-label="Contact information">\r
                        <div class="contact-info-card">\r
                            <h2>Talk to a gutter specialist</h2>\r
                            <p>Prefer to speak with someone? Give us a call or send us an email.</p>\r
                            <div class="contact-detail">\r
                                <span class="contact-detail-icon"><i class="fa-solid fa-phone" aria-hidden="true"></i></span>\r
                                <div><strong>Call our team</strong><a href="tel:18884887767">(888) 488-7767</a></div>\r
                            </div>\r
                            <div class="contact-detail">\r
                                <span class="contact-detail-icon"><i class="fa-solid fa-envelope" aria-hidden="true"></i></span>\r
                                <div><strong>Email us</strong><a href="mailto:info@apexgutters.com">info@apexgutters.com</a></div>\r
                            </div>\r
                            <div class="contact-detail">\r
                                <span class="contact-detail-icon"><i class="fa-solid fa-clock" aria-hidden="true"></i></span>\r
                                <div><strong>Business hours</strong><span>Monday – Saturday, 7:00 AM – 6:00 PM</span></div>\r
                            </div>\r
                            <div class="contact-promise"><i class="fa-solid fa-circle-check" aria-hidden="true"></i>Free estimates, no pressure, and a real local team ready to help.</div>\r
                        </div>\r
                    </aside>\r
                </div>\r
            </div>\r
        </section>\r
    </main>\r
\r
    <footer class="site-footer"></footer>\r
    <script src="assets/backend.js"><\/script>\r
    <script src="assets/shared-shell.js?v=navbar-breakpoints-20261009"><\/script>\r
    <script src="assets/motion.js?v=motion-1"><\/script>\r
</body>\r
</html>\r
`;export{n as default};
